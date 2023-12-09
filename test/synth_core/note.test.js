"use strict";

import { Note } from "./../../src/synth_core/note";

describe("Note", function() {
  it("should construct a Note properly", function() {
    var note = Note("A", 3, 0.75, 1);

    expect(note.name()).toEqual("A");
    expect(note.octave()).toEqual(3);
    expect(note.amplitude()).toEqual(0.75);
    expect(note.stepCount()).toEqual(1);
    expect(note.frequency()).toEqual(220.0);
    expect(note.midiNote()).toEqual(57);
  });

  it("should raise an error if the note has invalid values", function() {
    // Name
    expect(function() { Note("a", 3, 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note("V", 3, 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note("A!", 3, 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note("@", 3, 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note("A@@@", 3, 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note("A###", 3, 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note("A@#", 3, 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note(" ", 3, 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note("", 3, 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note(0, 3, 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note(undefined, 3, 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note(null, 3, 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note(true, 3, 1.0, 1) }).toThrowError(TypeError);

    // Octave
    expect(function() { Note("A", "", 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note("A", "Q", 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note("A", "3", 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note("A", -1, 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note("A", 8, 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note("A", 2.1, 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note("A", NaN, 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note("A", undefined, 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note("A", null, 1.0, 1) }).toThrowError(TypeError);
    expect(function() { Note("A", true, 1.0, 1) }).toThrowError(TypeError);

    // Amplitude
    expect(function() { Note("A", 3, "", 1) }).toThrowError(TypeError);
    expect(function() { Note("A", 3, "1.0", 1) }).toThrowError(TypeError);
    expect(function() { Note("A", 3, "A", 1) }).toThrowError(TypeError);
    expect(function() { Note("A", 3, -1, 1) }).toThrowError(TypeError);
    expect(function() { Note("A", 3, 1.2, 1) }).toThrowError(TypeError);
    expect(function() { Note("A", 3, NaN, 1) }).toThrowError(TypeError);
    expect(function() { Note("A", 3, undefined, 1) }).toThrowError(TypeError);
    expect(function() { Note("A", 3, null, 1) }).toThrowError(TypeError);
    expect(function() { Note("A", 3, true, 1) }).toThrowError(TypeError);

    // Step count
    expect(function() { Note("A", 3, 1.0, "") }).toThrowError(TypeError);
    expect(function() { Note("A", 3, 1.0, "1") }).toThrowError(TypeError);
    expect(function() { Note("A", 3, 1.0, "A") }).toThrowError(TypeError);
    expect(function() { Note("A", 3, 1.0, -1) }).toThrowError(TypeError);
    expect(function() { Note("A", 3, 1.0, 1.2) }).toThrowError(TypeError);
    expect(function() { Note("A", 3, 1.0, NaN) }).toThrowError(TypeError);
    expect(function() { Note("A", 3, 1.0, undefined) }).toThrowError(TypeError);
    expect(function() { Note("A", 3, 1.0, null) }).toThrowError(TypeError);
    expect(function() { Note("A", 3, 1.0, true) }).toThrowError(TypeError);
  });

  it("should handle enharmonic equivalents properly", function() {
    var note1 = Note("D#", 3, 1.0, 1);
    var note2 = Note("E@", 3, 1.0, 1);
    var note3 = Note("F@@", 3, 1.0, 1);

    expect(note1.name()).toEqual("D#");
    expect(note1.octave()).toEqual(3);
    expect(note1.amplitude()).toEqual(1.0);
    expect(note1.stepCount()).toEqual(1);
    expect(note1.frequency()).toEqual(155.56349186104043);
    expect(note1.midiNote()).toEqual(51);

    expect(note2.name()).toEqual("E@");
    expect(note2.octave()).toEqual(3);
    expect(note2.amplitude()).toEqual(1.0);
    expect(note2.stepCount()).toEqual(1);
    expect(note2.frequency()).toEqual(155.56349186104043);
    expect(note2.midiNote()).toEqual(51);

    expect(note3.name()).toEqual("F@@");
    expect(note3.octave()).toEqual(3);
    expect(note3.amplitude()).toEqual(1.0);
    expect(note3.stepCount()).toEqual(1);
    expect(note3.frequency()).toEqual(155.56349186104043);
    expect(note3.midiNote()).toEqual(51);
  });

  it("should handle notes at start/end of valid range properly", function() {
    var note = Note("C", 0, 1.0, 1);

    expect(note.name()).toEqual("C");
    expect(note.octave()).toEqual(0);
    expect(note.amplitude()).toEqual(1.0);
    expect(note.stepCount()).toEqual(1);
    expect(note.frequency()).toEqual(16.351597831287414);
    expect(note.midiNote()).toEqual(12);

    note = Note("A", 0, 1.0, 1);

    expect(note.name()).toEqual("A");
    expect(note.octave()).toEqual(0);
    expect(note.amplitude()).toEqual(1.0);
    expect(note.stepCount()).toEqual(1);
    expect(note.frequency()).toEqual(27.5);
    expect(note.midiNote()).toEqual(21);

    note = Note("B", 7, 1.0, 1);

    expect(note.name()).toEqual("B");
    expect(note.octave()).toEqual(7);
    expect(note.amplitude()).toEqual(1.0);
    expect(note.stepCount()).toEqual(1);
    expect(note.frequency()).toEqual(3951.066410048992);
    expect(note.midiNote()).toEqual(107);
  });
});
