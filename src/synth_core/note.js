"use strict";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTES_IN_OCTAVE = 12;
const MIDDLE_A_MIDI_NOTE_NUMBER = 69;
const MIDDLE_A_FREQUENCY = 440.0;

const ENHARMONIC_EQUIVALENTS = {
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


export function Note(newNoteName, newOctave, newAmplitude, newStepCount) {
  var noteName = newNoteName;
  var normalizedNoteName = ENHARMONIC_EQUIVALENTS[noteName];
  var octave = newOctave;
  var amplitude = newAmplitude;
  var stepCount = newStepCount;
  var midiNote;
  var frequency;

  if (normalizedNoteName === undefined) {
    throw TypeError("Invalid note name: \"" + noteName + "\"");
  }
  else if (!(Number.isInteger(octave) && (octave >= 0 ) && (octave <= 7))) {
    throw TypeError("Invalid octave: \"" + octave + "\"");
  }
  else if (!((typeof amplitude === "number") && (amplitude >= 0.0) && (amplitude <= 1.0))) {
    throw TypeError("Invalid amplitude: \"" + amplitude + "\"");
  }
  else if (!(Number.isInteger(stepCount) && (stepCount >= 0 ))) {
    throw TypeError("Invalid step count: \"" + stepCount + "\"");
  }

  midiNote = 12 + (octave * NOTES_IN_OCTAVE) + NOTE_NAMES.indexOf(normalizedNoteName);
  frequency = (2 ** ((midiNote - MIDDLE_A_MIDI_NOTE_NUMBER) / 12)) * MIDDLE_A_FREQUENCY;

  return {
    name: function() { return noteName; },
    octave: function() { return octave; },
    midiNote: function() { return midiNote; },
    amplitude: function() { return amplitude; },
    stepCount: function() { return stepCount; },
    frequency: function() { return frequency; },
  };
};
