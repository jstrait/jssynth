describe("JSSynth.Note", function() {
  it("should construct a Note properly", function() {
    var note = new JSSynth.Note('A', 3, 1);

    expect(note.noteName).toEqual('A');
    expect(note.octave).toEqual(3);
    expect(note.stepDuration).toEqual(1);
    expect(note.frequency).toEqual(220.0);
  });

  it("should convert string values to numbers where appropriate", function() {
    var note = new JSSynth.Note('A', '3', '2');

    expect(note.noteName).toEqual('A');
    expect(note.octave).toEqual(3);
    expect(note.stepDuration).toEqual(2);
    expect(note.frequency).toEqual(220.0);
  });

  it("should convert string values to numbers where appropriate", function() {
    var note = new JSSynth.Note('', '', '');

    expect(note.noteName).toEqual('');
    expect(note.octave).toEqual(NaN);
    expect(note.stepDuration).toEqual(NaN);
    expect(note.frequency).toEqual(NaN);
  });
});


describe("JSSynth.SequenceParser", function() {
  it("should properly parse a valid sequence", function() {
    var rawSequence = "A4 Bb2  C#5 ";
    var parsedSequence = new JSSynth.SequenceParser.parse(rawSequence);

    expect(parsedSequence.length).toEqual(5);

    expect(parsedSequence[0].noteName).toEqual("A");
    expect(parsedSequence[0].octave).toEqual(4);
    expect(parsedSequence[0].stepDuration).toEqual(1);

    expect(parsedSequence[1].noteName).toEqual("Bb");
    expect(parsedSequence[1].octave).toEqual(2);
    expect(parsedSequence[1].stepDuration).toEqual(1);

    expect(parsedSequence[2].noteName).toEqual("");
    expect(parsedSequence[2].octave).toEqual(NaN);
    expect(parsedSequence[2].stepDuration).toEqual(1);

    expect(parsedSequence[3].noteName).toEqual("C#");
    expect(parsedSequence[3].octave).toEqual(5);
    expect(parsedSequence[3].stepDuration).toEqual(1);

    expect(parsedSequence[4].noteName).toEqual("");
    expect(parsedSequence[4].octave).toEqual(NaN);
    expect(parsedSequence[4].stepDuration).toEqual(1);
  });

  it("should properly parse a sequence containing ties", function() {
    var rawSequence = "A4 - - - C2 - D4 G3 - -";

    var parsedSequence = new JSSynth.SequenceParser.parse(rawSequence);

    expect(parsedSequence.length).toEqual(10);

    expect(parsedSequence[0].noteName).toEqual("A");
    expect(parsedSequence[0].octave).toEqual(4);
    expect(parsedSequence[0].stepDuration).toEqual(4);

    expect(parsedSequence[1].noteName).toEqual("");
    expect(parsedSequence[1].octave).toEqual(NaN);
    expect(parsedSequence[1].stepDuration).toEqual(1);

    expect(parsedSequence[2].noteName).toEqual("");
    expect(parsedSequence[2].octave).toEqual(NaN);
    expect(parsedSequence[2].stepDuration).toEqual(1);

    expect(parsedSequence[3].noteName).toEqual("");
    expect(parsedSequence[3].octave).toEqual(NaN);
    expect(parsedSequence[3].stepDuration).toEqual(1);

    expect(parsedSequence[4].noteName).toEqual("C");
    expect(parsedSequence[4].octave).toEqual(2);
    expect(parsedSequence[4].stepDuration).toEqual(2);

    expect(parsedSequence[5].noteName).toEqual("");
    expect(parsedSequence[5].octave).toEqual(NaN);
    expect(parsedSequence[5].stepDuration).toEqual(1);

    expect(parsedSequence[6].noteName).toEqual("D");
    expect(parsedSequence[6].octave).toEqual(4);
    expect(parsedSequence[6].stepDuration).toEqual(1);

    expect(parsedSequence[7].noteName).toEqual("G");
    expect(parsedSequence[7].octave).toEqual(3);
    expect(parsedSequence[7].stepDuration).toEqual(3);

    expect(parsedSequence[8].noteName).toEqual("");
    expect(parsedSequence[8].octave).toEqual(NaN);
    expect(parsedSequence[8].stepDuration).toEqual(1);

    expect(parsedSequence[9].noteName).toEqual("");
    expect(parsedSequence[9].octave).toEqual(NaN);
    expect(parsedSequence[9].stepDuration).toEqual(1);
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
