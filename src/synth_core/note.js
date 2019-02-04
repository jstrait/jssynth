"use strict";

export function Note(newNoteName, newOctave, newStepDuration) {
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
