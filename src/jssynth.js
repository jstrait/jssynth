"use strict";

var JSSynth = JSSynth || {};

JSSynth.Track = function(instrument, sequence, isMuted) {
  var track = {};

  track.instrument = instrument; 
  track.sequence   = sequence;
  track.isMuted    = isMuted;

  track.setNotes = function(newNotes) {
    track.sequence = JSSynth.SequenceParser.parse(newNotes);
  };

  track.reset = function(newCurrentTime) {
    sequenceIndex = 0;
    finishedPlaying = false;
    currentTime = newCurrentTime;
  };

  track.getIsMuted = function() {
    return track.isMuted;
  };

  track.setIsMuted = function(newIsMuted) {
    track.isMuted = newIsMuted;
  };

  track.finishedPlaying = function() { return finishPlaying; }

  track.tick = function(endTime, stepDuration, loop) {
    var note, noteTimeDuration;

    while (currentTime < endTime) {
      note = track.sequence[sequenceIndex];
      noteTimeDuration = stepDuration * note.stepDuration;
      
      if (!track.isMuted) {
        track.instrument.playNote(note, currentTime, currentTime + noteTimeDuration);
      }

      sequenceIndex += 1;
      if (sequenceIndex >= track.sequence.length) {
        if (loop) {
          sequenceIndex = 0;
        }
        else {
          finishedPlaying = true;
          return;
        }
      }

      currentTime += stepDuration;
    }
  };

  var sequenceIndex;
  var currentTime;
  var finishedPlaying;

  track.reset();
  return track;
};

JSSynth.Instrument = function(audioContext, config) {
  var buildOscillator = function(waveform, frequency) {
    var oscillator = audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.value = frequency;
 
    return oscillator;
  };

  var buildGain = function(amplitude) {
    var gain = audioContext.createGain();
    gain.gain.value = amplitude;

    return gain;
  };

  var buildFilter = function(frequency, resonance) {
    var filter = audioContext.createBiquadFilter();
    filter.frequency.value = frequency;
    filter.Q.value = resonance;

    return filter;
  };

  var instrument = {};

  instrument.playNote = function(note, gateOnTime, gateOffTime) {
    if (note.frequency > 0.0) {
      // Base sound generator
      var oscillator = buildOscillator(config.waveform, note.frequency);

      // LFO for base sound
      var pitchLfoOscillator = buildOscillator(config.lfo.waveform, config.lfo.frequency);
      var pitchLfoGain = buildGain(config.lfo.amplitude);
      pitchLfoOscillator.connect(pitchLfoGain);
      pitchLfoGain.connect(oscillator.frequency);

      // Filter
      var filter = buildFilter(config.filter.cutoff, config.filter.resonance);
      var filterLfoOscillator = buildOscillator(config.filter.lfo.waveform, config.filter.lfo.frequency);
      // The amplitude is constrained to be at most the same as the cutoff frequency, to prevent
      // pops/clicks.
      var filterLfoGain = buildGain(Math.min(config.filter.cutoff, config.filter.lfo.amplitude));
      filterLfoOscillator.connect(filterLfoGain);
      filterLfoGain.connect(filter.frequency);

      // Master Gain
      var masterGain = audioContext.createGain();

      oscillator.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(audioContext.destination);

      oscillator.start(gateOnTime);
      pitchLfoOscillator.start(gateOnTime);
      filterLfoOscillator.start(gateOnTime);

      var calculatedEnvelope = JSSynth.EnvelopeCalculator.calculate(config.amplitude, config.envelope, gateOnTime, gateOffTime);

      // Envelope Attack
      masterGain.gain.setValueAtTime(0.0, gateOnTime);
      masterGain.gain.linearRampToValueAtTime(calculatedEnvelope.attackEndAmplitude, calculatedEnvelope.attackEndTime);

      // Envelope Decay/Sustain
      if (calculatedEnvelope.attackEndTime < gateOffTime) {
        masterGain.gain.linearRampToValueAtTime(calculatedEnvelope.delayEndAmplitude, calculatedEnvelope.delayEndTime);
      }

      // Envelope Release
      var releaseEndTime = Math.max(gateOffTime + 0.001, gateOffTime + config.envelope.release);
      masterGain.gain.linearRampToValueAtTime(0.0, releaseEndTime);

      oscillator.stop(releaseEndTime);
      pitchLfoOscillator.stop(releaseEndTime);
      filterLfoOscillator.stop(releaseEndTime);
    }
  };

  return instrument;
};

JSSynth.EnvelopeCalculator = {
  calculate: function(baseAmplitude, envelope, gateOnTime, gateOffTime) {
    var attackEndTime = gateOnTime + envelope.attack;
    var attackEndAmplitude;
    var delayEndAmplitudePercentage;

    if (attackEndTime < gateOffTime) {
      attackEndAmplitude = baseAmplitude;
    }
    else {
      var attackEndAmplitudePercentage = ((gateOffTime - gateOnTime) / (attackEndTime - gateOnTime));
      attackEndAmplitude = baseAmplitude * attackEndAmplitudePercentage; 
      attackEndTime = gateOffTime;
    }

    var delayEndTime = attackEndTime + envelope.decay;
    var targetAmplitudeAfterDecayEnds = baseAmplitude * envelope.sustain;
    var decayEndAmplitude;
    if (gateOffTime > delayEndTime) {
      decayEndAmplitude = targetAmplitudeAfterDecayEnds;
    }
    else {
      delayEndAmplitudePercentage = ((gateOffTime - attackEndTime) / (delayEndTime - attackEndTime));
      delayEndTime = gateOffTime;

      var delta = attackEndAmplitude - targetAmplitudeAfterDecayEnds;
      decayEndAmplitude = attackEndAmplitude - (delta * delayEndAmplitudePercentage);
    }

    return {
      attackEndTime: attackEndTime,
      attackEndAmplitude: attackEndAmplitude,
      delayEndTime: delayEndTime,
      delayEndAmplitude: decayEndAmplitude,
    };
  },
};

JSSynth.Transport = function(audioContext, tracks, stopCallback) {
  var SCHEDULE_AHEAD_TIME = 0.2;  // in seconds
  var TICK_INTERVAL = 50;         // in milliseconds

  function tick() {
    var finalTime = audioContext.currentTime + SCHEDULE_AHEAD_TIME;

    tracks.forEach(function(track) {
      track.tick(finalTime, transport.stepInterval, transport.loop);
    });

    if (!tracks.some(function(track) { return track.finishedPlaying; })) {
      stop();
      window.setTimeout(stopCallback, transport.stepInterval * 1000);
    }
  };

  function start() {
    tracks.forEach(function(track) {
      track.reset(audioContext.currentTime);
    });

    tick();
    timeoutId = window.setInterval(tick, TICK_INTERVAL);
    playing = true;
  };

  function stop() {
    window.clearInterval(timeoutId);
    playing = false;
  };

  var timeoutId;
  var playing = false;


  var transport = {};

  transport.setTempo = function(newTempo) {
    transport.tempo = newTempo;

    var sixteenthsPerMinute = transport.tempo * 4;
    transport.stepInterval = 60.0 / sixteenthsPerMinute;
  };

  transport.toggle = function() {
    if (playing) {
      stop();
    }
    else {
      start();
    }
  };

  transport.loop = true;
  transport.setTempo(100);

  return transport;
};


JSSynth.OfflineTransport = function(offlineAudioContext, tracks, filename, completeCallback) {
  var transport = {};

  offlineAudioContext.oncomplete = function(e) {
    var rawFloat32SampleData = e.renderedBuffer.getChannelData(0);
    var i;

    var sampleDataByteCount = rawFloat32SampleData.length * 2;
    var fileLength = 44 + sampleDataByteCount;
    var outputBuffer = new ArrayBuffer(fileLength);
    var outputView = new DataView(outputBuffer);

    // Double check these should be little endian (i.e., true)
    outputView.setUint8(0, "R".charCodeAt(0), true);
    outputView.setUint8(1, "I".charCodeAt(0), true);
    outputView.setUint8(2, "F".charCodeAt(0), true);
    outputView.setUint8(3, "F".charCodeAt(0), true);
    outputView.setUint32(4, 36 + sampleDataByteCount, true);
    outputView.setUint8(8,  "W".charCodeAt(0), true);
    outputView.setUint8(9,  "A".charCodeAt(0), true);
    outputView.setUint8(10,  "V".charCodeAt(0), true);
    outputView.setUint8(11, "E".charCodeAt(0), true);
    outputView.setUint8(12,  "f".charCodeAt(0), true);
    outputView.setUint8(13,  "m".charCodeAt(0), true);
    outputView.setUint8(14,  "t".charCodeAt(0), true);
    outputView.setUint8(15, " ".charCodeAt(0), true);
    outputView.setUint32(16, 16, true);
    outputView.setUint16(20, 1, true);   // Audio code, i.e. 1 for PCM
    outputView.setUint16(22, 1, true);   // Num Channels
    outputView.setUint32(24, 44100, true);  // Sample rate
    outputView.setUint32(28, 88200, true);  // Byte rate (block_align * sample_rate)
    outputView.setUint16(32, 2, true);  // Block align (bits_per_sample / 8) * channels
    outputView.setUint16(34, 16, true);  // Bits per sample
    outputView.setUint8(36, "d".charCodeAt(0), true);
    outputView.setUint8(37, "a".charCodeAt(0), true);
    outputView.setUint8(38, "t".charCodeAt(0), true);
    outputView.setUint8(39, "a".charCodeAt(0), true);
    outputView.setUint32(40, sampleDataByteCount, true);

    for (i = 0; i < rawFloat32SampleData.length; i++) {
      // Should this round?
      outputView.setInt16(44 + (i * 2), rawFloat32SampleData[i] * 32767.0, true);
    }

    var blob = new Blob([outputView], { type: 'audio/wav' });
    var url  = window.URL.createObjectURL(blob);
    document.getElementById("downloaded-file").src = url;

    var hiddenDownloadLink = document.getElementById("hidden-download-link");
    hiddenDownloadLink.download = filename + ".wav";
    hiddenDownloadLink.href = url;
    hiddenDownloadLink.click();

    window.URL.revokeObjectURL(blob);
  };

  transport.tick = function() {
    var t, n;
    var note, noteTimeDuration;
    var track, sequence;

    var startTime = offlineAudioContext.currentTime;

    for (t = 0; t < tracks.length; t++) {
      track = tracks[t];
      sequence = track.sequence;
      var nextNoteTime = startTime;

      for (n = 0; n < sequence.length; n++) {
        note = sequence[n];
        noteTimeDuration = transport.stepInterval * note.stepDuration;
        if (!track.getIsMuted()) {
          track.instrument.playNote(note, nextNoteTime, nextNoteTime + noteTimeDuration);
        }

        nextNoteTime += noteTimeDuration;
      }
    }

    offlineAudioContext.startRendering();
  };

  transport.setTempo = function(newTempo) {
    transport.tempo = newTempo;

    var sixteenthsPerMinute = transport.tempo * 4;
    transport.stepInterval = 60.0 / sixteenthsPerMinute;
  };

  transport.setTempo(100);

  return transport;
};


JSSynth.SequenceParser = {
  parse: function(rawNotes) {
    var i, j;
    var noteName = null, octave = null;
    var sequence = [];
    var splitNotes = rawNotes.split(" ");

    var inProgressNoteDuration = 1;
    for (i = 0; i < splitNotes.length; i++) {
      if (splitNotes[i] === "-") {
        inProgressNoteDuration += 1;
      }
      else {
        if (noteName !== null) {
          sequence.push(new JSSynth.Note(noteName, octave, inProgressNoteDuration));
          for (j = 0; j < (inProgressNoteDuration - 1); j++) {
            sequence.push(new JSSynth.Note("", null, 1));
          }
        }

        noteName = splitNotes[i].slice(0, -1);
        octave = splitNotes[i].slice(-1);
        inProgressNoteDuration = 1;
      }
    }

    sequence.push(new JSSynth.Note(noteName, octave, inProgressNoteDuration));
    for (j = 0; j < (inProgressNoteDuration - 1); j++) {
      sequence.push(new JSSynth.Note("", null, 1));
    }

    return sequence;
  },
};

JSSynth.Note = function(noteName, octave, stepDuration) {
  var calculateFrequency = function(noteName, octave) {
    noteName = JSSynth.MusicTheory.ENHARMONIC_EQUIVALENTS[noteName];
    var octaveMultiplier = Math.pow(2.0, (octave - JSSynth.MusicTheory.MIDDLE_OCTAVE));
    var frequency = JSSynth.MusicTheory.NOTE_RATIOS[noteName] * JSSynth.MusicTheory.MIDDLE_A_FREQUENCY * octaveMultiplier;

    return frequency;
  };

  var note = {};

  note.noteName = noteName;
  note.octave = parseInt(octave, 10);
  note.stepDuration = parseInt(stepDuration, 10);
  note.frequency = calculateFrequency(note.noteName, note.octave);

  return note;
};

JSSynth.MusicTheory = {
  NOTE_RATIOS: {
    "A"  : 1.0,
    "A#" : 16.0 / 15.0,
    "B"  : 9.0 / 8.0,
    "C"  : 6.0 / 5.0,
    "C#" : 5.0 / 4.0,
    "D"  : 4.0 / 3.0,
    "D#" : 45.0 / 32.0,
    "E"  : 3.0 / 2.0,
    "F"  : 8.0 / 5.0,
    "F#" : 5.0 / 3.0,
    "G"  : 9.0 / 5.0,
    "G#" : 15.0 / 8.0
  },

  ENHARMONIC_EQUIVALENTS: {
    "A"   : "A",
    "G##" : "A",
    "Bbb" : "A",
    
    "A#"  : "A#",
    "Bb"  : "A#",
    "Cbb" : "A#",
    
    "B"   : "B",
    "A##" : "B",
    "Cb"  : "B",
    
    "C"   : "C",
    "B#"  : "C",
    "Dbb" : "C",
    
    "C#"  : "C#",
    "B##" : "C#",
    "Db"  : "C#",
    
    "D"   : "D",
    "C##" : "D",
    "Ebb" : "D",
    
    "D#"  : "D#",
    "Eb"  : "D#",
    "Fbb" : "D#",
    
    "E"   : "E",
    "D##" : "E",
    "Fb"  : "E",
    
    "F"   : "F",
    "E#"  : "F",
    "Gbb" : "F",
    
    "F#"  : "F#",
    "E##" : "F#",
    "Gb"  : "F#",
    
    "G"   : "G",
    "F##" : "G",
    "Abb" : "G",
    
    "G#"  : "G#",
    "Ab"  : "G#"
  },

  MIDDLE_OCTAVE: 4,
  MIDDLE_A_FREQUENCY: 440.0,
};
