describe("JSSynth.Note", function() {
  it("should construct a Note properly", function() {
    var note = new JSSynth.Note('A', 3, 1);

    expect(note.getNoteName()).toEqual('A');
    expect(note.getOctave()).toEqual(3);
    expect(note.getStepDuration()).toEqual(1);
    expect(note.getFrequency()).toEqual(220.0);
  });

  it("should convert string values to numbers where appropriate", function() {
    var note = new JSSynth.Note('A', '3', '2');

    expect(note.getNoteName()).toEqual('A');
    expect(note.getOctave()).toEqual(3);
    expect(note.getStepDuration()).toEqual(2);
    expect(note.getFrequency()).toEqual(220.0);
  });

  it("should convert string values to numbers where appropriate", function() {
    var note = new JSSynth.Note('', '', '');

    expect(note.getNoteName()).toEqual('');
    expect(note.getOctave()).toEqual(NaN);
    expect(note.getStepDuration()).toEqual(NaN);
    expect(note.getFrequency()).toEqual(NaN);
  });
});


describe("JSSynth.SequenceParser", function() {
  it("should properly parse a valid sequence", function() {
    var rawSequence = "A4 Bb2  C#5 ";
    var parsedSequence = new JSSynth.SequenceParser.parse(rawSequence);

    expect(parsedSequence.length).toEqual(5);

    expect(parsedSequence[0].getNoteName()).toEqual("A");
    expect(parsedSequence[0].getOctave()).toEqual(4);
    expect(parsedSequence[0].getStepDuration()).toEqual(1);

    expect(parsedSequence[1].getNoteName()).toEqual("Bb");
    expect(parsedSequence[1].getOctave()).toEqual(2);
    expect(parsedSequence[1].getStepDuration()).toEqual(1);

    expect(parsedSequence[2].getNoteName()).toEqual("");
    expect(parsedSequence[2].getOctave()).toEqual(NaN);
    expect(parsedSequence[2].getStepDuration()).toEqual(1);

    expect(parsedSequence[3].getNoteName()).toEqual("C#");
    expect(parsedSequence[3].getOctave()).toEqual(5);
    expect(parsedSequence[3].getStepDuration()).toEqual(1);

    expect(parsedSequence[4].getNoteName()).toEqual("");
    expect(parsedSequence[4].getOctave()).toEqual(NaN);
    expect(parsedSequence[4].getStepDuration()).toEqual(1);
  });

  it("should properly parse a sequence containing ties", function() {
    var rawSequence = "A4 - - - C2 - D4 G3 - -";

    var parsedSequence = new JSSynth.SequenceParser.parse(rawSequence);

    expect(parsedSequence.length).toEqual(10);

    expect(parsedSequence[0].getNoteName()).toEqual("A");
    expect(parsedSequence[0].getOctave()).toEqual(4);
    expect(parsedSequence[0].getStepDuration()).toEqual(4);

    expect(parsedSequence[1].getNoteName()).toEqual("");
    expect(parsedSequence[1].getOctave()).toEqual(NaN);
    expect(parsedSequence[1].getStepDuration()).toEqual(1);

    expect(parsedSequence[2].getNoteName()).toEqual("");
    expect(parsedSequence[2].getOctave()).toEqual(NaN);
    expect(parsedSequence[2].getStepDuration()).toEqual(1);

    expect(parsedSequence[3].getNoteName()).toEqual("");
    expect(parsedSequence[3].getOctave()).toEqual(NaN);
    expect(parsedSequence[3].getStepDuration()).toEqual(1);

    expect(parsedSequence[4].getNoteName()).toEqual("C");
    expect(parsedSequence[4].getOctave()).toEqual(2);
    expect(parsedSequence[4].getStepDuration()).toEqual(2);

    expect(parsedSequence[5].getNoteName()).toEqual("");
    expect(parsedSequence[5].getOctave()).toEqual(NaN);
    expect(parsedSequence[5].getStepDuration()).toEqual(1);

    expect(parsedSequence[6].getNoteName()).toEqual("D");
    expect(parsedSequence[6].getOctave()).toEqual(4);
    expect(parsedSequence[6].getStepDuration()).toEqual(1);

    expect(parsedSequence[7].getNoteName()).toEqual("G");
    expect(parsedSequence[7].getOctave()).toEqual(3);
    expect(parsedSequence[7].getStepDuration()).toEqual(3);

    expect(parsedSequence[8].getNoteName()).toEqual("");
    expect(parsedSequence[8].getOctave()).toEqual(NaN);
    expect(parsedSequence[8].getStepDuration()).toEqual(1);

    expect(parsedSequence[9].getNoteName()).toEqual("");
    expect(parsedSequence[9].getOctave()).toEqual(NaN);
    expect(parsedSequence[9].getStepDuration()).toEqual(1);
  });

  it("should properly parse a sequence containing trailing spaces", function() {
    var rawSequence = "A4 - - -   ";

    var parsedSequence = new JSSynth.SequenceParser.parse(rawSequence);

    expect(parsedSequence.length).toEqual(7);

    expect(parsedSequence[0].getNoteName()).toEqual("A");
    expect(parsedSequence[0].getOctave()).toEqual(4);
    expect(parsedSequence[0].getStepDuration()).toEqual(4);

    expect(parsedSequence[1].getNoteName()).toEqual("");
    expect(parsedSequence[1].getOctave()).toEqual(NaN);
    expect(parsedSequence[1].getStepDuration()).toEqual(1);

    expect(parsedSequence[2].getNoteName()).toEqual("");
    expect(parsedSequence[2].getOctave()).toEqual(NaN);
    expect(parsedSequence[2].getStepDuration()).toEqual(1);

    expect(parsedSequence[3].getNoteName()).toEqual("");
    expect(parsedSequence[3].getOctave()).toEqual(NaN);
    expect(parsedSequence[3].getStepDuration()).toEqual(1);

    expect(parsedSequence[4].getNoteName()).toEqual("");
    expect(parsedSequence[4].getOctave()).toEqual(NaN);
    expect(parsedSequence[4].getStepDuration()).toEqual(1);

    expect(parsedSequence[5].getNoteName()).toEqual("");
    expect(parsedSequence[5].getOctave()).toEqual(NaN);
    expect(parsedSequence[5].getStepDuration()).toEqual(1);

    expect(parsedSequence[6].getNoteName()).toEqual("");
    expect(parsedSequence[6].getOctave()).toEqual(NaN);
    expect(parsedSequence[6].getStepDuration()).toEqual(1);
  });

  it("should properly parse a sequence with unattached sustain characters ('-')", function() {
    var rawSequence = "A4 -  - - C2";

    var parsedSequence = new JSSynth.SequenceParser.parse(rawSequence);

    expect(parsedSequence.length).toEqual(6);

    expect(parsedSequence[0].getNoteName()).toEqual("A");
    expect(parsedSequence[0].getOctave()).toEqual(4);
    expect(parsedSequence[0].getStepDuration()).toEqual(2);

    expect(parsedSequence[1].getNoteName()).toEqual("");
    expect(parsedSequence[1].getOctave()).toEqual(NaN);
    expect(parsedSequence[1].getStepDuration()).toEqual(1);

    expect(parsedSequence[2].getNoteName()).toEqual("");
    expect(parsedSequence[2].getOctave()).toEqual(NaN);
    expect(parsedSequence[2].getStepDuration()).toEqual(1);

    expect(parsedSequence[3].getNoteName()).toEqual("");
    expect(parsedSequence[3].getOctave()).toEqual(NaN);
    expect(parsedSequence[3].getStepDuration()).toEqual(1);

    expect(parsedSequence[4].getNoteName()).toEqual("");
    expect(parsedSequence[4].getOctave()).toEqual(NaN);
    expect(parsedSequence[4].getStepDuration()).toEqual(1);

    expect(parsedSequence[5].getNoteName()).toEqual("C");
    expect(parsedSequence[5].getOctave()).toEqual(2);
    expect(parsedSequence[5].getStepDuration()).toEqual(1);
  });

  it("should properly parse a sequence with leading sustain characters ('-')", function() {
    var rawSequence = "- - - -";

    var parsedSequence = new JSSynth.SequenceParser.parse(rawSequence);

    expect(parsedSequence.length).toEqual(4);

    expect(parsedSequence[0].getNoteName()).toEqual("");
    expect(parsedSequence[0].getOctave()).toEqual(NaN);
    expect(parsedSequence[0].getStepDuration()).toEqual(1);

    expect(parsedSequence[1].getNoteName()).toEqual("");
    expect(parsedSequence[1].getOctave()).toEqual(NaN);
    expect(parsedSequence[1].getStepDuration()).toEqual(1);

    expect(parsedSequence[2].getNoteName()).toEqual("");
    expect(parsedSequence[2].getOctave()).toEqual(NaN);
    expect(parsedSequence[2].getStepDuration()).toEqual(1);

    expect(parsedSequence[3].getNoteName()).toEqual("");
    expect(parsedSequence[3].getOctave()).toEqual(NaN);
    expect(parsedSequence[3].getStepDuration()).toEqual(1);
  });
});


describe("JSSynth.EnvelopeCalculator", function() {
  it("should calculate correctly when envelope is effectively a no-op", function() {
    var envelope = {
      attack:  0.0,
      decay:   0.0,
      sustain: 1.0,
      release: 0.0,
    }

    var calculatedEnvelope = JSSynth.EnvelopeCalculator.calculate(0.5, envelope, 1.0, 1.1);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.0);
    expect(calculatedEnvelope.attackEndAmplitude).toEqual(0.5);
    expect(calculatedEnvelope.delayEndTime).toEqual(1.0);
    expect(calculatedEnvelope.delayEndAmplitude).toEqual(0.5);
  });

  it("should calculate correctly when attack time is longer than note duration", function() {
    var envelope = {
      attack:  0.2,
      decay:   0.0,
      sustain: 1.0,
      release: 0.0,
    }

    var calculatedEnvelope = JSSynth.EnvelopeCalculator.calculate(0.5, envelope, 1.0, 1.1);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.1);
    expect(calculatedEnvelope.attackEndAmplitude).toBeCloseTo(0.25);
    expect(calculatedEnvelope.delayEndTime).toEqual(1.1);
    expect(calculatedEnvelope.delayEndAmplitude).toEqual(NaN);
  });

  it("should calculate correctly attack time is shorter than note duration ", function() {
    var envelope = {
      attack:  0.5,
      decay:   0.0,
      sustain: 1.0,
      release: 0.0,
    }

    var calculatedEnvelope = JSSynth.EnvelopeCalculator.calculate(0.5, envelope, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.5);
    expect(calculatedEnvelope.attackEndAmplitude).toEqual(0.5);
    expect(calculatedEnvelope.delayEndTime).toEqual(1.5);
    expect(calculatedEnvelope.delayEndAmplitude).toEqual(0.5);
  });

  it("should calculate correctly when decay ends before note ends", function() {
    var envelope = {
      attack:  0.5,
      decay:   0.25,
      sustain: 0.5,
      release: 0.0,
    }

    var calculatedEnvelope = JSSynth.EnvelopeCalculator.calculate(0.5, envelope, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.5);
    expect(calculatedEnvelope.attackEndAmplitude).toEqual(0.5);
    expect(calculatedEnvelope.delayEndTime).toEqual(1.75);
    expect(calculatedEnvelope.delayEndAmplitude).toEqual(0.25);
  });

  it("should calculate correctly when decay is a no-op because sustain is 100%", function() {
    var envelope = {
      attack:  0.5,
      decay:   1.0,
      sustain: 1.0,
      release: 0.0,
    }

    var calculatedEnvelope = JSSynth.EnvelopeCalculator.calculate(0.5, envelope, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.5);
    expect(calculatedEnvelope.attackEndAmplitude).toEqual(0.5);
    expect(calculatedEnvelope.delayEndTime).toEqual(2.0);
    expect(calculatedEnvelope.delayEndAmplitude).toEqual(0.5);
  });

  it("should calculate correctly when decay ends before gate off, but is a no-op due to sustain volume", function() {
    var envelope = {
      attack:  0.0,
      decay:   0.5,
      sustain: 1.0,
      release: 0.0,
    }

    var calculatedEnvelope = JSSynth.EnvelopeCalculator.calculate(0.5, envelope, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.0);
    expect(calculatedEnvelope.attackEndAmplitude).toBeCloseTo(0.5);
    expect(calculatedEnvelope.delayEndTime).toEqual(1.5);
    expect(calculatedEnvelope.delayEndAmplitude).toEqual(0.5);
  });

  it("should calculate correctly when decay ends after gate off, but is a no-op due to sustain volume", function() {
    var envelope = {
      attack:  0.0,
      decay:   1.5,
      sustain: 1.0,
      release: 0.0,
    }

    var calculatedEnvelope = JSSynth.EnvelopeCalculator.calculate(0.5, envelope, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.0);
    expect(calculatedEnvelope.attackEndAmplitude).toBeCloseTo(0.5);
    expect(calculatedEnvelope.delayEndTime).toEqual(2.0);
    expect(calculatedEnvelope.delayEndAmplitude).toEqual(0.5);
  });
});
