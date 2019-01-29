"use strict";

function BufferCollection(audioContext) {
  var buffers = {};

  var addBuffer = function(label, buffer) {
    buffers[label] = buffer;
  };

  var addBufferFromURL = function(label, url, onSuccess, onError) {
    var onDecodeSuccess = function(buffer) {
      buffers[label] = buffer;
      onSuccess();
    };

    var onDecodeError = function(e) {
      var errorMessage = "Error decoding audio data for URL `" + url + "`";

      if (e) {  // The error object seems to be null in Safari (as of v11)
        errorMessage += ": " + e.message;
      }

      console.log(errorMessage);
      onError();
    };

    var request = new XMLHttpRequest();

    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function() {
      audioContext.decodeAudioData(request.response, onDecodeSuccess, onDecodeError);
    };

    request.send();
  };

  var addBuffersFromURLs = function(bufferConfig, onAllBuffersLoaded, onLoadError) {
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
      addBufferFromURL(bufferConfig[i].label, bufferConfig[i].url, onBufferLoaded, onLoadError);
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


var BaseInstrument = function(config) {
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

  var scheduleNote = function(audioContext, audioDestination, note, amplitude, gateOnTime, gateOffTime) {
    var noteContext = baseInstrument.gateOn(audioContext, audioDestination, note, amplitude, gateOnTime, gateOffTime);
    baseInstrument.gateOff(noteContext, gateOffTime, false);
  };

  var gateOff = function(noteContext, gateOffTime, isInteractive) {
    var MINIMUM_RELEASE_TIME = 0.005;
    var masterGainAtReleaseStart, safeMasterGainRelease, gainReleaseEndTime, releaseEndTime;
    var safeFilterRelease;

    // Filter Envelope Release
    safeFilterRelease = Math.max(MINIMUM_RELEASE_TIME, config.filter.envelope.releaseTime);
    if (isInteractive) {
      noteContext.filter.frequency.cancelScheduledValues(gateOffTime);
    }
    noteContext.filter.frequency.setTargetAtTime(config.filter.cutoff, gateOffTime, safeFilterRelease / 5);

    // Gain Envelope Release
    safeMasterGainRelease = Math.max(MINIMUM_RELEASE_TIME, config.envelope.releaseTime);
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
      masterGainAtReleaseStart = Envelope(noteContext.amplitude, config.envelope, noteContext.gateOnTime, gateOffTime).valueAtTime(gateOffTime);
      noteContext.masterGain.gain.setValueAtTime(masterGainAtReleaseStart, gateOffTime);
    }

    noteContext.masterGain.gain.setTargetAtTime(0.0, gateOffTime, safeMasterGainRelease / 5);

    if (noteContext.audioBufferSourceNode !== undefined) {
      noteContext.audioBufferSourceNode.stop(gainReleaseEndTime);
    }
    if (noteContext.oscillator1 !== undefined) {
      noteContext.oscillator1.stop(gainReleaseEndTime);
      noteContext.oscillator2.stop(gainReleaseEndTime);
      noteContext.noise.stop(gainReleaseEndTime);
    }
    if (noteContext.pitchLfoOscillator !== undefined) {
      noteContext.pitchLfoOscillator.stop(gainReleaseEndTime);
    }
    if (noteContext.filterLfoOscillator !== undefined) {
      noteContext.filterLfoOscillator.stop(gainReleaseEndTime);
    }
  };


  var baseInstrument = {
    gateOn: function() {},
    gateOff: gateOff,
    buildOscillator: buildOscillator,
    buildGain: buildGain,
    buildFilter: buildFilter,
    scheduleNote: scheduleNote,
    config: function() { return config; },
  };

  return baseInstrument;
};


function SampleInstrument(config, bufferCollection) {
  var BASE_FREQUENCY = Note(config.rootNoteName, config.rootNoteOctave, 1).frequency();
  var audioBuffer = bufferCollection.getBuffer(config.sample);
  var sampleInstrument = BaseInstrument(config);

  var buildBufferSourceNode = function(audioContext, target, note) {
    var audioBufferSourceNode = audioContext.createBufferSource();
    audioBufferSourceNode.buffer = audioBuffer;
    audioBufferSourceNode.playbackRate.value = note.frequency() / BASE_FREQUENCY;
    audioBufferSourceNode.loop = config.loop;
    audioBufferSourceNode.connect(target);

    return audioBufferSourceNode;
  };

  sampleInstrument.gateOn = function(audioContext, audioDestination, note, amplitude, gateOnTime, gateOffTime) {
    var masterGain, calculatedMasterGainEnvelope;
    var filter, filterLfoGain, filterLfoOscillator, calculatedFilterEnvelope;
    var envelopeAttackStartTime = Math.max(0.0, gateOnTime - 0.001);
    var audioBufferSourceNode;

    // Master Gain
    masterGain = audioContext.createGain();
    masterGain.connect(audioDestination);

    calculatedMasterGainEnvelope = Envelope(amplitude, config.envelope, gateOnTime, gateOffTime);

    // Master Gain Envelope Attack
    masterGain.gain.setValueAtTime(0.0, envelopeAttackStartTime);
    masterGain.gain.linearRampToValueAtTime(calculatedMasterGainEnvelope.attackEndAmplitude, calculatedMasterGainEnvelope.attackEndTime);

    // Master Gain Envelope Decay/Sustain
    if (calculatedMasterGainEnvelope.attackEndTime < gateOffTime) {
      masterGain.gain.linearRampToValueAtTime(calculatedMasterGainEnvelope.decayEndAmplitude, calculatedMasterGainEnvelope.decayEndTime);
    }

    masterGain.connect(audioDestination);

    // Filter
    filter = sampleInstrument.buildFilter(audioContext, config.filter.cutoff, config.filter.resonance);

    filterLfoGain = sampleInstrument.buildGain(audioContext, config.filter.lfo.amplitude);
    filterLfoGain.connect(filter.detune);

    filterLfoOscillator = sampleInstrument.buildOscillator(audioContext, config.filter.lfo.waveform, config.filter.lfo.frequency, 0);
    filterLfoOscillator.connect(filterLfoGain);
    filterLfoOscillator.start(gateOnTime);

    calculatedFilterEnvelope = Envelope(config.filter.envelope.amount, config.filter.envelope, gateOnTime, gateOffTime);

    // Envelope Attack
    filter.frequency.setValueAtTime(config.filter.cutoff, envelopeAttackStartTime);
    filter.frequency.linearRampToValueAtTime(config.filter.cutoff + calculatedFilterEnvelope.attackEndAmplitude, calculatedFilterEnvelope.attackEndTime);

    // Envelope Decay/Sustain
    if (calculatedFilterEnvelope.attackEndTime < gateOffTime) {
      filter.frequency.linearRampToValueAtTime(config.filter.cutoff + calculatedFilterEnvelope.decayEndAmplitude, calculatedFilterEnvelope.decayEndTime);
    }

    filter.connect(masterGain);

    // Audio Buffer
    audioBufferSourceNode = buildBufferSourceNode(audioContext, filter, note);
    audioBufferSourceNode.start(gateOnTime);

    return {
      gateOnTime: gateOnTime,
      amplitude: amplitude,
      audioBufferSourceNode: audioBufferSourceNode,
      masterGain: masterGain,
      filter: filter,
      filterLfoOscillator: filterLfoOscillator,
    };
  };


  return sampleInstrument;
};

function SynthInstrument(config, whiteNoiseBuffer, pinkNoiseBuffer) {
  var synthInstrument = BaseInstrument(config);

  synthInstrument.gateOn = function(audioContext, audioDestination, note, amplitude, gateOnTime, gateOffTime) {
    var masterGainAmplitude, masterGain, calculatedMasterGainEnvelope;
    var filter, filterLfoGain, filterLfoOscillator, calculatedFilterEnvelope;
    var oscillator1, oscillator1Gain, oscillator2, oscillator2Gain, noise, noiseGain;
    var pitchLfoOscillator, pitchLfoGain;

    var envelopeAttackStartTime = Math.max(0.0, gateOnTime - 0.001);

    // Master Gain
    masterGain = audioContext.createGain();
    masterGain.connect(audioDestination);

    masterGainAmplitude = amplitude / (config.oscillators.length + 1);
    calculatedMasterGainEnvelope = Envelope(masterGainAmplitude, config.envelope, gateOnTime, gateOffTime);

    // Master Gain Envelope Attack
    masterGain.gain.setValueAtTime(0.0, envelopeAttackStartTime);
    masterGain.gain.linearRampToValueAtTime(calculatedMasterGainEnvelope.attackEndAmplitude, calculatedMasterGainEnvelope.attackEndTime);

    // Master Gain Envelope Decay/Sustain
    if (calculatedMasterGainEnvelope.attackEndTime < gateOffTime) {
      masterGain.gain.linearRampToValueAtTime(calculatedMasterGainEnvelope.decayEndAmplitude, calculatedMasterGainEnvelope.decayEndTime);
    }


    // Filter
    filter = synthInstrument.buildFilter(audioContext, config.filter.cutoff, config.filter.resonance);

    filterLfoGain = synthInstrument.buildGain(audioContext, config.filter.lfo.amplitude);
    filterLfoGain.connect(filter.detune);

    filterLfoOscillator = synthInstrument.buildOscillator(audioContext, config.filter.lfo.waveform, config.filter.lfo.frequency, 0);
    filterLfoOscillator.connect(filterLfoGain);
    filterLfoOscillator.start(gateOnTime);

    calculatedFilterEnvelope = Envelope(config.filter.envelope.amount, config.filter.envelope, gateOnTime, gateOffTime);

    // Envelope Attack
    filter.frequency.setValueAtTime(config.filter.cutoff, envelopeAttackStartTime);
    filter.frequency.linearRampToValueAtTime(config.filter.cutoff + calculatedFilterEnvelope.attackEndAmplitude, calculatedFilterEnvelope.attackEndTime);

    // Envelope Decay/Sustain
    if (calculatedFilterEnvelope.attackEndTime < gateOffTime) {
      filter.frequency.linearRampToValueAtTime(config.filter.cutoff + calculatedFilterEnvelope.decayEndAmplitude, calculatedFilterEnvelope.decayEndTime);
    }

    filter.connect(masterGain);


    // Base sound generator
    oscillator1Gain = synthInstrument.buildGain(audioContext, config.oscillators[0].amplitude);
    oscillator1 = synthInstrument.buildOscillator(audioContext,
                                                  config.oscillators[0].waveform,
                                                  note.frequency() * Math.pow(2, config.oscillators[0].octave),
                                                  config.oscillators[0].detune);
    oscillator1.connect(oscillator1Gain);
    oscillator1Gain.connect(filter);
    oscillator1.start(gateOnTime);

    // Secondary sound generator
    oscillator2Gain = synthInstrument.buildGain(audioContext, config.oscillators[1].amplitude);
    oscillator2 = synthInstrument.buildOscillator(audioContext,
                                                  config.oscillators[1].waveform,
                                                  note.frequency() * Math.pow(2, config.oscillators[1].octave),
                                                  config.oscillators[1].detune);
    oscillator2.connect(oscillator2Gain);
    oscillator2Gain.connect(filter);
    oscillator2.start(gateOnTime);

    // Noise
    noiseGain = synthInstrument.buildGain(audioContext, config.noise.amplitude);
    noise = audioContext.createBufferSource();
    if (config.noise.type === "white") {
      noise.buffer = whiteNoiseBuffer;
    }
    else if (config.noise.type === "pink") {
      noise.buffer = pinkNoiseBuffer;
    }
    else {
      console.log("Error: Invalid noise type '" + config.noise.type + "'");
    }
    noise.loop = true;
    noise.connect(noiseGain);
    noiseGain.connect(filter);
    noise.start(gateOnTime);

    // LFO for base sound
    if (config.lfo.frequency > 0.0 && config.lfo.amplitude > 0.0) {
      pitchLfoOscillator = synthInstrument.buildOscillator(audioContext, config.lfo.waveform, config.lfo.frequency, 0);
      pitchLfoGain = synthInstrument.buildGain(audioContext, config.lfo.amplitude);
      pitchLfoOscillator.connect(pitchLfoGain);
      pitchLfoGain.connect(oscillator1.detune);
      pitchLfoGain.connect(oscillator2.detune);
      pitchLfoOscillator.start(gateOnTime);
    }

    return {
      gateOnTime: gateOnTime,
      amplitude: masterGainAmplitude,
      oscillator1: oscillator1,
      oscillator2: oscillator2,
      noise: noise,
      filter: filter,
      masterGain: masterGain,
      pitchLfoOscillator: pitchLfoOscillator,
      filterLfoOscillator: filterLfoOscillator,
    };
  };


  return synthInstrument;
};

var Envelope = function(targetAttackAmplitude, envelopeConfig, gateOnTime, gateOffTime) {
  var attackEndTime = gateOnTime + envelopeConfig.attackTime;
  var attackEndAmplitude, attackEndAmplitudePercentage;
  var decayEndTime, decayEndAmplitude, decayEndAmplitudePercentage;
  var sustainAmplitude;
  var delta;

  var valueAtTime = function(rawTime, rawGateOffTime) {
    var time = rawTime - gateOnTime;
    var gateOffTime = rawGateOffTime - gateOnTime;
    var sustainAmplitude = targetAttackAmplitude * envelopeConfig.sustainPercentage;

    if (time < 0.0) {
      return 0.0;
    }
    else if (time > gateOffTime) {
      // In release portion
      if (time >= (gateOffTime + envelopeConfig.releaseTime)) {
        return 0.0;
      }
      else {
        return (1.0 - ((time - gateOffTime) / envelopeConfig.releaseTime)) * sustainAmplitude;
      }
    }
    else if (time <= envelopeConfig.attackTime) {
      // In attack portion
      if (envelopeConfig.attackTime === 0) {
        return targetAttackAmplitude;
      }
      else {
        return (time / envelopeConfig.attackTime) * targetAttackAmplitude;
      }
    }
    else if (time <= (envelopeConfig.attackTime + envelopeConfig.decayTime)) {
      // In decay portion
      return ((1.0 - ((time - envelopeConfig.attackTime) / envelopeConfig.decayTime)) * (targetAttackAmplitude - sustainAmplitude)) + sustainAmplitude;
    }
    else {
      // In sustain portion
      return sustainAmplitude;
    }
  };

  if (attackEndTime < gateOffTime) {
    attackEndAmplitude = targetAttackAmplitude;
  }
  else {
    attackEndAmplitudePercentage = ((gateOffTime - gateOnTime) / (attackEndTime - gateOnTime));
    attackEndAmplitude = targetAttackAmplitude * attackEndAmplitudePercentage;
    attackEndTime = gateOffTime;
  }

  decayEndTime = attackEndTime + Math.max(envelopeConfig.decayTime, 0.001);
  sustainAmplitude = targetAttackAmplitude * envelopeConfig.sustainPercentage;
  if (gateOffTime > decayEndTime) {
    decayEndAmplitude = sustainAmplitude;
  }
  else {
    decayEndAmplitudePercentage = ((gateOffTime - attackEndTime) / (decayEndTime - attackEndTime));
    decayEndTime = gateOffTime;

    delta = attackEndAmplitude - sustainAmplitude;
    decayEndAmplitude = attackEndAmplitude - (delta * decayEndAmplitudePercentage);
  }

  return {
    attackEndTime: attackEndTime,
    attackEndAmplitude: attackEndAmplitude,
    decayEndTime: decayEndTime,
    decayEndAmplitude: decayEndAmplitude,
    valueAtTime: valueAtTime,
  };
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
        sequence[i] = Note(noteName, octave, noteDuration);
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
    "B@@" : "A",

    "A#"  : "A#",
    "B@"  : "A#",
    "C@@" : "A#",

    "B"   : "B",
    "A##" : "B",
    "C@"  : "B",

    "C"   : "C",
    "B#"  : "C",
    "D@@" : "C",

    "C#"  : "C#",
    "B##" : "C#",
    "D@"  : "C#",

    "D"   : "D",
    "C##" : "D",
    "E@@" : "D",

    "D#"  : "D#",
    "E@"  : "D#",
    "F@@" : "D#",

    "E"   : "E",
    "D##" : "E",
    "F@"  : "E",

    "F"   : "F",
    "E#"  : "F",
    "G@@" : "F",

    "F#"  : "F#",
    "E##" : "F#",
    "G@"  : "F#",

    "G"   : "G",
    "F##" : "G",
    "A@@" : "G",

    "G#"  : "G#",
    "A@"  : "G#",
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

function InstrumentNote(note, instrument, amplitude, channelID) {
  return {
    note: function() { return note; },
    instrument: function() { return instrument; },
    amplitude: function() { return amplitude; },
    channelID: function() { return channelID; },
  };
};

function SongPlayer() {
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

  var tick = function(audioContext, audioSource, endTime, stepDuration, loop) {
    var scheduledSteps = [];
    var noteTimeDuration;
    var incomingNotes;

    while (currentTime < endTime) {
      incomingNotes = notes[stepIndex];
      incomingNotes.forEach(function(note) {
        noteTimeDuration = stepDuration * note.note().stepDuration();
        note.instrument().scheduleNote(audioContext, audioSource.destination(note.channelID()), note.note(), note.amplitude(), currentTime, currentTime + noteTimeDuration);
      });

      scheduledSteps.push({ step: stepIndex, time: currentTime });

      stepIndex += 1;
      if (stepIndex >= notes.length) {
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

  var playbackTime = function(stepDuration) {
    var note, noteTimeDuration, noteEndTime;
    var i, j;

    var noteStartTime = 0.0;
    var maxEndTime = 0.0;

    for (i = 0; i < notes.length; i++) {
      for(j = 0; j < notes[i].length; j++) {
        note = notes[i][j];
        noteTimeDuration = stepDuration * note.note().stepDuration();
        noteEndTime = noteStartTime + noteTimeDuration + note.instrument().config().envelope.releaseTime;

        if (noteEndTime > maxEndTime) {
          maxEndTime = noteEndTime;
        }
      }

      noteStartTime += stepDuration;
    }

    return maxEndTime;
  };


  reset();


  return {
    reset: reset,
    stepCount: function() { return notes.length; },
    isFinishedPlaying: function() { return isFinishedPlaying; },
    replaceNotes: replaceNotes,
    tick: tick,
    playbackTime: playbackTime,
  };
};


var AudioContextBuilder = (function() {
  var buildAudioContext = function() {
    var audioContext;

    if (window.AudioContext) {
      // Why create an AudioContext, immediately close it, and then recreate
      // another one? Good question.
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
    }

    return audioContext;
  };

  var buildOfflineAudioContext = function(channelCount, sampleCount, sampleRate) {
    var offlineAudioContext;

    if (window.offlineAudioContext) {
      offlineAudioContext = new OfflineAudioContext(channelCount, sampleCount, sampleRate);
    }
    else if (window.webkitOfflineAudioContext) {
      offlineAudioContext = new webkitOfflineAudioContext(channelCount, sampleCount, sampleRate);
    }

    return offlineAudioContext;
  };

  return {
    buildAudioContext: buildAudioContext,
    buildOfflineAudioContext: buildOfflineAudioContext,
  };
})();


function Channel(audioContext, audioDestination, initialAmplitude) {
  var gain = audioContext.createGain();

  var setAmplitude = function(newAmplitude) {
    gain.gain.value = newAmplitude;
  };

  var input = function() {
    return gain;
  };

  var destroy = function() {
    gain.disconnect(audioDestination);
  };

  setAmplitude(initialAmplitude);
  gain.connect(audioDestination);

  return {
    setAmplitude: setAmplitude,
    input: input,
    destroy: destroy,
  };
};

function ChannelCollection(audioContext, audioDestination) {
  var channels = {};
  var count = 0;

  var channel = function(id) {
    return channels[id];
  };

  var add = function(id, amplitude) {
    channels[id] = Channel(audioContext, audioDestination, amplitude);
    count += 1;
  };

  var remove = function(id) {
    channels[id].destroy();
    channels[id] = undefined;
    count -= 1;
  };

  return {
    channel: channel,
    add: add,
    remove: remove,
    count: function() { return count; },
  };
};

function AudioSource(audioContext) {
  var clipDetector;
  var masterGain;
  var channelCollection;

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

  var addChannel = function(id, amplitude) {
    channelCollection.add(id, amplitude);
  };

  var removeChannel = function(id) {
    channelCollection.remove(id);
  };

  var setChannelAmplitude = function(id, newAmplitude) {
    var channel = channelCollection.channel(id);
    channel.setAmplitude(newAmplitude);
  };

  var destination = function(id) {
    var channel = channelCollection.channel(id);

    if (channel === undefined) {
      return undefined;
    }

    return channel.input();
  };

  var playImmediateNote = function(instrument, note, amplitude, channelID) {
    return instrument.gateOn(audioContext, destination(channelID), note, amplitude, audioContext.currentTime, Number.POSITIVE_INFINITY);
  };

  var stopNote = function(instrument, noteContext) {
    instrument.gateOff(noteContext, audioContext.currentTime, true);
  };

  var setClipDetectionEnabled = function(isEnabled) {
    if (isEnabled === true) {
      clipDetector.connect(audioContext.destination);
    }
    else {
      clipDetector.disconnect(audioContext.destination);
    }
  };


  if (audioContext !== undefined) {
    clipDetector = audioContext.createScriptProcessor(512);
    clipDetector.onaudioprocess = detectClipping;

    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.connect(clipDetector);

    channelCollection = ChannelCollection(audioContext, masterGain);
  }

  return {
    audioContext: function() { return audioContext; },
    masterGain: function() { return masterGain; },
    addChannel: addChannel,
    removeChannel: removeChannel,
    setChannelAmplitude: setChannelAmplitude,
    destination: destination,
    playImmediateNote: playImmediateNote,
    stopNote: stopNote,
    setClipDetectionEnabled: setClipDetectionEnabled,
  };
};


function Transport(audioSource, songPlayer, stopCallback) {
  var SCHEDULE_AHEAD_TIME = 0.2;  // in seconds
  var TICK_INTERVAL = 50;         // in milliseconds
  var LOOP = true;

  var currentStep;
  var scheduledSteps;
  var stepInterval;
  var timeoutId;
  var isPlaying = false;

  var tick = function() {
    var finalTime = audioSource.audioContext().currentTime + SCHEDULE_AHEAD_TIME;

    var newScheduledSteps = songPlayer.tick(audioSource.audioContext(), audioSource, finalTime, stepInterval, LOOP);
    scheduledSteps = scheduledSteps.concat(newScheduledSteps);

    if (songPlayer.isFinishedPlaying()) {
      stop();
      window.setTimeout(stopCallback, stepInterval * 1000);
    }
  };

  var start = function() {
    var audioContext = audioSource.audioContext();

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

    audioSource.setClipDetectionEnabled(true);

    tick();
    timeoutId = window.setInterval(tick, TICK_INTERVAL);
    isPlaying = true;
  };

  var stop = function() {
    window.clearInterval(timeoutId);
    audioSource.setClipDetectionEnabled(false);
    isPlaying = false;
  };

  var setTempo = function(newTempo) {
    var sixteenthsPerMinute = newTempo * 4;
    stepInterval = 60.0 / sixteenthsPerMinute;
  };

  var toggle = function() {
    if (isPlaying) {
      stop();
    }
    else {
      start();
    }
  };

  var calculateCurrentStep = function() {
    if (!isPlaying) {
      return undefined;
    }

    var currentTime = audioSource.audioContext().currentTime;
    var i = 0;
    while (i < scheduledSteps.length && scheduledSteps[i].time <= currentTime) {
      currentStep = scheduledSteps[i].step;
      scheduledSteps.splice(0, 1);

      i++;
    }

    return currentStep;
  };


  setTempo(100);


  return {
    setTempo: setTempo,
    toggle: toggle,
    currentStep: calculateCurrentStep,
  };
};


function OfflineTransport(songPlayer, tempo, amplitude, completeCallback) {
  var NUM_CHANNELS = 1;
  var SAMPLE_RATE = 44100;
  var SIXTEENTHS_PER_MINUTE = tempo * 4;
  var STEP_INTERVAL = 60.0 / SIXTEENTHS_PER_MINUTE;

  var buildOfflineAudioContext = function() {
    var minimumPlaybackTime = songPlayer.stepCount() * STEP_INTERVAL;
    var actualPlaybackTime = songPlayer.playbackTime(STEP_INTERVAL);
    var playbackTime = Math.max(minimumPlaybackTime, actualPlaybackTime);

    var sampleCount = SAMPLE_RATE * playbackTime;
    var offlineAudioContext = AudioContextBuilder.buildOfflineAudioContext(NUM_CHANNELS, sampleCount, SAMPLE_RATE);

    offlineAudioContext.oncomplete = function(e) {
      var waveWriter = WaveWriter();

      var sampleData = e.renderedBuffer.getChannelData(0);
      var outputView = waveWriter.write(sampleData);
      var blob = new Blob([outputView], { type: "audio/wav" });

      completeCallback(blob);
    };

    return offlineAudioContext;
  };

  var tick = function() {
    var scheduleAheadTime = songPlayer.stepCount() * STEP_INTERVAL;
    var startTime = offlineAudioContext.currentTime;
    var finalTime = startTime + scheduleAheadTime;

    songPlayer.reset(startTime);
    songPlayer.tick(offlineAudioContext, offlineAudioSource, finalTime, STEP_INTERVAL, false);

    offlineAudioContext.startRendering();
  };

  var offlineAudioContext = buildOfflineAudioContext();
  var offlineAudioSource = AudioSource(offlineAudioContext);
  offlineAudioSource.masterGain().gain.value = amplitude;


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
  var MAX_SAMPLE_VALUE = 32767;

  var BLOCK_ALIGN = BYTES_PER_SAMPLE * NUM_CHANNELS;
  var BYTE_RATE = BLOCK_ALIGN * SAMPLE_RATE;

  var WAVEFILE_HEADER_BYTE_COUNT = 44;
  var RIFF_CHUNK_BODY_BYTE_COUNT_MINIMUM = 36;
  var FORMAT_CHUNK_BODY_BYTE_COUNT = 16;

  var write = function(rawFloat32SampleData) {
    var sampleDataByteCount = rawFloat32SampleData.length * BYTES_PER_SAMPLE;
    var fileLength = WAVEFILE_HEADER_BYTE_COUNT + sampleDataByteCount;
    var outputView = new DataView(new ArrayBuffer(fileLength));
    var constrainedSample;
    var i;

    outputView.setUint8(  0, "R".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8(  1, "I".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8(  2, "F".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8(  3, "F".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint32( 4, RIFF_CHUNK_BODY_BYTE_COUNT_MINIMUM + sampleDataByteCount, LITTLE_ENDIAN);
    outputView.setUint8(  8, "W".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8(  9, "A".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 10, "V".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 11, "E".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 12, "f".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 13, "m".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 14, "t".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 15, " ".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint32(16, FORMAT_CHUNK_BODY_BYTE_COUNT, LITTLE_ENDIAN);
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

    // Float32Array doesn't appear to support forEach() in Safari 9
    for (i = 0; i < rawFloat32SampleData.length; i++) {
      // Should this round?
      constrainedSample = Math.max(Math.min(rawFloat32SampleData[i], 1.0), -1.0);
      outputView.setInt16(WAVEFILE_HEADER_BYTE_COUNT + (i * BYTES_PER_SAMPLE), constrainedSample * MAX_SAMPLE_VALUE, LITTLE_ENDIAN);
    }

    return outputView;
  };


  return {
    write: write,
  };
};

export { BufferCollection, SynthInstrument, SampleInstrument, Envelope, SequenceParser, Note, SongPlayer, AudioContextBuilder, AudioSource, Transport, OfflineTransport, InstrumentNote, WaveWriter };
