"use strict";

var JS100 = JS100 || {};

JS100.init = function() {
  var js100 = {};

  if ('AudioContext' in window) {
    js100.audioContext = new AudioContext();
  }
  else {
    alert("Your browser doesn't appear to be cool enough to run the JS-100");
    return;
  }

  return js100;
}

JS100.Instrument = function(audioContext, config) {
  var instrument = {};

  instrument.audioContext = audioContext;

  // VCO
  instrument.type = config.waveform;
  instrument.frequency = 440.0;
  instrument.amplitude = config.amplitude;

  // LFO
  instrument.lfoWaveform  = config.lfoWaveform;
  instrument.lfoFrequency = config.lfoFrequency;
  instrument.lfoAmplitude = config.lfoAmplitude;

  // VCF
  instrument.filterFrequency   = config.filterCutoff;
  instrument.filterResonance   = config.filterResonance;
  instrument.filterLFOWaveform = config.filterLFOWaveform;
  instrument.filterLFOFrequency = config.filterLFOFrequency;
  instrument.filterLFOAmplitude = config.filterLFOAmplitude;

  // Envelope
  instrument.envelopeAttack  = config.envelopeAttack;
  instrument.envelopeDecay   = config.envelopeDecay;
  instrument.envelopeSustain = config.envelopeSustain;
  instrument.envelopeRelease = config.envelopeRelease;

  return instrument;
};

JS100.InstrumentEvent = function(instrument) {
  var instrumentEvent = {};
  var audioContext = instrument.audioContext;
  instrumentEvent.instrument = instrument;

  // Build VCA
  var vca = audioContext.createGain();

  // Build VCF
  var vcf = audioContext.createBiquadFilter();

  // Build VCO
  var vco = audioContext.createOscillator();
  vco.type = instrument.type;

  // Build LFO
  var pitchLfoVco = audioContext.createOscillator();
  pitchLfoVco.type = instrument.lfoWaveform;
  pitchLfoVco.frequency.value = instrument.lfoFrequency;
  var pitchLfoGain = audioContext.createGain();
  pitchLfoGain.gain.value = instrument.lfoAmplitude;

  vcf.frequency.value = instrument.filterFrequency;
  vcf.Q.value = instrument.filterResonance;
  var filterLfoVco = audioContext.createOscillator();
  filterLfoVco.type = instrument.filterLFOWaveform;
  filterLfoVco.frequency.value = instrument.filterLFOFrequency;
  var filterLfoGain = audioContext.createGain();
  filterLfoGain.gain.value = instrument.filterLFOAmplitude;

  pitchLfoVco.connect(pitchLfoGain);
  pitchLfoGain.connect(vco.frequency);
  filterLfoVco.connect(filterLfoGain);
  filterLfoGain.connect(vcf.frequency);
  vco.connect(vcf);
  vcf.connect(vca);
  vca.connect(audioContext.destination);

  instrumentEvent.play = function(note, gateOnTime, gateOffTime) {
    if (note.frequency() > 0.0) {
      vco.frequency.value = note.frequency();

      vco.start(gateOnTime);
      pitchLfoVco.start(gateOnTime);
      filterLfoVco.start(gateOnTime);

      // Envelope
      vca.gain.setValueAtTime(0.0, gateOnTime);
      vca.gain.linearRampToValueAtTime(instrument.amplitude, gateOnTime + instrument.envelopeAttack);
      vca.gain.linearRampToValueAtTime(instrument.envelopeSustain * instrument.amplitude,
                                       gateOnTime + instrument.envelopeAttack + instrument.envelopeDecay);

      vco.stop(gateOffTime + instrument.envelopeRelease);
      vca.gain.linearRampToValueAtTime(0.0, gateOffTime + instrument.envelopeRelease);
      pitchLfoVco.stop(gateOffTime + instrument.envelopeRelease);
      filterLfoVco.stop(gateOffTime + instrument.envelopeRelease);
    }
  };

  return instrumentEvent;
}

JS100.Transport = function(audioContext, instrument, rawNotes, tempo, loop) {
  var transport = {};

  var SCHEDULE_AHEAD_TIME = 0.2;
  var TICK_INTERVAL = 50;  // in milliseconds

  var parseRawNotes = function(rawNotes) {
    var sequence = [];
    var splitNotes = rawNotes.split(" ");

    for (var i = 0; i < splitNotes.length; i++) {
      var noteParts = splitNotes[i].split("-");
      var note = JS100.Note(noteParts[0], noteParts[1], 1);
      sequence[i] = note;
    }

    return sequence;
  };

  transport.sequence = parseRawNotes(rawNotes);

  var sequenceIndex = 0;
  var loop = loop;
  var nextNoteTime = undefined;
  var timeoutId = undefined;

  transport.instrument = instrument;
  transport.updateTempo = function(newTempo) {
    transport.tempo = newTempo;

    var sixteenthsPerMinute = transport.tempo * 4;
    transport.stepTime = 60.0 / sixteenthsPerMinute;
  };
  transport.updateTempo(tempo);

  transport.tick = function() {
    var sequence = transport.sequence;
    var finalTime = audioContext.currentTime + SCHEDULE_AHEAD_TIME;

    while (nextNoteTime < finalTime) {
      for (var i = 0; i < sequence.length; i++) {
        var note = sequence[sequenceIndex];

        var e = new JS100.InstrumentEvent(transport.instrument);
        e.play(note, nextNoteTime, nextNoteTime + transport.stepTime);
      }

      sequenceIndex += 1;
      if (sequenceIndex >= sequence.length) {
        if (loop) {
          sequenceIndex = 0;
        }
        else {
          transport.stop();
        }
      }

      nextNoteTime += transport.stepTime;
    }
  };

  transport.start = function() {
    sequenceIndex = 0;
    nextNoteTime = audioContext.currentTime;

    transport.tick();
    timeoutId = window.setInterval(transport.tick, TICK_INTERVAL);
  };

  transport.stop = function() {
    window.clearInterval(timeoutId);
  };

  return transport;
};


JS100.Note = function(noteName, octave, duration) {
  var note = {};

  note.noteName = noteName;
  note.octave = octave;
  note.duration = duration;

  note.frequency = function() {
    if (noteName === "_" || noteName === ".") {
      return 0.0;
    }

    noteName = JS100.MusicTheory.ENHARMONIC_EQUIVALENTS[noteName];
    var octaveMultiplier = Math.pow(2.0, (octave - JS100.MusicTheory.MIDDLE_OCTAVE));
    var frequency = JS100.MusicTheory.NOTE_RATIOS[noteName] * JS100.MusicTheory.MIDDLE_A_FREQUENCY * octaveMultiplier;

    return frequency;
  };

  return note;
};

JS100.MusicTheory = {
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
