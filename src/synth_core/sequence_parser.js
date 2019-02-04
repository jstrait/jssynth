"use strict";

import { Note } from "./note";

export var SequenceParser = {
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
