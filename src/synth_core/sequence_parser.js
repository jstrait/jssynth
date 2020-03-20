"use strict";

import { Note } from "./note";

export var SequenceParser = {
  parse: function(noteStrings) {
    var sequence = [];
    var noteString;
    var i;
    var noteName;
    var octave;
    var noteDuration = 1;

    for (i = noteStrings.length - 1; i >= 0; i--) {
      noteString = noteStrings[i];

      if (noteString === "-") {
        noteDuration += 1;
      }
      else if (noteString === "") {
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
