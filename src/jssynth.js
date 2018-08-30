"use strict";

function BufferCollection(audioContext) {
  var buffers = {};

  var addBuffer = function(label, buffer) {
    buffers[label] = buffer;
  };

  var addBufferFromURL = function(label, url, onSuccess) {
    var onDecodeSuccess = function(buffer) {
      buffers[label] = buffer;
      onSuccess();
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

  var addBuffersFromURLs = function(bufferConfig, onAllBuffersLoaded) {
    var loadedBufferCount = 0;
    var allBuffersCount = bufferConfig.length;
    var i;

    var onBufferLoaded = function() {
      loadedBufferCount += 1;

      if (loadedBufferCount === allBuffersCount) {
        onAllBuffersLoaded();
      }
    };

    for (i = 0; i < bufferConfig.length; i++) {
      addBufferFromURL(bufferConfig[i].label, bufferConfig[i].url, onBufferLoaded);
    }
  };

  var addBufferFromFile = function(label, file, onSuccess) {
    var onDecodeSuccess = function(buffer) {
      buffers[label] = buffer;
      onSuccess();
    };

    var onDecodeError = function(e) {
      alert(`${file.name} is not a valid sound file`);
    };

    var reader = new FileReader();

    reader.onload = function(e) {
      audioContext.decodeAudioData(e.target.result, onDecodeSuccess, onDecodeError);
    };

    reader.readAsArrayBuffer(file);
  };

  var getBuffer = function(label) {
    return buffers[label];
  };

  var removeBuffer = function(label) {
    delete buffers[label];
  };


  return {
    addBuffer: addBuffer,
    addBuffersFromURLs: addBuffersFromURLs,
    addBufferFromFile: addBufferFromFile,
    getBuffer: getBuffer,
    removeBuffer: removeBuffer,
  };
};

function SampleInstrument(config, bufferCollection) {
  var BASE_FREQUENCY = Note("A", 4, 1).frequency();
  var audioBuffer = bufferCollection.getBuffer(config.sample);
  var sampleInstrument = {};

  var buildBufferSourceNode = function(audioContext, target, note) {
    var audioBufferSourceNode = audioContext.createBufferSource();
    audioBufferSourceNode.buffer = audioBuffer;
    audioBufferSourceNode.playbackRate.value = note.frequency() / BASE_FREQUENCY;
    audioBufferSourceNode.loop = config.loop;
    audioBufferSourceNode.connect(target);

    return audioBufferSourceNode;
  };

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

  sampleInstrument.gateOn = function(audioContext, audioDestination, note, amplitude, gateOnTime, gateOffTime) {
    var masterGain, calculatedMasterGainEnvelope;
    var filter, filterLfoGain, filterLfoOscillator, calculatedFilterEnvelope;
    var envelopeAttackStartTime = Math.max(0.0, gateOnTime - 0.001);
    var audioBufferSourceNode;

    // Master Gain
    masterGain = audioContext.createGain();
    masterGain.connect(audioDestination);

    calculatedMasterGainEnvelope = EnvelopeCalculator.calculate(amplitude, config.envelope, gateOnTime, gateOffTime);

    // Master Gain Envelope Attack
    masterGain.gain.setValueAtTime(0.0, envelopeAttackStartTime);
    masterGain.gain.linearRampToValueAtTime(calculatedMasterGainEnvelope.attackEndAmplitude, calculatedMasterGainEnvelope.attackEndTime);

    // Master Gain Envelope Decay/Sustain
    if (calculatedMasterGainEnvelope.attackEndTime < gateOffTime) {
      masterGain.gain.linearRampToValueAtTime(calculatedMasterGainEnvelope.decayEndAmplitude, calculatedMasterGainEnvelope.decayEndTime);
    }

    masterGain.connect(audioDestination);

    // Filter
    filter = buildFilter(audioContext, config.filter.cutoff, config.filter.resonance);

    if (config.filter.mode === "lfo") {
      // The amplitude is constrained to be at most the same as the cutoff frequency, to prevent
      // pops/clicks.
      filterLfoGain = buildGain(audioContext, Math.min(config.filter.cutoff, config.filter.lfo.amplitude));
      filterLfoGain.connect(filter.frequency);

      filterLfoOscillator = buildOscillator(audioContext, config.filter.lfo.waveform, config.filter.lfo.frequency, 0);
      filterLfoOscillator.connect(filterLfoGain);
    }
    else if (config.filter.mode === "envelope") {
      calculatedFilterEnvelope = EnvelopeCalculator.calculate(config.filter.cutoff, config.filter.envelope, gateOnTime, gateOffTime);

      // Envelope Attack
      // The combo of directly setting the value, as well as setting the value at a given time
      // is needed for this to work in the combo of Safari, Firefox, and Chrome. Otherwise,
      // in Chrome is works if you set the value directly (but not Safari and Firefox), and
      // it works in Safari and Firefox is you set the value at a given time (but not Chrome).
      filter.frequency.value = 0.0;
      filter.frequency.setValueAtTime(0.0, envelopeAttackStartTime);
      filter.frequency.linearRampToValueAtTime(calculatedFilterEnvelope.attackEndAmplitude, calculatedFilterEnvelope.attackEndTime);

      // Envelope Decay/Sustain
      if (calculatedFilterEnvelope.attackEndTime < gateOffTime) {
        filter.frequency.linearRampToValueAtTime(calculatedFilterEnvelope.decayEndAmplitude, calculatedFilterEnvelope.decayEndTime);
      }
    }

    filter.connect(masterGain);

    if (config.filter.mode === "lfo") {
      filterLfoOscillator.start(gateOnTime);
    }

    // Audio Buffer
    audioBufferSourceNode = buildBufferSourceNode(audioContext, filter, note);
    audioBufferSourceNode.start(gateOnTime);

    return {
      audioContext: audioContext,
      audioBufferSourceNode: audioBufferSourceNode,
      masterGain: masterGain,
      filter: filter,
      filterLfoOscillator: filterLfoOscillator,
    };
  };

  sampleInstrument.gateOff = function(noteContext, gateOffTime, isInteractive) {
    var MINIMUM_RELEASE_TIME = 0.005;
    var safeMasterGainRelease, gainReleaseEndTime;
    var safeFilterRelease;
    var releaseEndTime;

    // Filter Envelope Release
    if (config.filter.mode === "envelope") {
      safeFilterRelease = Math.max(MINIMUM_RELEASE_TIME, config.filter.envelope.release);
      if (isInteractive) {
        noteContext.filter.frequency.cancelScheduledValues(gateOffTime);
      }
      noteContext.filter.frequency.setTargetAtTime(0.0, gateOffTime, safeFilterRelease / 5);
    }

    // Gain Envelope Release
    safeMasterGainRelease = Math.max(MINIMUM_RELEASE_TIME, config.envelope.release);
    gainReleaseEndTime = gateOffTime + safeMasterGainRelease;

    if (isInteractive) {
      // Simulate `cancelAndHoldAtTime()`, which is not present in all browsers.
      // The gain value is manually set to the current gain value because `cancelScheduledValues()`
      // seems to (sometimes? all the time?) reset the gain value at 0. If the gain is 0, the
      // release portion of the envelope will have no effect, and cause notes that are played
      // for a shorter amount of time than the attack+decay time to be suddenly cut off, instead
      // of having a release fade. As mentioned above, using `cancelAndHoldAtTime()` would be
      // another way to solve this problem.
      noteContext.masterGain.gain.cancelScheduledValues(gateOffTime);
      noteContext.masterGain.gain.setValueAtTime(noteContext.masterGain.gain.value, gateOffTime);
    }

    noteContext.masterGain.gain.setTargetAtTime(0.0, gateOffTime, safeMasterGainRelease / 5);

    noteContext.audioBufferSourceNode.stop(gainReleaseEndTime);
    if (config.filter.mode === "lfo") {
      noteContext.filterLfoOscillator.stop(gainReleaseEndTime);
    }
  };

  sampleInstrument.scheduleNote = function(audioContext, audioDestination, note, amplitude, gateOnTime, gateOffTime) {
    var noteContext = sampleInstrument.gateOn(audioContext, audioDestination, note, amplitude, gateOnTime, gateOffTime);
    sampleInstrument.gateOff(noteContext, gateOffTime, false);
  };


  return sampleInstrument;
};

function SynthInstrument(config, noiseBuffer) {
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
    var masterGain, calculatedMasterGainEnvelope;
    var filter, filterLfoGain, filterLfoOscillator, calculatedFilterEnvelope;
    var oscillator1, oscillator1Gain, oscillator2, oscillator2Gain, noise, noiseGain;
    var pitchLfoOscillator, pitchLfoGain;

    var envelopeAttackStartTime = Math.max(0.0, gateOnTime - 0.001);

    // Master Gain
    masterGain = audioContext.createGain();
    masterGain.connect(audioDestination);

    calculatedMasterGainEnvelope = EnvelopeCalculator.calculate(amplitude / (config.oscillators.length + 1), config.envelope, gateOnTime, gateOffTime);

    // Master Gain Envelope Attack
    masterGain.gain.setValueAtTime(0.0, envelopeAttackStartTime);
    masterGain.gain.linearRampToValueAtTime(calculatedMasterGainEnvelope.attackEndAmplitude, calculatedMasterGainEnvelope.attackEndTime);

    // Master Gain Envelope Decay/Sustain
    if (calculatedMasterGainEnvelope.attackEndTime < gateOffTime) {
      masterGain.gain.linearRampToValueAtTime(calculatedMasterGainEnvelope.decayEndAmplitude, calculatedMasterGainEnvelope.decayEndTime);
    }


    // Filter
    filter = buildFilter(audioContext, config.filter.cutoff, config.filter.resonance);

    if (config.filter.mode === "lfo") {
      // The amplitude is constrained to be at most the same as the cutoff frequency, to prevent
      // pops/clicks.
      filterLfoGain = buildGain(audioContext, Math.min(config.filter.cutoff, config.filter.lfo.amplitude));
      filterLfoGain.connect(filter.frequency);

      filterLfoOscillator = buildOscillator(audioContext, config.filter.lfo.waveform, config.filter.lfo.frequency, 0);
      filterLfoOscillator.connect(filterLfoGain);
    }
    else if (config.filter.mode === "envelope") {
      calculatedFilterEnvelope = EnvelopeCalculator.calculate(config.filter.cutoff, config.filter.envelope, gateOnTime, gateOffTime);

      // Envelope Attack
      // The combo of directly setting the value, as well as setting the value at a given time
      // is needed for this to work in the combo of Safari, Firefox, and Chrome. Otherwise,
      // in Chrome is works if you set the value directly (but not Safari and Firefox), and
      // it works in Safari and Firefox is you set the value at a given time (but not Chrome).
      filter.frequency.value = 0.0;
      filter.frequency.setValueAtTime(0.0, envelopeAttackStartTime);
      filter.frequency.linearRampToValueAtTime(calculatedFilterEnvelope.attackEndAmplitude, calculatedFilterEnvelope.attackEndTime);

      // Envelope Decay/Sustain
      if (calculatedFilterEnvelope.attackEndTime < gateOffTime) {
        filter.frequency.linearRampToValueAtTime(calculatedFilterEnvelope.decayEndAmplitude, calculatedFilterEnvelope.decayEndTime);
      }
    }

    filter.connect(masterGain);


    // Base sound generator
    oscillator1Gain = buildGain(audioContext, config.oscillators[0].amplitude);
    oscillator1 = buildOscillator(audioContext,
                                  config.oscillators[0].waveform,
                                  note.frequency() * Math.pow(2, config.oscillators[0].octave),
                                  config.oscillators[0].detune);
    oscillator1.connect(oscillator1Gain);
    oscillator1Gain.connect(filter);

    // Secondary sound generator
    oscillator2Gain = buildGain(audioContext, config.oscillators[1].amplitude);
    oscillator2 = buildOscillator(audioContext,
                                  config.oscillators[1].waveform,
                                  note.frequency() * Math.pow(2, config.oscillators[1].octave),
                                  config.oscillators[1].detune);
    oscillator2.connect(oscillator2Gain);
    oscillator2Gain.connect(filter);

    // Noise
    noiseGain = buildGain(audioContext, config.noise.amplitude);
    noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    noise.connect(noiseGain);
    noiseGain.connect(filter);


    // LFO for base sound
    pitchLfoOscillator = buildOscillator(audioContext, config.lfo.waveform, config.lfo.frequency, 0);
    pitchLfoGain = buildGain(audioContext, config.lfo.amplitude);
    pitchLfoOscillator.connect(pitchLfoGain);
    pitchLfoGain.connect(oscillator1.frequency);
    pitchLfoGain.connect(oscillator2.frequency);


    oscillator1.start(gateOnTime);
    oscillator2.start(gateOnTime);
    noise.start(gateOnTime);
    pitchLfoOscillator.start(gateOnTime);
    if (config.filter.mode === "lfo") {
      filterLfoOscillator.start(gateOnTime);
    }

    return {
      oscillator1: oscillator1,
      oscillator2: oscillator2,
      noise: noise,
      filter: filter,
      masterGain: masterGain,
      pitchLfoOscillator: pitchLfoOscillator,
      filterLfoOscillator: filterLfoOscillator,
    };
  };

  synthInstrument.gateOff = function(noteContext, gateOffTime, isInteractive) {
    var MINIMUM_RELEASE_TIME = 0.005;
    var safeMasterGainRelease, gainReleaseEndTime, releaseEndTime;
    var safeFilterRelease;

    // Filter Envelope Release
    if (config.filter.mode === "envelope") {
      safeFilterRelease = Math.max(MINIMUM_RELEASE_TIME, config.filter.envelope.release);
      if (isInteractive) {
        noteContext.filter.frequency.cancelScheduledValues(gateOffTime);
      }
      noteContext.filter.frequency.setTargetAtTime(0.0, gateOffTime, safeFilterRelease / 5);
    }

    // Gain Envelope Release
    safeMasterGainRelease = Math.max(MINIMUM_RELEASE_TIME, config.envelope.release);
    gainReleaseEndTime = gateOffTime + safeMasterGainRelease;

    if (isInteractive) {
      // Simulate `cancelAndHoldAtTime()`, which is not present in all browsers.
      // The gain value is manually set to the current gain value because `cancelScheduledValues()`
      // seems to (sometimes? all the time?) reset the gain value at 0. If the gain is 0, the
      // release portion of the envelope will have no effect, and cause notes that are played
      // for a shorter amount of time than the attack+decay time to be suddenly cut off, instead
      // of having a release fade. As mentioned above, using `cancelAndHoldAtTime()` would be
      // another way to solve this problem.
      noteContext.masterGain.gain.cancelScheduledValues(gateOffTime);
      noteContext.masterGain.gain.setValueAtTime(noteContext.masterGain.gain.value, gateOffTime);
    }

    noteContext.masterGain.gain.setTargetAtTime(0.0, gateOffTime, safeMasterGainRelease / 5);

    noteContext.oscillator1.stop(gainReleaseEndTime);
    noteContext.oscillator2.stop(gainReleaseEndTime);
    noteContext.noise.stop(gainReleaseEndTime);
    noteContext.pitchLfoOscillator.stop(gainReleaseEndTime);
    if (config.filter.mode === "lfo") {
      noteContext.filterLfoOscillator.stop(gainReleaseEndTime);
    }
  };

  synthInstrument.scheduleNote = function(audioContext, audioDestination, note, amplitude, gateOnTime, gateOffTime) {
    var noteContext = synthInstrument.gateOn(audioContext, audioDestination, note, amplitude, gateOnTime, gateOffTime);
    synthInstrument.gateOff(noteContext, gateOffTime, false);
  };

  return synthInstrument;
};

var EnvelopeCalculator = {
  calculate: function(baseAmplitude, envelope, gateOnTime, gateOffTime) {
    var attackEndTime = gateOnTime + envelope.attack;
    var attackEndAmplitude, attackEndAmplitudePercentage;
    var decayEndTime, decayEndAmplitude, decayEndAmplitudePercentage, targetAmplitudeAfterDecayEnds;
    var delta;

    if (attackEndTime < gateOffTime) {
      attackEndAmplitude = baseAmplitude;
    }
    else {
      attackEndAmplitudePercentage = ((gateOffTime - gateOnTime) / (attackEndTime - gateOnTime));
      attackEndAmplitude = baseAmplitude * attackEndAmplitudePercentage;
      attackEndTime = gateOffTime;
    }

    decayEndTime = attackEndTime + envelope.decay;
    targetAmplitudeAfterDecayEnds = baseAmplitude * envelope.sustain;
    decayEndAmplitude;
    if (gateOffTime > decayEndTime) {
      decayEndAmplitude = targetAmplitudeAfterDecayEnds;
    }
    else {
      decayEndAmplitudePercentage = ((gateOffTime - attackEndTime) / (decayEndTime - attackEndTime));
      decayEndTime = gateOffTime;

      delta = attackEndAmplitude - targetAmplitudeAfterDecayEnds;
      decayEndAmplitude = attackEndAmplitude - (delta * decayEndAmplitudePercentage);
    }

    return {
      attackEndTime: attackEndTime,
      attackEndAmplitude: attackEndAmplitude,
      decayEndTime: decayEndTime,
      decayEndAmplitude: decayEndAmplitude,
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


  return {
    name: function() { return noteName; },
    octave: function() { return octave; },
    stepDuration: function() { return stepDuration; },
    frequency: function() { return frequency; },
  };
};

function InstrumentNote(note, instrument, amplitude) {
  return {
    note: function() { return note; },
    instrument: function() { return instrument; },
    amplitude: function() { return amplitude; },
  };
};

function SongPlayer(measureCount) {
  var STEPS_PER_MEASURE = 16;
  var STEP_COUNT = measureCount * STEPS_PER_MEASURE;

  var notes = [];

  var stepIndex;
  var isFinishedPlaying;
  var currentTime;

  var reset = function(newCurrentTime) {
    stepIndex = 0;
    isFinishedPlaying = false;
    currentTime = newCurrentTime;
  };

  var replaceNotes = function(newNotes) {
    notes = newNotes;
  };

  var tick = function(audioContext, audioDestination, endTime, stepDuration, loop) {
    var scheduledSteps = [];
    var noteTimeDuration;
    var incomingNotes;

    while (currentTime < endTime) {
      incomingNotes = notes[stepIndex];
      if (incomingNotes) {
        incomingNotes.forEach(function(note) {
          noteTimeDuration = stepDuration * note.note().stepDuration();
          note.instrument().scheduleNote(audioContext, audioDestination, note.note(), note.amplitude(), currentTime, currentTime + noteTimeDuration);
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


  reset();


  return {
    reset: reset,
    stepCount: function() { return STEP_COUNT; },
    isFinishedPlaying: function() { return isFinishedPlaying; },
    replaceNotes: replaceNotes,
    tick: tick,
  };
};

function Transport(songPlayer, stopCallback) {
  var SCHEDULE_AHEAD_TIME = 0.2;  // in seconds
  var TICK_INTERVAL = 50;         // in milliseconds
  var LOOP = true;

  var audioContext;
  var clipDetector;
  var masterGain;
  var currentStep;
  var scheduledSteps;
  var stepInterval;
  var timeoutId;
  var playing = false;
  var bufferCollection;

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

  var tick = function() {
    var finalTime = audioContext.currentTime + SCHEDULE_AHEAD_TIME;

    var newScheduledSteps = songPlayer.tick(audioContext, masterGain, finalTime, stepInterval, LOOP);
    scheduledSteps = scheduledSteps.concat(newScheduledSteps);

    if (songPlayer.isFinishedPlaying()) {
      stop();
      window.setTimeout(stopCallback, stepInterval * 1000);
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

  var buildNoiseBuffer = function() {
    var noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate, audioContext.sampleRate);
    var noiseChannel = noiseBuffer.getChannelData(0);
    var i;

    for (i = 0; i < noiseChannel.length; i++) {
      noiseChannel[i] = (Math.random() * 2.0) - 1.0;
    }

    return noiseBuffer;
  };

  var setTempo = function(newTempo) {
    var sixteenthsPerMinute = newTempo * 4;
    stepInterval = 60.0 / sixteenthsPerMinute;
  };

  var setAmplitude = function(newAmplitude) {
    masterGain.gain.value = newAmplitude;
  };

  var toggle = function() {
    if (playing) {
      stop();
    }
    else {
      start();
    }
  };

  var currentStep = function() {
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

  var playImmediateNote = function(instrument, note) {
    return instrument.gateOn(audioContext, masterGain, note, 1.0, audioContext.currentTime, Number.POSITIVE_INFINITY);
  };

  var stopNote = function(instrument, noteContext) {
    instrument.gateOff(noteContext, audioContext.currentTime, true);
  };

  var initializeAudioContext = function() {
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

      clipDetector = audioContext.createScriptProcessor(512);
      clipDetector.onaudioprocess = detectClipping;

      masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.connect(clipDetector);
    }
  };

  initializeAudioContext();
  if (audioContext === undefined) {
    return false;
  }

  setTempo(100);
  setAmplitude(0.25);
  bufferCollection = BufferCollection(audioContext);
  bufferCollection.addBuffer("noise", buildNoiseBuffer());


  return {
    playImmediateNote: playImmediateNote,
    stopNote: stopNote,
    setTempo: setTempo,
    setAmplitude: setAmplitude,
    toggle: toggle,
    currentStep: currentStep,
    bufferCollection: bufferCollection,
  };
};


function OfflineTransport(songPlayer, tempo, amplitude, completeCallback) {
  var NUM_CHANNELS = 1;
  var SAMPLE_RATE = 44100;
  var SIXTEENTHS_PER_MINUTE = tempo * 4;
  var STEP_INTERVAL = 60.0 / SIXTEENTHS_PER_MINUTE;

  // TODO: Instead of adding 0.3 for maximum amount of release from final note, actually
  //       calculate a real value for this.
  var MAX_RELEASE_TIME = 0.3;


  var calculateMaxSampleValue = function(sampleData) {
    var absoluteSampleValue;
    var maxSampleValue = 0;
    var i;

    // Using Math.max() can result in 'Maximum call stack size exceeded' errors,
    // and Float32Array doesn't appear to support forEach() in Safari 9
    for (i = 0; i < sampleData.length; i++) {
      absoluteSampleValue = Math.abs(sampleData[i]);

      if (absoluteSampleValue > maxSampleValue) {
        maxSampleValue = absoluteSampleValue;
      }
    }

    return maxSampleValue;
  };

  var buildOfflineAudioContext = function() {
    var playbackTime = (songPlayer.stepCount() * STEP_INTERVAL) + MAX_RELEASE_TIME;
    var sampleCount = SAMPLE_RATE * playbackTime;
    var audioContext;

    if (window.OfflineAudioContext) {
      audioContext = new OfflineAudioContext(NUM_CHANNELS, sampleCount, SAMPLE_RATE);
    }
    else if (window.webkitOfflineAudioContext) {
      audioContext = new webkitOfflineAudioContext(NUM_CHANNELS, sampleCount, SAMPLE_RATE);
    }

    audioContext.oncomplete = function(e) {
      var waveWriter = new WaveWriter();

      var sampleData = e.renderedBuffer.getChannelData(0);

      var maxSampleValue = calculateMaxSampleValue(sampleData);
      var scaleFactor = (maxSampleValue > 1.0) ? (1.0 / maxSampleValue) : 1.0;
      var outputView = waveWriter.write(sampleData, scaleFactor);
      var blob = new Blob([outputView], { type: "audio/wav" });

      completeCallback(blob);
    };

    return audioContext;
  };

  var tick = function() {
    var scheduleAheadTime = songPlayer.stepCount() * STEP_INTERVAL;
    var startTime = offlineAudioContext.currentTime;
    var finalTime = startTime + scheduleAheadTime;

    songPlayer.reset(startTime);
    songPlayer.tick(offlineAudioContext, masterGain, finalTime, STEP_INTERVAL, false);

    offlineAudioContext.startRendering();
  };

  var offlineAudioContext = buildOfflineAudioContext();
  var masterGain = offlineAudioContext.createGain();

  masterGain.gain.value = amplitude;
  masterGain.connect(offlineAudioContext.destination);


  return {
    tick: tick,
  };
};


function WaveWriter() {
  var LITTLE_ENDIAN = true;
  var AUDIO_FORMAT_CODE = 1;  // I.e., PCM
  var NUM_CHANNELS = 1;
  var BITS_PER_SAMPLE = 16;
  var BYTES_PER_SAMPLE = 2;
  var SAMPLE_RATE = 44100;

  var BLOCK_ALIGN = (BITS_PER_SAMPLE / 8) * NUM_CHANNELS;
  var BYTE_RATE = BLOCK_ALIGN * SAMPLE_RATE;

  var WAVEFILE_HEADER_BYTE_COUNT = 44;

  var write = function(rawFloat32SampleData, scaleFactor) {
    var sampleDataByteCount = rawFloat32SampleData.length * BYTES_PER_SAMPLE;
    var fileLength = WAVEFILE_HEADER_BYTE_COUNT + sampleDataByteCount;
    var outputView = new DataView(new ArrayBuffer(fileLength));
    var maxSampleValue;
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

    maxSampleValue = scaleFactor * 32767.0;
    // Float32Array doesn't appear to support forEach() in Safari 9
    for (i = 0; i < rawFloat32SampleData.length; i++) {
      // Should this round?
      outputView.setInt16(WAVEFILE_HEADER_BYTE_COUNT + (i * BYTES_PER_SAMPLE), rawFloat32SampleData[i] * maxSampleValue, LITTLE_ENDIAN);
    }

    return outputView;
  };


  return {
    write: write,
  };
};

export { SynthInstrument, SampleInstrument, EnvelopeCalculator, SequenceParser, Note, SongPlayer, Transport, OfflineTransport, InstrumentNote, WaveWriter };
