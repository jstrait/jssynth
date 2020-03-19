"use strict";

import * as SynthCore from "./../src/synth_core";

describe("SynthCore.Note", function() {
  it("should construct a Note properly", function() {
    var note = new SynthCore.Note('A', 3, 1);

    expect(note.name()).toEqual('A');
    expect(note.octave()).toEqual(3);
    expect(note.stepCount()).toEqual(1);
    expect(note.frequency()).toEqual(220.0);
  });

  it("should construct a Note properly", function() {
    var note = new SynthCore.Note('V', 3, 1);

    expect(note.name()).toEqual('V');
    expect(note.octave()).toEqual(3);
    expect(note.stepCount()).toEqual(1);
    expect(note.frequency()).toEqual(NaN);
  });

  it("should handle enharmonic equivalents properly", function() {
    var note1 = new SynthCore.Note("D#", 3, 1);
    var note2 = new SynthCore.Note("E@", 3, 1);
    var note3 = new SynthCore.Note("F@@", 3, 1);

    expect(note1.name()).toEqual('D#');
    expect(note1.octave()).toEqual(3);
    expect(note1.stepCount()).toEqual(1);
    expect(note1.frequency()).toEqual(155.56349186104046);

    expect(note2.name()).toEqual('E@');
    expect(note2.octave()).toEqual(3);
    expect(note2.stepCount()).toEqual(1);
    expect(note2.frequency()).toEqual(155.56349186104046);

    expect(note3.name()).toEqual('F@@');
    expect(note3.octave()).toEqual(3);
    expect(note3.stepCount()).toEqual(1);
    expect(note3.frequency()).toEqual(155.56349186104046);
  });

  it("should convert string values to numbers where appropriate", function() {
    var note = new SynthCore.Note('A', '3', '2');

    expect(note.name()).toEqual('A');
    expect(note.octave()).toEqual(3);
    expect(note.stepCount()).toEqual(2);
    expect(note.frequency()).toEqual(220.0);
  });

  it("should convert string values to numbers where appropriate", function() {
    var note = new SynthCore.Note('', '', '');

    expect(note.name()).toEqual('');
    expect(note.octave()).toEqual(NaN);
    expect(note.stepCount()).toEqual(NaN);
    expect(note.frequency()).toEqual(NaN);
  });
});


describe("SynthCore.SequenceParser", function() {
  it("should properly parse a valid sequence", function() {
    var rawSequence = "A4 B@2  C#5 ";
    var parsedSequence = new SynthCore.SequenceParser.parse(rawSequence);

    expect(parsedSequence.length).toEqual(5);
    expect(Object.keys(parsedSequence)).toEqual(["0", "1", "2", "3", "4"]);

    expect(parsedSequence[0].name()).toEqual("A");
    expect(parsedSequence[0].octave()).toEqual(4);
    expect(parsedSequence[0].stepCount()).toEqual(1);

    expect(parsedSequence[1].name()).toEqual("B@");
    expect(parsedSequence[1].octave()).toEqual(2);
    expect(parsedSequence[1].stepCount()).toEqual(1);

    expect(parsedSequence[2].name()).toEqual("");
    expect(parsedSequence[2].octave()).toBe(NaN);
    expect(parsedSequence[2].stepCount()).toEqual(1);

    expect(parsedSequence[3].name()).toEqual("C#");
    expect(parsedSequence[3].octave()).toEqual(5);
    expect(parsedSequence[3].stepCount()).toEqual(1);

    expect(parsedSequence[4].name()).toEqual("");
    expect(parsedSequence[4].octave()).toBe(NaN);
    expect(parsedSequence[4].stepCount()).toEqual(1);
  });

  it("should properly parse a sequence containing ties", function() {
    var rawSequence = "A4 - - - C2 - D4 G3 - -";

    var parsedSequence = new SynthCore.SequenceParser.parse(rawSequence);

    expect(parsedSequence.length).toEqual(8);
    expect(Object.keys(parsedSequence)).toEqual(["0", "4", "6", "7"]);

    expect(parsedSequence[0].name()).toEqual("A");
    expect(parsedSequence[0].octave()).toEqual(4);
    expect(parsedSequence[0].stepCount()).toEqual(4);

    expect(parsedSequence[1]).toBe(undefined);
    expect(parsedSequence[2]).toBe(undefined);
    expect(parsedSequence[3]).toBe(undefined);

    expect(parsedSequence[4].name()).toEqual("C");
    expect(parsedSequence[4].octave()).toEqual(2);
    expect(parsedSequence[4].stepCount()).toEqual(2);

    expect(parsedSequence[5]).toBe(undefined);

    expect(parsedSequence[6].name()).toEqual("D");
    expect(parsedSequence[6].octave()).toEqual(4);
    expect(parsedSequence[6].stepCount()).toEqual(1);

    expect(parsedSequence[7].name()).toEqual("G");
    expect(parsedSequence[7].octave()).toEqual(3);
    expect(parsedSequence[7].stepCount()).toEqual(3);
  });

  it("should properly parse a sequence with bad note names", function() {
    var rawSequence = "V3 - - - 4 A @5 3A";

    var parsedSequence = new SynthCore.SequenceParser.parse(rawSequence);

    expect(parsedSequence.length).toEqual(8);
    expect(Object.keys(parsedSequence)).toEqual(["0", "4", "5", "6", "7"]);

    expect(parsedSequence[0].name()).toEqual("V");
    expect(parsedSequence[0].octave()).toEqual(3);
    expect(parsedSequence[0].stepCount()).toEqual(4);

    expect(parsedSequence[1]).toBe(undefined);
    expect(parsedSequence[2]).toBe(undefined);
    expect(parsedSequence[3]).toBe(undefined);

    expect(parsedSequence[4].name()).toEqual("");
    expect(parsedSequence[4].octave()).toEqual(4);
    expect(parsedSequence[4].stepCount()).toEqual(1);

    expect(parsedSequence[5].name()).toEqual("");
    expect(parsedSequence[5].octave()).toBe(NaN);
    expect(parsedSequence[5].stepCount()).toEqual(1);

    expect(parsedSequence[6].name()).toEqual("@");
    expect(parsedSequence[6].octave()).toBe(5);
    expect(parsedSequence[6].stepCount()).toEqual(1);

    expect(parsedSequence[7].name()).toEqual("3");
    expect(parsedSequence[7].octave()).toBe(NaN);
    expect(parsedSequence[7].stepCount()).toEqual(1);
  });

  it("should properly parse a sequence containing trailing spaces", function() {
    var rawSequence = "A4 - - -   ";

    var parsedSequence = new SynthCore.SequenceParser.parse(rawSequence);

    expect(parsedSequence.length).toBe(7);
    expect(Object.keys(parsedSequence)).toEqual(["0", "4", "5", "6"]);

    expect(parsedSequence[0].name()).toEqual("A");
    expect(parsedSequence[0].octave()).toEqual(4);
    expect(parsedSequence[0].stepCount()).toEqual(4);

    expect(parsedSequence[1]).toBe(undefined);
    expect(parsedSequence[2]).toBe(undefined);
    expect(parsedSequence[3]).toBe(undefined);

    expect(parsedSequence[4].name()).toEqual("");
    expect(parsedSequence[4].octave()).toBe(NaN);
    expect(parsedSequence[4].stepCount()).toEqual(1);

    expect(parsedSequence[5].name()).toEqual("");
    expect(parsedSequence[5].octave()).toBe(NaN);
    expect(parsedSequence[5].stepCount()).toEqual(1);

    expect(parsedSequence[6].name()).toEqual("");
    expect(parsedSequence[6].octave()).toBe(NaN);
    expect(parsedSequence[6].stepCount()).toEqual(1);
  });

  it("should properly parse a sequence with unattached sustain characters ('-')", function() {
    var rawSequence = "A4 -  - - C2";

    var parsedSequence = new SynthCore.SequenceParser.parse(rawSequence);

    expect(parsedSequence.length).toEqual(6);
    expect(Object.keys(parsedSequence)).toEqual(["0", "2", "5"]);

    expect(parsedSequence[0].name()).toEqual("A");
    expect(parsedSequence[0].octave()).toEqual(4);
    expect(parsedSequence[0].stepCount()).toEqual(2);

    expect(parsedSequence[1]).toBe(undefined);

    expect(parsedSequence[2].name()).toEqual("");
    expect(parsedSequence[2].octave()).toBe(NaN);
    expect(parsedSequence[2].stepCount()).toEqual(3);

    expect(parsedSequence[3]).toBe(undefined);
    expect(parsedSequence[4]).toBe(undefined);

    expect(parsedSequence[5].name()).toEqual("C");
    expect(parsedSequence[5].octave()).toEqual(2);
    expect(parsedSequence[5].stepCount()).toEqual(1);
  });

  it("should properly parse a sequence with leading sustain characters ('-')", function() {
    var rawSequence = "- - - -";

    var parsedSequence = new SynthCore.SequenceParser.parse(rawSequence);

    expect(parsedSequence).toEqual([]);
    expect(parsedSequence.length).toEqual(0);
    expect(Object.keys(parsedSequence)).toEqual([]);
  });
});


describe("SynthCore.Envelope", function() {
  it("should calculate correctly when envelope is effectively a no-op", function() {
    var envelopeConfig = {
      attackTime: 0.0,
      decayTime: 0.0,
      sustainPercentage: 1.0,
      releaseTime: 0.0,
    };

    var calculatedEnvelope = SynthCore.Envelope(0.5, envelopeConfig, 1.0, 1.1);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.0);
    expect(calculatedEnvelope.attackEndAmplitude).toEqual(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(1.001);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.5);

    expect(calculatedEnvelope.valueAtTime(0.5, 1.1)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(1.0, 1.1)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.025, 1.1)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.05, 1.1)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.075, 1.1)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.1, 1.1)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.11, 1.1)).toEqual(0.0);
  });

  it("should calculate correctly when attack time is longer than note duration", function() {
    var envelopeConfig = {
      attackTime: 0.2,
      decayTime: 0.0,
      sustainPercentage: 1.0,
      releaseTime: 0.0,
    };

    var calculatedEnvelope = SynthCore.Envelope(0.5, envelopeConfig, 1.0, 1.1);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.1);
    expect(calculatedEnvelope.attackEndAmplitude).toBeCloseTo(0.25);
    expect(calculatedEnvelope.decayEndTime).toEqual(1.1);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.2500000000000003);

    expect(calculatedEnvelope.valueAtTime(0.5, 1.1)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(1.0, 1.1)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(1.025, 1.1)).toBeCloseTo(0.0625);
    expect(calculatedEnvelope.valueAtTime(1.05, 1.1)).toBeCloseTo(0.125);
    expect(calculatedEnvelope.valueAtTime(1.075, 1.1)).toBeCloseTo(0.1875);
    expect(calculatedEnvelope.valueAtTime(1.1, 1.1)).toBeCloseTo(0.25);
    expect(calculatedEnvelope.valueAtTime(1.11, 1.1)).toEqual(0.0);
  });

  it("should calculate correctly attack time is shorter than note duration ", function() {
    var envelopeConfig = {
      attackTime: 0.5,
      decayTime: 0.0,
      sustainPercentage: 1.0,
      releaseTime: 0.0,
    };

    var calculatedEnvelope = SynthCore.Envelope(0.5, envelopeConfig, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.5);
    expect(calculatedEnvelope.attackEndAmplitude).toEqual(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(1.501);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.5);

    expect(calculatedEnvelope.valueAtTime(0.5, 2.0)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(1.0, 2.0)).toEqual(0.0);   // Attack start
    expect(calculatedEnvelope.valueAtTime(1.125, 2.0)).toEqual(0.125);
    expect(calculatedEnvelope.valueAtTime(1.25, 2.0)).toEqual(0.25);
    expect(calculatedEnvelope.valueAtTime(1.375, 2.0)).toEqual(0.375);
    expect(calculatedEnvelope.valueAtTime(1.5, 2.0)).toEqual(0.5);   // Attack end, decay start
    expect(calculatedEnvelope.valueAtTime(1.75, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(2.0, 2.0)).toEqual(0.5);   // Release start
    expect(calculatedEnvelope.valueAtTime(2.01, 2.0)).toEqual(0.0);
  });

  it("should calculate correctly when decay ends before note ends", function() {
    var envelopeConfig = {
      attackTime: 0.5,
      decayTime: 0.25,
      sustainPercentage: 0.5,
      releaseTime: 0.0,
    };

    var calculatedEnvelope = SynthCore.Envelope(0.5, envelopeConfig, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.5);
    expect(calculatedEnvelope.attackEndAmplitude).toEqual(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(1.75);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.25);

    expect(calculatedEnvelope.valueAtTime(0.5, 2.0)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(1.0, 2.0)).toEqual(0.0);   // Attack start
    expect(calculatedEnvelope.valueAtTime(1.25, 2.0)).toEqual(0.25);
    expect(calculatedEnvelope.valueAtTime(1.5, 2.0)).toEqual(0.5);   // Attack end, decay start
    expect(calculatedEnvelope.valueAtTime(1.5625, 2.0)).toEqual(0.4375);
    expect(calculatedEnvelope.valueAtTime(1.625, 2.0)).toEqual(0.375);
    expect(calculatedEnvelope.valueAtTime(1.6875, 2.0)).toEqual(0.3125);
    expect(calculatedEnvelope.valueAtTime(1.75, 2.0)).toEqual(0.25);   // Decay end
    expect(calculatedEnvelope.valueAtTime(1.875, 2.0)).toEqual(0.25);
    expect(calculatedEnvelope.valueAtTime(2.0, 2.0)).toEqual(0.25);   // Release start
    expect(calculatedEnvelope.valueAtTime(2.01, 2.0)).toEqual(0.0);
  });

  it("should calculate correctly when decay is a no-op because sustain is 100%", function() {
    var envelopeConfig = {
      attackTime: 0.5,
      decayTime: 1.0,
      sustainPercentage: 1.0,
      releaseTime: 0.0,
    };

    var calculatedEnvelope = SynthCore.Envelope(0.5, envelopeConfig, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.5);
    expect(calculatedEnvelope.attackEndAmplitude).toEqual(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(2.0);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.5);

    expect(calculatedEnvelope.valueAtTime(0.5, 2.0)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(1.0, 2.0)).toEqual(0.0);   // Attack start
    expect(calculatedEnvelope.valueAtTime(1.25, 2.0)).toEqual(0.25);
    expect(calculatedEnvelope.valueAtTime(1.5, 2.0)).toEqual(0.5);   // Attack end, decay start
    expect(calculatedEnvelope.valueAtTime(1.75, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(2.0, 2.0)).toEqual(0.5);   // Release start
    expect(calculatedEnvelope.valueAtTime(2.01, 2.0)).toEqual(0.0);
  });

  it("should calculate correctly when decay ends before gate off, but is a no-op due to sustain volume", function() {
    var envelopeConfig = {
      attackTime: 0.0,
      decayTime: 0.5,
      sustainPercentage: 1.0,
      releaseTime: 0.0,
    };

    var calculatedEnvelope = SynthCore.Envelope(0.5, envelopeConfig, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.0);
    expect(calculatedEnvelope.attackEndAmplitude).toBeCloseTo(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(1.5);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.5);

    expect(calculatedEnvelope.valueAtTime(0.5, 2.0)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(1.0, 2.0)).toEqual(0.5);   // Attack start
    expect(calculatedEnvelope.valueAtTime(1.125, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.25, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.375, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.5, 2.0)).toEqual(0.5);   // Decay end
    expect(calculatedEnvelope.valueAtTime(1.625, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.75, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.875, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(2.0, 2.0)).toEqual(0.5);   // Release start
    expect(calculatedEnvelope.valueAtTime(2.01, 2.0)).toEqual(0.0);
  });

  it("should calculate correctly when decay ends after gate off, but is a no-op due to sustain volume", function() {
    var envelopeConfig = {
      attackTime: 0.0,
      decayTime:1.5,
      sustainPercentage: 1.0,
      releaseTime: 0.0,
    };

    var calculatedEnvelope = SynthCore.Envelope(0.5, envelopeConfig, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.0);
    expect(calculatedEnvelope.attackEndAmplitude).toBeCloseTo(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(2.0);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.5);

    expect(calculatedEnvelope.valueAtTime(0.5, 2.0)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(1.0, 2.0)).toEqual(0.5);   // Attack start
    expect(calculatedEnvelope.valueAtTime(1.125, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.25, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.375, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.5, 2.0)).toEqual(0.5);   // Decay end
    expect(calculatedEnvelope.valueAtTime(1.625, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.75, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.875, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(2.0, 2.0)).toEqual(0.5);   // Release start
    expect(calculatedEnvelope.valueAtTime(2.01, 2.0)).toEqual(0.0);
  });

  it("should calculate correctly when there is a release portion of the envelope", function() {
    var envelopeConfig = {
      attackTime: 0.0,
      decayTime: 0.0,
      sustainPercentage: 1.0,
      releaseTime: 0.5,
    };

    var calculatedEnvelope = SynthCore.Envelope(0.5, envelopeConfig, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.0);
    expect(calculatedEnvelope.attackEndAmplitude).toBe(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(1.001);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.5);

    expect(calculatedEnvelope.valueAtTime(0.5, 2.0)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(1.0, 2.0)).toEqual(0.5);   // Attack start
    expect(calculatedEnvelope.valueAtTime(1.5, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(2.0, 2.0)).toEqual(0.5);   // Release start
    expect(calculatedEnvelope.valueAtTime(2.125, 2.0)).toEqual(0.375);
    expect(calculatedEnvelope.valueAtTime(2.25, 2.0)).toEqual(0.25);
    expect(calculatedEnvelope.valueAtTime(2.375, 2.0)).toEqual(0.125);
    expect(calculatedEnvelope.valueAtTime(2.5, 2.0)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(2.6, 2.0)).toEqual(0.0);
  });
});
