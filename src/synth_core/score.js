"use strict";

export function Score(notes) {
  return {
    notesAtStepIndex: function(stepIndex) { return notes[stepIndex]; },
    stepCount: function() { return notes.length; },
  };
};
