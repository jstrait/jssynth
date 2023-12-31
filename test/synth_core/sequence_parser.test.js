"use strict";

import { SequenceParser } from "./../../src/synth_core/sequence_parser";

describe("SequenceParser", () => {
  test("should properly parse a valid sequence", () => {
    var rawSequence = ["A4", "B@2", "", "C#5", ""];
    var parsedSequence = SequenceParser.parse(rawSequence);

    expect(parsedSequence.length).toEqual(4);
    expect(Object.keys(parsedSequence)).toEqual(["0", "1", "3"]);

    expect(parsedSequence[0].name()).toEqual("A");
    expect(parsedSequence[0].octave()).toEqual(4);
    expect(parsedSequence[0].amplitude()).toEqual(1.0);
    expect(parsedSequence[0].stepCount()).toEqual(1);

    expect(parsedSequence[1].name()).toEqual("B@");
    expect(parsedSequence[1].octave()).toEqual(2);
    expect(parsedSequence[1].amplitude()).toEqual(1.0);
    expect(parsedSequence[1].stepCount()).toEqual(1);

    expect(parsedSequence[2]).toBe(undefined);

    expect(parsedSequence[3].name()).toEqual("C#");
    expect(parsedSequence[3].octave()).toEqual(5);
    expect(parsedSequence[3].amplitude()).toEqual(1.0);
    expect(parsedSequence[3].stepCount()).toEqual(1);
  });

  test("should properly parse a sequence containing ties", () => {
    var rawSequence = ["A4", "-", "-", "-", "C2", "-", "D4", "G3", "-", "-"];
    var parsedSequence = SequenceParser.parse(rawSequence);

    expect(parsedSequence.length).toEqual(8);
    expect(Object.keys(parsedSequence)).toEqual(["0", "4", "6", "7"]);

    expect(parsedSequence[0].name()).toEqual("A");
    expect(parsedSequence[0].octave()).toEqual(4);
    expect(parsedSequence[0].amplitude()).toEqual(1.0);
    expect(parsedSequence[0].stepCount()).toEqual(4);

    expect(parsedSequence[1]).toBe(undefined);
    expect(parsedSequence[2]).toBe(undefined);
    expect(parsedSequence[3]).toBe(undefined);

    expect(parsedSequence[4].name()).toEqual("C");
    expect(parsedSequence[4].octave()).toEqual(2);
    expect(parsedSequence[4].amplitude()).toEqual(1.0);
    expect(parsedSequence[4].stepCount()).toEqual(2);

    expect(parsedSequence[5]).toBe(undefined);

    expect(parsedSequence[6].name()).toEqual("D");
    expect(parsedSequence[6].octave()).toEqual(4);
    expect(parsedSequence[6].amplitude()).toEqual(1.0);
    expect(parsedSequence[6].stepCount()).toEqual(1);

    expect(parsedSequence[7].name()).toEqual("G");
    expect(parsedSequence[7].octave()).toEqual(3);
    expect(parsedSequence[7].amplitude()).toEqual(1.0);
    expect(parsedSequence[7].stepCount()).toEqual(3);
  });

  test("should properly parse a sequence with invalid note names", () => {
    var rawSequence = ["V3", "-", "-", "-", "4", "A", "@5", "3A", "C2"];
    var parsedSequence = SequenceParser.parse(rawSequence);

    expect(parsedSequence.length).toEqual(9);
    expect(Object.keys(parsedSequence)).toEqual(["8"]);

    expect(parsedSequence[0]).toBe(undefined);
    expect(parsedSequence[1]).toBe(undefined);
    expect(parsedSequence[2]).toBe(undefined);
    expect(parsedSequence[3]).toBe(undefined);
    expect(parsedSequence[4]).toBe(undefined);
    expect(parsedSequence[5]).toBe(undefined);
    expect(parsedSequence[6]).toBe(undefined);
    expect(parsedSequence[7]).toBe(undefined);

    expect(parsedSequence[8].name()).toEqual("C");
    expect(parsedSequence[8].octave()).toBe(2);
    expect(parsedSequence[8].amplitude()).toEqual(1.0);
    expect(parsedSequence[8].stepCount()).toEqual(1);
  });

  test("should properly parse a sequence containing trailing spaces", () => {
    var rawSequence = ["A4", "-", "-", "-", "", "", ""];
    var parsedSequence = SequenceParser.parse(rawSequence);

    expect(parsedSequence.length).toBe(1);
    expect(Object.keys(parsedSequence)).toEqual(["0"]);

    expect(parsedSequence[0].name()).toEqual("A");
    expect(parsedSequence[0].octave()).toEqual(4);
    expect(parsedSequence[0].amplitude()).toEqual(1.0);
    expect(parsedSequence[0].stepCount()).toEqual(4);
  });

  test("should properly parse a sequence with unattached sustain characters ('-')", () => {
    var rawSequence = ["A4", "-", "", "-", "-", "C2"];
    var parsedSequence = SequenceParser.parse(rawSequence);

    expect(parsedSequence.length).toEqual(6);
    expect(Object.keys(parsedSequence)).toEqual(["0", "5"]);

    expect(parsedSequence[0].name()).toEqual("A");
    expect(parsedSequence[0].octave()).toEqual(4);
    expect(parsedSequence[0].amplitude()).toEqual(1.0);
    expect(parsedSequence[0].stepCount()).toEqual(2);

    expect(parsedSequence[1]).toBe(undefined);
    expect(parsedSequence[2]).toBe(undefined);
    expect(parsedSequence[3]).toBe(undefined);
    expect(parsedSequence[4]).toBe(undefined);

    expect(parsedSequence[5].name()).toEqual("C");
    expect(parsedSequence[5].octave()).toEqual(2);
    expect(parsedSequence[5].amplitude()).toEqual(1.0);
    expect(parsedSequence[5].stepCount()).toEqual(1);
  });

  test("should properly parse a sequence with leading sustain characters ('-')", () => {
    var rawSequence = ["-", "-", "-", "-"];
    var parsedSequence = SequenceParser.parse(rawSequence);

    expect(parsedSequence).toEqual([]);
    expect(parsedSequence.length).toEqual(0);
    expect(Object.keys(parsedSequence)).toEqual([]);
  });
});
