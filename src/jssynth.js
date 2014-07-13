"use strict";

var JSSynth = JSSynth || {};

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
    if (note.frequency() > 0.0) {
      // Base sound generator
      var oscillator = buildOscillator(config.waveform, note.frequency());

      // LFO for base sound
      var pitchLfoOscillator = buildOscillator(config.lfoWaveform, config.lfoFrequency);
      var pitchLfoGain = buildGain(config.lfoAmplitude);
      pitchLfoOscillator.connect(pitchLfoGain);
      pitchLfoGain.connect(oscillator.frequency);

      // Filter
      var filter = buildFilter(config.filterCutoff, config.filterResonance);
      var filterLfoOscillator = buildOscillator(config.filterLFOWaveform, config.filterLFOFrequency);
      // The amplitude is constrained to be at most the same as the cutoff frequency, to prevent
      // pops/clicks.
      var filterLfoGain = buildGain(Math.min(config.filterCutoff, config.filterLFOAmplitude));
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

      // Envelope Attack
      masterGain.gain.setValueAtTime(0.0, gateOnTime);
      var attackEndTime = gateOnTime + config.envelopeAttack;
      if (gateOffTime > attackEndTime) {
        masterGain.gain.linearRampToValueAtTime(config.amplitude, attackEndTime);
      }
      else {
        var attackEndAmplitudePercentage = ((gateOffTime - gateOnTime) / (attackEndTime - gateOnTime));
        attackEndTime = gateOffTime;
        masterGain.gain.linearRampToValueAtTime(config.amplitude * attackEndAmplitudePercentage, attackEndTime);
      }

      // Envelope Decay/Sustain
      if (attackEndTime < gateOffTime) {
        var delayEndTime = attackEndTime + config.envelopeDecay;

        if (gateOffTime > delayEndTime) {
          masterGain.gain.linearRampToValueAtTime(config.envelopeSustain * config.amplitude, delayEndTime);
        }
        else {
          var delayEndAmplitudePercentage = ((gateOffTime - gateOnTime) / (delayEndTime - gateOnTime));
          delayEndTime = gateOffTime;
          masterGain.gain.linearRampToValueAtTime(config.amplitude * delayEndAmplitudePercentage, delayEndTime);
        }
      }

      // Envelope Release
      var releaseEndTime = Math.max(gateOffTime + 0.001, gateOffTime + config.envelopeRelease);
      masterGain.gain.linearRampToValueAtTime(0.0, releaseEndTime);

      oscillator.stop(releaseEndTime);
      pitchLfoOscillator.stop(releaseEndTime);
      filterLfoOscillator.stop(releaseEndTime);
    }
  };

  return instrument;
}

JSSynth.Transport = function(audioContext, instrument, rawNotes, tempo, loop, stopCallback) {
  var transport = {};

  var SCHEDULE_AHEAD_TIME = 0.2;
  var TICK_INTERVAL = 50;  // in milliseconds

  transport.updateTempo = function(newTempo) {
    transport.tempo = newTempo;

    var sixteenthsPerMinute = transport.tempo * 4;
    transport.stepTime = 60.0 / sixteenthsPerMinute;
  };

  transport.updateNotes = function(newNotes) {
    transport.sequence = JSSynth.SequenceParser.parse(newNotes);
  };

  transport.toggle = function() {
    if (playing) {
      stop();
    }
    else {
      start();
    }
  };

  function tick() {
    var sequence = transport.sequence;
    var finalTime = audioContext.currentTime + SCHEDULE_AHEAD_TIME;
    var note;

    while (nextNoteTime < finalTime) {
      note = sequence[sequenceIndex];

      transport.instrument.playNote(note, nextNoteTime, nextNoteTime + transport.stepTime);

      sequenceIndex += 1;
      if (sequenceIndex >= sequence.length) {
        if (transport.loop) {
          sequenceIndex = 0;
        }
        else {
          stop();
          window.setTimeout(stopCallback, transport.stepTime * 1000);
        }
      }

      nextNoteTime += transport.stepTime;
    }
  };

  function start() {
    sequenceIndex = 0;
    nextNoteTime = audioContext.currentTime;

    tick();
    timeoutId = window.setInterval(tick, TICK_INTERVAL);
    playing = true;
  };

  function stop() {
    window.clearInterval(timeoutId);
    playing = false;
  };

  var sequenceIndex;
  var nextNoteTime;
  var timeoutId;
  var playing = false;

  transport.updateNotes(rawNotes);
  transport.loop = loop;
  transport.instrument = instrument;

  transport.updateTempo(tempo);

  return transport;
};

JSSynth.SequenceParser = {
  parse: function(rawNotes) {
    var i;
    var noteName, octave;
    var sequence = [];
    var splitNotes = rawNotes.split(" ");

    for (i = 0; i < splitNotes.length; i++) {
      noteName = splitNotes[i].slice(0, -1);
      octave = splitNotes[i].slice(-1);
      sequence[i] = JSSynth.Note(noteName, octave, 1);
    }

    return sequence;
  },
};

JSSynth.Note = function(noteName, octave, duration) {
  var note = {};

  note.noteName = noteName;
  note.octave = octave;
  note.duration = duration;

  note.frequency = function() {
    if (noteName === "_" || noteName === ".") {
      return 0.0;
    }

    noteName = JSSynth.MusicTheory.ENHARMONIC_EQUIVALENTS[noteName];
    var octaveMultiplier = Math.pow(2.0, (octave - JSSynth.MusicTheory.MIDDLE_OCTAVE));
    var frequency = JSSynth.MusicTheory.NOTE_RATIOS[noteName] * JSSynth.MusicTheory.MIDDLE_A_FREQUENCY * octaveMultiplier;

    return frequency;
  };

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
