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
        octave = parseInt(noteString.slice(-1), 10);

        try {
          sequence[i] = Note(noteName, octave, 1.0, noteDuration);
        }
        catch (e) {
          // If the note is invalid, we want to skip it without causing
          // things to crash, and also avoid adding a console log message
          // because invalid notes are expected as a normal possibility
          // of user input. Therefore, in case of an error, skip it and
          // do nothing.
        }

        noteDuration = 1;
      }
    }

    return sequence;
  },
};
