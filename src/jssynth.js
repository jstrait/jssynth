"use strict";

function BufferCollection(audioContext) {
  var buffers = {};
  var bufferCollection = {};

  bufferCollection.addBufferFromURL = function(label, url) {
    var onDecodeSuccess = function(buffer) {
      buffers[label] = buffer;
    };

    var onDecodeError = function(e) {
      console.log("Error decoding audio data: " + e.message);
    };

    var request = new XMLHttpRequest();

    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function() {
      audioContext.decodeAudioData(request.response, onDecodeSuccess, onDecodeError);
    };

    request.send();
  };

  bufferCollection.addBufferFromFile = function(label, file) {
    var onDecodeSuccess = function(buffer) {
      buffers[label] = buffer;
    };

    var onDecodeError = function(e) {
      console.log("Error decoding audio data: " + e.message);
    };

    var reader = new FileReader();

    reader.onload = function(e) {
      audioContext.decodeAudioData(e.target.result, onDecodeSuccess, onDecodeError);
    };

    reader.readAsArrayBuffer(file);
  };

  bufferCollection.getBuffer = function(label) {
    return buffers[label];
  };

  return bufferCollection;
};

function SampleInstrument(config, bufferCollection) {
  var BASE_FREQUENCY = Note("A", 4, 1).frequency();
  var audioBuffer = bufferCollection.getBuffer(config.sample);
  var sampleInstrument = {};

  var buildBufferSourceNode = function(audioContext, masterGain, note) {
    var audioBufferSourceNode = audioContext.createBufferSource();
    audioBufferSourceNode.buffer = audioBuffer;
    audioBufferSourceNode.playbackRate.value = note.frequency() / BASE_FREQUENCY;
    audioBufferSourceNode.connect(masterGain);

    return audioBufferSourceNode;
  };

  sampleInstrument.gateOn = function(audioContext, audioDestination, note, amplitude, gateOnTime, gateOffTime) {
    var masterGain = audioContext.createGain();
    masterGain.gain.value = amplitude;

    var audioBufferSourceNode = buildBufferSourceNode(audioContext, masterGain, note);

    audioBufferSourceNode.start(gateOnTime);

    masterGain.connect(audioDestination);

    return {
      audioContext: audioContext,
      audioBufferSourceNode: audioBufferSourceNode,
    };
  };

  sampleInstrument.gateOff = function(noteContext, gateOffTime, isInteractive) {
    noteContext.audioBufferSourceNode.stop(gateOffTime);
  };

  sampleInstrument.playNote = function(audioContext, audioDestination, note, amplitude, gateOnTime, gateOffTime) {
    var noteContext = sampleInstrument.gateOn(audioContext, audioDestination, note, amplitude, gateOnTime, gateOffTime);
    sampleInstrument.gateOff(noteContext, gateOffTime, false);
  };


  return sampleInstrument;
};

function SynthInstrument(config) {
  var buildOscillator = function(audioContext, waveform, frequency, detune) {
    var oscillator = audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.value = frequency;
    oscillator.detune.value = detune;

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

  var synthInstrument = {};

  synthInstrument.gateOn = function(audioContext, audioDestination, note, amplitude, gateOnTime, gateOffTime) {
    var envelopeAttackStartTime = Math.max(0.0, gateOnTime - 0.001);

    // Master Gain
    var masterGain = audioContext.createGain();
    masterGain.connect(audioDestination);

    var calculatedMasterGainEnvelope = EnvelopeCalculator.calculate(amplitude / config.oscillators.length, config.envelope, gateOnTime, gateOffTime);

    // Master Gain Envelope Attack
    masterGain.gain.setValueAtTime(0.0, envelopeAttackStartTime);
    masterGain.gain.linearRampToValueAtTime(calculatedMasterGainEnvelope.attackEndAmplitude, calculatedMasterGainEnvelope.attackEndTime);

    // Master Gain Envelope Decay/Sustain
    if (calculatedMasterGainEnvelope.attackEndTime < gateOffTime) {
      masterGain.gain.linearRampToValueAtTime(calculatedMasterGainEnvelope.delayEndAmplitude, calculatedMasterGainEnvelope.delayEndTime);
    }


    // Filter
    var filter = buildFilter(audioContext, config.filter.cutoff, config.filter.resonance);

    if (config.filter.mode === "lfo") {
      // The amplitude is constrained to be at most the same as the cutoff frequency, to prevent
      // pops/clicks.
      var filterLfoGain = buildGain(audioContext, Math.min(config.filter.cutoff, config.filter.lfo.amplitude));
      filterLfoGain.connect(filter.frequency);

      var filterLfoOscillator = buildOscillator(audioContext, config.filter.lfo.waveform, config.filter.lfo.frequency, 0);
      filterLfoOscillator.connect(filterLfoGain);
    }
    else if (config.filter.mode === "envelope") {
      var calculatedFilterEnvelope = EnvelopeCalculator.calculate(config.filter.cutoff, config.filter.envelope, gateOnTime, gateOffTime);

      // Envelope Attack
      filter.frequency.setValueAtTime(0.0, envelopeAttackStartTime);
      filter.frequency.linearRampToValueAtTime(calculatedFilterEnvelope.attackEndAmplitude, calculatedFilterEnvelope.attackEndTime);

      // Envelope Decay/Sustain
      if (calculatedFilterEnvelope.attackEndTime < gateOffTime) {
        filter.frequency.linearRampToValueAtTime(calculatedFilterEnvelope.delayEndAmplitude, calculatedFilterEnvelope.delayEndTime);
      }
    }

    filter.connect(masterGain);


    // Base sound generator
    var oscillator = buildOscillator(audioContext,
                                     config.oscillators[0].waveform,
                                     note.frequency() * Math.pow(2, config.oscillators[0].octave),
                                     config.oscillators[0].detune);

    // Secondary sound generator
    var oscillator2 = buildOscillator(audioContext,
                                      config.oscillators[1].waveform,
                                      note.frequency() * Math.pow(2, config.oscillators[1].octave),
                                      config.oscillators[1].detune);

    oscillator.connect(filter);
    oscillator2.connect(filter);

    // LFO for base sound
    var pitchLfoOscillator = buildOscillator(audioContext, config.lfo.waveform, config.lfo.frequency, 0);
    var pitchLfoGain = buildGain(audioContext, config.lfo.amplitude);
    pitchLfoOscillator.connect(pitchLfoGain);
    pitchLfoGain.connect(oscillator.frequency);
    pitchLfoGain.connect(oscillator2.frequency);


    oscillator.start(gateOnTime);
    oscillator2.start(gateOnTime);
    pitchLfoOscillator.start(gateOnTime);
    if (config.filter.mode === "lfo") {
      filterLfoOscillator.start(gateOnTime);
    }

    return {
      oscillator: oscillator,
      oscillator2: oscillator2,
      filter: filter,
      masterGain: masterGain,
      pitchLfoOscillator: pitchLfoOscillator,
      filterLfoOscillator: filterLfoOscillator,
    };
  };

  synthInstrument.gateOff = function(noteContext, gateOffTime, isInteractive) {
    var MINIMUM_RELEASE_TIME = 0.005;
    var releaseEndTime;

    // Filter Envelope Release
    if (config.filter.mode === "envelope") {
      var safeFilterRelease = Math.max(MINIMUM_RELEASE_TIME, config.filter.envelope.release);
      if (isInteractive) {
        noteContext.filter.frequency.cancelScheduledValues(gateOffTime);
      }
      noteContext.filter.frequency.setTargetAtTime(0.0, gateOffTime, safeFilterRelease / 5);
    }

    // Gain Envelope Release
    var safeMasterGainRelease = Math.max(MINIMUM_RELEASE_TIME, config.envelope.release);
    var gainReleaseEndTime = gateOffTime + safeMasterGainRelease;

    if (isInteractive) {
      noteContext.masterGain.gain.cancelScheduledValues(gateOffTime);
    }

    noteContext.masterGain.gain.setTargetAtTime(0.0, gateOffTime, safeMasterGainRelease / 5);

    noteContext.oscillator.stop(gainReleaseEndTime);
    noteContext.oscillator2.stop(gainReleaseEndTime);
    noteContext.pitchLfoOscillator.stop(gainReleaseEndTime);
    if (config.filter.mode === "lfo") {
      noteContext.filterLfoOscillator.stop(gainReleaseEndTime);
    }
  };

  synthInstrument.playNote = function(audioContext, audioDestination, note, amplitude, gateOnTime, gateOffTime) {
    var noteContext = synthInstrument.gateOn(audioContext, audioDestination, note, amplitude, gateOnTime, gateOffTime);
    synthInstrument.gateOff(noteContext, gateOffTime, false);
  };

  return synthInstrument;
};

var EnvelopeCalculator = {
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

var SequenceParser = {
  parse: function(rawNotes) {
    var sequence = [];
    var splitNotes = rawNotes.split(" ");
    var noteString;
    var i;
    var noteName;
    var octave;
    var noteDuration = 1;

    for (i = splitNotes.length - 1; i >= 0; i--) {
      noteString = splitNotes[i];

      if (noteString === "-") {
        noteDuration += 1;
      }
      else if (noteString === " ") {
        noteDuration = 1;
      }
      else {
        noteName = noteString.slice(0, -1);
        octave = noteString.slice(-1);
        sequence[i] = new Note(noteName, octave, noteDuration);
        noteDuration = 1;
      }
    }

    return sequence;
  },
};

function Note(newNoteName, newOctave, newStepDuration) {
  var NOTE_RATIOS = {
    "A"  : 1.0,
    "A#" : Math.pow(2,  1 / 12),
    "B"  : Math.pow(2,  2 / 12),
    "C"  : Math.pow(2,  3 / 12),
    "C#" : Math.pow(2,  4 / 12),
    "D"  : Math.pow(2,  5 / 12),
    "D#" : Math.pow(2,  6 / 12),
    "E"  : Math.pow(2,  7 / 12),
    "F"  : Math.pow(2,  8 / 12),
    "F#" : Math.pow(2,  9 / 12),
    "G"  : Math.pow(2, 10 / 12),
    "G#" : Math.pow(2, 11 / 12),
  };

  var ENHARMONIC_EQUIVALENTS = {
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
    "Ab"  : "G#",
  };

  var MIDDLE_OCTAVE = 4;
  var MIDDLE_A_FREQUENCY = 440.0;

  var calculateFrequency = function(noteName, octave) {
    var normalizedNoteName = ENHARMONIC_EQUIVALENTS[noteName];
    var octaveMultiplier = Math.pow(2.0, (octave - MIDDLE_OCTAVE));

    return NOTE_RATIOS[normalizedNoteName] * MIDDLE_A_FREQUENCY * octaveMultiplier;
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

function InstrumentNote(note, instrument, amplitude) {
  var instrumentNote = {};

  instrumentNote.note = function() { return note; };
  instrumentNote.instrument = function() { return instrument; };
  instrumentNote.amplitude = function() { return amplitude; };

  return instrumentNote;
};

function SongPlayer() {
  var MEASURES = 8;
  var STEPS_PER_MEASURE = 16;
  var STEP_COUNT = MEASURES * STEPS_PER_MEASURE;

  var notes = [];

  var stepIndex;
  var isFinishedPlaying;
  var currentTime;

  var songPlayer = {};

  songPlayer.reset = function(newCurrentTime) {
    stepIndex = 0;
    isFinishedPlaying = false;
    currentTime = newCurrentTime;
  };

  songPlayer.stepCount = function() {
    return STEP_COUNT;
  };

  songPlayer.isFinishedPlaying = function() { return isFinishedPlaying; }

  songPlayer.replaceNotes = function(newNotes) {
    notes = newNotes;
  };

  songPlayer.tick = function(audioContext, audioDestination, endTime, stepDuration, loop) {
    var scheduledSteps = [];
    var noteTimeDuration;

    while (currentTime < endTime) {
      var incomingNotes = notes[stepIndex];
      if (incomingNotes) {
        incomingNotes.forEach(function(note) {
          noteTimeDuration = stepDuration * note.note().stepDuration();
          note.instrument().playNote(audioContext, audioDestination, note.note(), note.amplitude(), currentTime, currentTime + noteTimeDuration);
        });
      }

      scheduledSteps.push({ step: stepIndex, time: currentTime });

      stepIndex += 1;
      if (stepIndex >= STEP_COUNT) {
        if (loop) {
          stepIndex = 0;
        }
        else {
          isFinishedPlaying = true;
          return;
        }
      }

      currentTime += stepDuration;
    }

    return scheduledSteps;
  };

  songPlayer.reset();

  return songPlayer;
};

function Transport(songPlayer, stopCallback) {
  var SCHEDULE_AHEAD_TIME = 0.2;  // in seconds
  var TICK_INTERVAL = 50;         // in milliseconds
  var audioContext;
  var masterGain;
  var currentStep;
  var scheduledSteps;

  var detectClipping = function(e) {
    var i;
    var samples = e.inputBuffer.getChannelData(0);
    var numSamples = samples.length;

    for (i = 0; i < numSamples; i++) {
      if (Math.abs(samples[i]) > 1.0) {
        console.log("Clipping! " + samples[i]);
        break;
      }
    }
  };

  if (window.AudioContext) {
    // Why do we create an AudioContext, immediately close it, and then
    // recreate another one? Good question.
    //
    // The reason is that in iOS, there is a bug in which an AudioContext
    // can be created with a sample rate of 48,000Hz, which for reasons
    // causes audio playback to be distorted. If you re-load the page,
    // the sample rate will be set to 44,100Hz instead, and playback
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

    var clipDetector = audioContext.createScriptProcessor(512);
    clipDetector.onaudioprocess = detectClipping;

    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.connect(clipDetector);
  }
  else {
    return false;
  }

  var tick = function() {
    var finalTime = audioContext.currentTime + SCHEDULE_AHEAD_TIME;

    var newScheduledSteps = songPlayer.tick(audioContext, masterGain, finalTime, transport.stepInterval, transport.loop);
    scheduledSteps = scheduledSteps.concat(newScheduledSteps);

    if (songPlayer.isFinishedPlaying()) {
      stop();
      window.setTimeout(stopCallback, transport.stepInterval * 1000);
    }
  };

  var start = function() {
    currentStep = 0;
    scheduledSteps = [];
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

    clipDetector.connect(audioContext.destination);

    tick();
    timeoutId = window.setInterval(tick, TICK_INTERVAL);
    playing = true;
  };

  var stop = function() {
    window.clearInterval(timeoutId);
    clipDetector.disconnect(audioContext.destination);
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

  transport.currentStep = function() {
    if (!playing) {
      return null;
    }

    var currentTime = audioContext.currentTime;
    var i = 0;
    while (i < scheduledSteps.length && scheduledSteps[i].time <= currentTime) {
      currentStep = scheduledSteps[i].step;
      scheduledSteps.splice(0, 1);

      i++;
    }

    return currentStep;
  };

  transport.playImmediateNote = function(instrument, note) {
    return instrument.gateOn(audioContext, masterGain, note, 1.0, audioContext.currentTime, Number.POSITIVE_INFINITY);
  };

  transport.stopNote = function(instrument, noteContext) {
    instrument.gateOff(noteContext, audioContext.currentTime, true);
  };

  transport.loop = true;
  transport.setTempo(100);
  transport.setAmplitude(0.25);

  transport.bufferCollection = BufferCollection(audioContext);

  return transport;
};


function OfflineTransport(songPlayer, tempo, amplitude, completeCallback) {
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
      var waveWriter = new WaveWriter();

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


function WaveWriter() {
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

export { SynthInstrument, SampleInstrument, EnvelopeCalculator, SequenceParser, Note, SongPlayer, Transport, OfflineTransport, InstrumentNote, WaveWriter };
