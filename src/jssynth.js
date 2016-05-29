"use strict";

var JSSynth = JSSynth || {};

JSSynth.Instrument = function(config) {
  var buildOscillator = function(audioContext, waveform, frequency) {
    var oscillator = audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.value = frequency;
 
    return oscillator;
  };

  var buildGain = function(audioContext, amplitude) {
    var gain = audioContext.createGain();
    gain.gain.value = amplitude;

    return gain;
  };

  var buildFilter = function(audioContext, frequency, resonance) {
    var filter = audioContext.createBiquadFilter();
    filter.frequency.value = frequency;
    filter.Q.value = resonance;

    return filter;
  };

  var instrument = {};

  instrument.playNote = function(audioContext, audioDestination, note, amplitude, gateOnTime, gateOffTime) {
    if (note.frequency() > 0.0) {
      // Base sound generator
      var oscillator = buildOscillator(audioContext, config.waveform, note.frequency());

      // LFO for base sound
      var pitchLfoOscillator = buildOscillator(audioContext, config.lfo.waveform, config.lfo.frequency);
      var pitchLfoGain = buildGain(audioContext, config.lfo.amplitude);
      pitchLfoOscillator.connect(pitchLfoGain);
      pitchLfoGain.connect(oscillator.frequency);

      // Filter
      var filter = buildFilter(audioContext, config.filter.cutoff, config.filter.resonance);
      var filterLfoOscillator = buildOscillator(audioContext, config.filter.lfo.waveform, config.filter.lfo.frequency);
      // The amplitude is constrained to be at most the same as the cutoff frequency, to prevent
      // pops/clicks.
      var filterLfoGain = buildGain(audioContext, Math.min(config.filter.cutoff, config.filter.lfo.amplitude));
      filterLfoOscillator.connect(filterLfoGain);
      filterLfoGain.connect(filter.frequency);

      // Master Gain
      var masterGain = audioContext.createGain();

      oscillator.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(audioDestination);

      oscillator.start(gateOnTime);
      pitchLfoOscillator.start(gateOnTime);
      filterLfoOscillator.start(gateOnTime);

      var calculatedEnvelope = JSSynth.EnvelopeCalculator.calculate(amplitude, config.envelope, gateOnTime, gateOffTime);

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


JSSynth.Pattern = function() {
  var pattern = {};

  var tracks = [];
  var stepCount = 0;

  pattern.tracks = function() { return tracks; };
  pattern.stepCount = function() { return stepCount; };

  pattern.replaceTracks = function(newTracks) {
    tracks = newTracks;

    var maxLength = 0;
    tracks.forEach(function(track) {
      if (track.sequence().length > maxLength) {
        maxLength = track.sequence().length;
      }
    });
    stepCount = maxLength;
  };

  return pattern;
};


JSSynth.SongPlayer = function(patterns) {
  var patternIndex;
  var sequenceIndex;
  var isFinishedPlaying;
  var currentTime;

  var songPlayer = {};

  songPlayer.reset = function(newCurrentTime) {
    patternIndex = 0;
    sequenceIndex = 0;
    isFinishedPlaying = false;
    currentTime = newCurrentTime;
  };

  songPlayer.stepCount = function() {
    var stepCount = 0;

    patterns.forEach(function(pattern) {
      stepCount += pattern.stepCount();
    });

    return stepCount;
  };

  songPlayer.isFinishedPlaying = function() { return isFinishedPlaying; }

  songPlayer.replacePatterns = function(newPatterns) {
    patterns = newPatterns;
  };

  songPlayer.tick = function(audioContext, audioDestination, endTime, stepDuration, loop) {
    var note, noteTimeDuration;

    var pattern = patterns[patternIndex];

    while (currentTime < endTime) {
      pattern.tracks().forEach(function(track) {
        note = track.sequence()[sequenceIndex];
        noteTimeDuration = stepDuration * note.stepDuration();

        if (!track.isMuted()) {
          track.instrument().playNote(audioContext, audioDestination, note, track.amplitude(), currentTime, currentTime + noteTimeDuration);
        }
      });

      sequenceIndex += 1;
      if (sequenceIndex >= pattern.stepCount()) {
        patternIndex += 1;
        sequenceIndex = 0;

        if (patternIndex >= patterns.length) {
          if (loop) {
            patternIndex = 0;
          }
          else {
            isFinishedPlaying = true;
            return;
          }
        }

        pattern = patterns[patternIndex];
      }

      currentTime += stepDuration;
    }
  };

  songPlayer.reset();

  return songPlayer;
};


JSSynth.Track = function(instrument, sequence, isMuted) {
  var track = {};

  track.instrument = function() { return instrument; };
  track.amplitude  = function() { return 1.0; };
  track.sequence   = function() { return sequence; };
  track.isMuted    = function() { return isMuted; };

  return track;
};


JSSynth.SequenceParser = {
  parse: function(rawNotes) {
    var i;
    var noteName = null, octave = null;
    var sequence = [];
    var splitNotes = rawNotes.split(" ");

    var addNote = function(noteName, octave, duration) {
      sequence.push(new JSSynth.Note(noteName, octave, duration));
      for (i = 0; i < (duration - 1); i++) {
        sequence.push(new JSSynth.Note("", null, 1));
      }
    };

    var inProgressNoteDuration = 1;
    splitNotes.forEach(function(note) {
      if (note === "-") { 
        if (noteName !== null) {
          inProgressNoteDuration += 1;
        }
        else {
          // If an unattached '-', treat it the same as ' '
          inProgressNoteDuration = 1;
          addNote("", null, 1);
        }
      }
      else if (note === "") {
        if (noteName !== null) {
          addNote(noteName, octave, inProgressNoteDuration);
        }
        addNote("", null, 1);

        inProgressNoteDuration = 1;
        noteName = null;
        octave = null;
      }
      else {
        if (noteName !== null) {
          addNote(noteName, octave, inProgressNoteDuration);
        }

        noteName = note.slice(0, -1);
        octave = note.slice(-1);
        inProgressNoteDuration = 1;
      }
    });

    if (noteName !== null) {
      addNote(noteName, octave, inProgressNoteDuration);
    }

    return sequence;
  },
};

JSSynth.Note = function(newNoteName, newOctave, newStepDuration) {
  var calculateFrequency = function(noteName, octave) {
    noteName = JSSynth.MusicTheory.ENHARMONIC_EQUIVALENTS[noteName];
    var octaveMultiplier = Math.pow(2.0, (octave - JSSynth.MusicTheory.MIDDLE_OCTAVE));
    var frequency = JSSynth.MusicTheory.NOTE_RATIOS[noteName] * JSSynth.MusicTheory.MIDDLE_A_FREQUENCY * octaveMultiplier;

    return frequency;
  };

  var noteName = newNoteName;
  var octave = parseInt(newOctave, 10);
  var stepDuration = parseInt(newStepDuration, 10);
  var frequency = calculateFrequency(noteName, octave);

  var note = {};

  note.name         = function() { return noteName; };
  note.octave       = function() { return octave; };
  note.stepDuration = function() { return stepDuration; };
  note.frequency    = function() { return frequency; };

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

JSSynth.WaveWriter = function() {
  var waveWriter = {};

  var LITTLE_ENDIAN = true;
  var AUDIO_FORMAT_CODE = 1;  // I.e., PCM
  var NUM_CHANNELS = 1;
  var BITS_PER_SAMPLE = 16;
  var BYTES_PER_SAMPLE = 2;
  var SAMPLE_RATE = 44100;

  var BLOCK_ALIGN = (BITS_PER_SAMPLE / 8) * NUM_CHANNELS;
  var BYTE_RATE = BLOCK_ALIGN * SAMPLE_RATE;

  var WAVEFILE_HEADER_BYTE_COUNT = 44;

  waveWriter.write = function(rawFloat32SampleData, scaleFactor) {
    var sampleDataByteCount = rawFloat32SampleData.length * BYTES_PER_SAMPLE;
    var fileLength = WAVEFILE_HEADER_BYTE_COUNT + sampleDataByteCount;
    var outputView = new DataView(new ArrayBuffer(fileLength));
    var i;

    outputView.setUint8(  0, "R".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8(  1, "I".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8(  2, "F".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8(  3, "F".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint32( 4, 36 + sampleDataByteCount, LITTLE_ENDIAN);
    outputView.setUint8(  8, "W".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8(  9, "A".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 10, "V".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 11, "E".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 12, "f".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 13, "m".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 14, "t".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 15, " ".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint32(16, 16, LITTLE_ENDIAN);
    outputView.setUint16(20, AUDIO_FORMAT_CODE, LITTLE_ENDIAN);
    outputView.setUint16(22, NUM_CHANNELS, LITTLE_ENDIAN);
    outputView.setUint32(24, SAMPLE_RATE, LITTLE_ENDIAN);
    outputView.setUint32(28, BYTE_RATE, LITTLE_ENDIAN);
    outputView.setUint16(32, BLOCK_ALIGN, LITTLE_ENDIAN);
    outputView.setUint16(34, BITS_PER_SAMPLE, LITTLE_ENDIAN);
    outputView.setUint8( 36, "d".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 37, "a".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 38, "t".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 39, "a".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint32(40, sampleDataByteCount, LITTLE_ENDIAN);

    var maxSampleValue = scaleFactor * 32767.0;
    // Float32Array doesn't appear to support forEach() in Safari 9
    for (i = 0; i < rawFloat32SampleData.length; i++) {
      // Should this round?
      outputView.setInt16(WAVEFILE_HEADER_BYTE_COUNT + (i * BYTES_PER_SAMPLE), rawFloat32SampleData[i] * maxSampleValue, LITTLE_ENDIAN);
    }

    return outputView;
  };

  return waveWriter;
};

JSSynth.Transport = function(songPlayer, stopCallback) {
  var SCHEDULE_AHEAD_TIME = 0.2;  // in seconds
  var TICK_INTERVAL = 50;         // in milliseconds
  var audioContext;
  var masterGain;

  if (window.AudioContext) {
    // Why do we create an AudioContext, immediately close it, and then
    // recreate another one? Good question.
    //
    // The reason is that in iOS, there is a bug in which an AudioContext
    // can be created with a sample rate of 48,000Hz, which for reasons
    // causes audio playback to be distorted. If you re-load the page,
    // the sample rate will be set to 41,000Hz instead, and playback
    // will sound normal.
    //
    // Creating an AudioContext, closing it, and recreating another
    // one works around this issue, I _think_ by basically simulating
    // the page re-load behavior, causing the sample rate of the 2nd
    // AudioContext to be 44,100Hz.
    //
    // This fix was figured out by searching Google, which returned
    // this GitHub issue: https://github.com/photonstorm/phaser/issues/2373
    audioContext = new AudioContext();
    if (audioContext.close) {
      audioContext.close();
      audioContext = new AudioContext();
    }

    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
  }
  else {
    return false;
  }

  var tick = function() {
    var finalTime = audioContext.currentTime + SCHEDULE_AHEAD_TIME;

    songPlayer.tick(audioContext, masterGain, finalTime, transport.stepInterval, transport.loop);

    if (songPlayer.isFinishedPlaying()) {
      stop();
      window.setTimeout(stopCallback, transport.stepInterval * 1000);
    }
  };

  var start = function() {
    songPlayer.reset(audioContext.currentTime);

    // Fix for Safari 9.1 (and maybe 9?)
    // For some reason, the AudioContext on a new page load is in suspended state
    // in this version of Safari, which means that no audio playback will occur.
    // If you re-load the same page, it will no longer be in suspended state
    // and audio playback will occur.
    //
    // This fixes this by detecting if the AudioContext is in suspended state,
    // and manually forcing it to resume.
    if (audioContext.state === 'suspended') {
      if (audioContext.resume) {
        audioContext.resume();
      }
    }

    tick();
    timeoutId = window.setInterval(tick, TICK_INTERVAL);
    playing = true;
  };

  var stop = function() {
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

  transport.setAmplitude = function(newAmplitude) {
    transport.amplitude = newAmplitude;
    masterGain.gain.value = transport.amplitude;
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
  transport.setAmplitude(0.25);

  return transport;
};

JSSynth.OfflineTransport = function(songPlayer, tempo, amplitude, completeCallback) {
  var transport = {};

  var buildOfflineAudioContext = function() {
    var numChannels = 1;
    var sampleRate = 44100;

    // TODO: Instead of adding 0.3 for maximum amount of release from final note, actually
    //       calculate a real value for this.
    var maximumReleaseTime = 0.3;
    var playbackTime = (songPlayer.stepCount() * transport.stepInterval) + maximumReleaseTime;
    var sampleCount = sampleRate * playbackTime;

    var audioContext;

    if (window.OfflineAudioContext) {
      audioContext = new OfflineAudioContext(numChannels, sampleCount, sampleRate);
    }
    else if (window.webkitOfflineAudioContext) {
      audioContext = new webkitOfflineAudioContext(numChannels, sampleCount, sampleRate);
    }

    audioContext.oncomplete = function(e) {
      var waveWriter = new JSSynth.WaveWriter();

      var sampleData = e.renderedBuffer.getChannelData(0);

      // Using Math.max() can result in 'Maximum call stack size exceeded' errors,
      // and Float32Array doesn't appear to support forEach() in Safari 9
      var maxSampleValue = 0;
      for (var i = 0; i < sampleData.length; i++) {
        if (sampleData[i] > maxSampleValue) {
          maxSampleValue = sampleData[i];
        }
      }
      var scaleFactor = (1 / maxSampleValue) * amplitude;

      var outputView = waveWriter.write(sampleData, scaleFactor);
      var blob = new Blob([outputView], { type: "audio/wav" });

      completeCallback(blob);
    };

    return audioContext;

  };

  var sixteenthsPerMinute = tempo * 4;
  transport.stepInterval = 60.0 / sixteenthsPerMinute;

  var offlineAudioContext = buildOfflineAudioContext();
  var masterGain = offlineAudioContext.createGain();
  masterGain.gain.value = amplitude;
  masterGain.connect(offlineAudioContext.destination);

  transport.tick = function() {
    var scheduleAheadTime = songPlayer.stepCount() * transport.stepInterval;
    var startTime = offlineAudioContext.currentTime;
    var finalTime = startTime + scheduleAheadTime;

    songPlayer.reset(startTime);
    songPlayer.tick(offlineAudioContext, masterGain, finalTime, transport.stepInterval, false);

    offlineAudioContext.startRendering();
  };

  return transport;
};
