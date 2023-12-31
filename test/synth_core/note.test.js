"use strict";

import { Note } from "./../../src/synth_core/note";

describe("Note", () => {
  test("returns correct object when constructed with valid argument values", () => {
    var note = Note("A", 3, 0.75, 1);

    expect(note.name()).toEqual("A");
    expect(note.octave()).toEqual(3);
    expect(note.amplitude()).toEqual(0.75);
    expect(note.stepCount()).toEqual(1);
    expect(note.frequency()).toEqual(220.0);
    expect(note.midiNote()).toEqual(57);
  });

  test("raises an error if constructed with an invalid argument value", () => {
    // Name
    expect(() => Note("a", 3, 1.0, 1)).toThrowError(TypeError);
    expect(() => Note("V", 3, 1.0, 1)).toThrowError(TypeError);
    expect(() => Note("A!", 3, 1.0, 1)).toThrowError(TypeError);
    expect(() => Note("@", 3, 1.0, 1)).toThrowError(TypeError);
    expect(() => Note("A@@@", 3, 1.0, 1)).toThrowError(TypeError);
    expect(() => Note("A###", 3, 1.0, 1)).toThrowError(TypeError);
    expect(() => Note("A@#", 3, 1.0, 1)).toThrowError(TypeError);
    expect(() => Note(" ", 3, 1.0, 1)).toThrowError(TypeError);
    expect(() => Note("", 3, 1.0, 1)).toThrowError(TypeError);
    expect(() => Note(0, 3, 1.0, 1)).toThrowError(TypeError);
    expect(() => Note(undefined, 3, 1.0, 1)).toThrowError(TypeError);
    expect(() => Note(null, 3, 1.0, 1)).toThrowError(TypeError);
    expect(() => Note(true, 3, 1.0, 1)).toThrowError(TypeError);

    // Octave
    expect(() => Note("A", "", 1.0, 1)).toThrowError(TypeError);
    expect(() => Note("A", "Q", 1.0, 1)).toThrowError(TypeError);
    expect(() => Note("A", "3", 1.0, 1)).toThrowError(TypeError);
    expect(() => Note("A", -1, 1.0, 1)).toThrowError(TypeError);
    expect(() => Note("A", 8, 1.0, 1)).toThrowError(TypeError);
    expect(() => Note("A", 2.1, 1.0, 1)).toThrowError(TypeError);
    expect(() => Note("A", NaN, 1.0, 1)).toThrowError(TypeError);
    expect(() => Note("A", undefined, 1.0, 1)).toThrowError(TypeError);
    expect(() => Note("A", null, 1.0, 1)).toThrowError(TypeError);
    expect(() => Note("A", true, 1.0, 1)).toThrowError(TypeError);

    // Amplitude
    expect(() => Note("A", 3, "", 1)).toThrowError(TypeError);
    expect(() => Note("A", 3, "1.0", 1)).toThrowError(TypeError);
    expect(() => Note("A", 3, "A", 1)).toThrowError(TypeError);
    expect(() => Note("A", 3, -1, 1)).toThrowError(TypeError);
    expect(() => Note("A", 3, 1.2, 1)).toThrowError(TypeError);
    expect(() => Note("A", 3, NaN, 1)).toThrowError(TypeError);
    expect(() => Note("A", 3, undefined, 1)).toThrowError(TypeError);
    expect(() => Note("A", 3, null, 1)).toThrowError(TypeError);
    expect(() => Note("A", 3, true, 1)).toThrowError(TypeError);

    // Step count
    expect(() => Note("A", 3, 1.0, "")).toThrowError(TypeError);
    expect(() => Note("A", 3, 1.0, "1")).toThrowError(TypeError);
    expect(() => Note("A", 3, 1.0, "A")).toThrowError(TypeError);
    expect(() => Note("A", 3, 1.0, -1)).toThrowError(TypeError);
    expect(() => Note("A", 3, 1.0, 1.2)).toThrowError(TypeError);
    expect(() => Note("A", 3, 1.0, NaN)).toThrowError(TypeError);
    expect(() => Note("A", 3, 1.0, undefined)).toThrowError(TypeError);
    expect(() => Note("A", 3, 1.0, null)).toThrowError(TypeError);
    expect(() => Note("A", 3, 1.0, true)).toThrowError(TypeError);
  });

  test("handles enharmonic equivalents properly", () => {
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

  test("handles notes at start/end of valid range properly", () => {
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
