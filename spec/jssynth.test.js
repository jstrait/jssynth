"use strict";

import * as JSSynth from "./../build/jssynth";

describe("JSSynth.Note", function() {
  it("should construct a Note properly", function() {
    var note = new JSSynth.Note('A', 3, 1);

    expect(note.name()).toEqual('A');
    expect(note.octave()).toEqual(3);
    expect(note.stepDuration()).toEqual(1);
    expect(note.frequency()).toEqual(220.0);
  });

  it("should construct a Note properly", function() {
    var note = new JSSynth.Note('V', 3, 1);

    expect(note.name()).toEqual('V');
    expect(note.octave()).toEqual(3);
    expect(note.stepDuration()).toEqual(1);
    expect(note.frequency()).toEqual(NaN);
  });

  it("should handle enharmonic equivalents properly", function() {
    var note1 = new JSSynth.Note("D#", 3, 1);
    var note2 = new JSSynth.Note("Eb", 3, 1);
    var note3 = new JSSynth.Note("Fbb", 3, 1);

    expect(note1.name()).toEqual('D#');
    expect(note1.octave()).toEqual(3);
    expect(note1.stepDuration()).toEqual(1);
    expect(note1.frequency()).toEqual(311.1269837220809);

    expect(note2.name()).toEqual('Eb');
    expect(note2.octave()).toEqual(3);
    expect(note2.stepDuration()).toEqual(1);
    expect(note2.frequency()).toEqual(311.1269837220809);

    expect(note3.name()).toEqual('Fbb');
    expect(note3.octave()).toEqual(3);
    expect(note3.stepDuration()).toEqual(1);
    expect(note3.frequency()).toEqual(311.1269837220809);
  });

  it("should convert string values to numbers where appropriate", function() {
    var note = new JSSynth.Note('A', '3', '2');

    expect(note.name()).toEqual('A');
    expect(note.octave()).toEqual(3);
    expect(note.stepDuration()).toEqual(2);
    expect(note.frequency()).toEqual(220.0);
  });

  it("should convert string values to numbers where appropriate", function() {
    var note = new JSSynth.Note('', '', '');

    expect(note.name()).toEqual('');
    expect(note.octave()).toEqual(NaN);
    expect(note.stepDuration()).toEqual(NaN);
    expect(note.frequency()).toEqual(NaN);
  });
});


describe("JSSynth.SequenceParser", function() {
  it("should properly parse a valid sequence", function() {
    var rawSequence = "A4 Bb2  C#5 ";
    var parsedSequence = new JSSynth.SequenceParser.parse(rawSequence);

    expect(parsedSequence[0].name()).toEqual("A");
    expect(parsedSequence[0].octave()).toEqual(4);
    expect(parsedSequence[0].stepDuration()).toEqual(1);

    expect(parsedSequence[1].name()).toEqual("Bb");
    expect(parsedSequence[1].octave()).toEqual(2);
    expect(parsedSequence[1].stepDuration()).toEqual(1);

    expect(parsedSequence[3].name()).toEqual("C#");
    expect(parsedSequence[3].octave()).toEqual(5);
    expect(parsedSequence[3].stepDuration()).toEqual(1);
  });

  it("should properly parse a sequence containing ties", function() {
    var rawSequence = "A4 - - - C2 - D4 G3 - -";

    var parsedSequence = new JSSynth.SequenceParser.parse(rawSequence);

    expect(parsedSequence[0].name()).toEqual("A");
    expect(parsedSequence[0].octave()).toEqual(4);
    expect(parsedSequence[0].stepDuration()).toEqual(4);

    expect(parsedSequence[4].name()).toEqual("C");
    expect(parsedSequence[4].octave()).toEqual(2);
    expect(parsedSequence[4].stepDuration()).toEqual(2);

    expect(parsedSequence[6].name()).toEqual("D");
    expect(parsedSequence[6].octave()).toEqual(4);
    expect(parsedSequence[6].stepDuration()).toEqual(1);

    expect(parsedSequence[7].name()).toEqual("G");
    expect(parsedSequence[7].octave()).toEqual(3);
    expect(parsedSequence[7].stepDuration()).toEqual(3);
  });

  it("should properly parse a sequence with bad note names", function() {
    var rawSequence = "V3 - - -";

    var parsedSequence = new JSSynth.SequenceParser.parse(rawSequence);

    expect(parsedSequence[0].name()).toEqual("V");
    expect(parsedSequence[0].octave()).toEqual(3);
    expect(parsedSequence[0].stepDuration()).toEqual(4);
  });

  it("should properly parse a sequence containing trailing spaces", function() {
    var rawSequence = "A4 - - -   ";

    var parsedSequence = new JSSynth.SequenceParser.parse(rawSequence);

    expect(parsedSequence[0].name()).toEqual("A");
    expect(parsedSequence[0].octave()).toEqual(4);
    expect(parsedSequence[0].stepDuration()).toEqual(4);
  });

  it("should properly parse a sequence with unattached sustain characters ('-')", function() {
    var rawSequence = "A4 -  - - C2";

    var parsedSequence = new JSSynth.SequenceParser.parse(rawSequence);

    expect(parsedSequence[0].name()).toEqual("A");
    expect(parsedSequence[0].octave()).toEqual(4);
    expect(parsedSequence[0].stepDuration()).toEqual(2);

    expect(parsedSequence[5].name()).toEqual("C");
    expect(parsedSequence[5].octave()).toEqual(2);
    expect(parsedSequence[5].stepDuration()).toEqual(1);
  });

  it("should properly parse a sequence with leading sustain characters ('-')", function() {
    var rawSequence = "- - - -";

    var parsedSequence = new JSSynth.SequenceParser.parse(rawSequence);

    expect(parsedSequence).toEqual([]);
  });
});


describe("JSSynth.Envelope", function() {
  it("should calculate correctly when envelope is effectively a no-op", function() {
    var envelope = {
      attack:  0.0,
      decay:   0.0,
      sustain: 1.0,
      release: 0.0,
    }

    var calculatedEnvelope = JSSynth.Envelope(0.5, envelope, 1.0, 1.1);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.0);
    expect(calculatedEnvelope.attackEndAmplitude).toEqual(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(1.001);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.5);
  });

  it("should calculate correctly when attack time is longer than note duration", function() {
    var envelope = {
      attack:  0.2,
      decay:   0.0,
      sustain: 1.0,
      release: 0.0,
    }

    var calculatedEnvelope = JSSynth.Envelope(0.5, envelope, 1.0, 1.1);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.1);
    expect(calculatedEnvelope.attackEndAmplitude).toBeCloseTo(0.25);
    expect(calculatedEnvelope.decayEndTime).toEqual(1.1);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.2500000000000003);
  });

  it("should calculate correctly attack time is shorter than note duration ", function() {
    var envelope = {
      attack:  0.5,
      decay:   0.0,
      sustain: 1.0,
      release: 0.0,
    }

    var calculatedEnvelope = JSSynth.Envelope(0.5, envelope, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.5);
    expect(calculatedEnvelope.attackEndAmplitude).toEqual(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(1.501);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.5);
  });

  it("should calculate correctly when decay ends before note ends", function() {
    var envelope = {
      attack:  0.5,
      decay:   0.25,
      sustain: 0.5,
      release: 0.0,
    }

    var calculatedEnvelope = JSSynth.Envelope(0.5, envelope, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.5);
    expect(calculatedEnvelope.attackEndAmplitude).toEqual(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(1.75);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.25);
  });

  it("should calculate correctly when decay is a no-op because sustain is 100%", function() {
    var envelope = {
      attack:  0.5,
      decay:   1.0,
      sustain: 1.0,
      release: 0.0,
    }

    var calculatedEnvelope = JSSynth.Envelope(0.5, envelope, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.5);
    expect(calculatedEnvelope.attackEndAmplitude).toEqual(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(2.0);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.5);
  });

  it("should calculate correctly when decay ends before gate off, but is a no-op due to sustain volume", function() {
    var envelope = {
      attack:  0.0,
      decay:   0.5,
      sustain: 1.0,
      release: 0.0,
    }

    var calculatedEnvelope = JSSynth.Envelope(0.5, envelope, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.0);
    expect(calculatedEnvelope.attackEndAmplitude).toBeCloseTo(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(1.5);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.5);
  });

  it("should calculate correctly when decay ends after gate off, but is a no-op due to sustain volume", function() {
    var envelope = {
      attack:  0.0,
      decay:   1.5,
      sustain: 1.0,
      release: 0.0,
    }

    var calculatedEnvelope = JSSynth.Envelope(0.5, envelope, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.0);
    expect(calculatedEnvelope.attackEndAmplitude).toBeCloseTo(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(2.0);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.5);
  });
});
