describe("JSSynth.Note", function() {
  it("should construct a Note properly", function() {
    var note = new JSSynth.Note('A', 3, 1);

    expect(note.noteName).toEqual('A');
    expect(note.octave).toEqual(3);
    expect(note.duration).toEqual(1);
    expect(note.frequency).toEqual(220.0);
  });

  it("should convert string values to numbers where appropriate", function() {
    var note = new JSSynth.Note('A', '3', '2');

    expect(note.noteName).toEqual('A');
    expect(note.octave).toEqual(3);
    expect(note.duration).toEqual(2);
    expect(note.frequency).toEqual(220.0);
  });

  it("should convert string values to numbers where appropriate", function() {
    var note = new JSSynth.Note('', '', '');

    expect(note.noteName).toEqual('');
    expect(note.octave).toEqual(NaN);
    expect(note.duration).toEqual(NaN);
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
    expect(parsedSequence[0].duration).toEqual(1);

    expect(parsedSequence[1].noteName).toEqual("Bb");
    expect(parsedSequence[1].octave).toEqual(2);
    expect(parsedSequence[1].duration).toEqual(1);

    expect(parsedSequence[2].noteName).toEqual("");
    expect(parsedSequence[2].octave).toEqual(NaN);
    expect(parsedSequence[2].duration).toEqual(1);

    expect(parsedSequence[3].noteName).toEqual("C#");
    expect(parsedSequence[3].octave).toEqual(5);
    expect(parsedSequence[3].duration).toEqual(1);

    expect(parsedSequence[4].noteName).toEqual("");
    expect(parsedSequence[4].octave).toEqual(NaN);
    expect(parsedSequence[4].duration).toEqual(1);
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

    var calculatedEnvelope = JSSynth.EnvelopeCalculator.calculate(envelope, 1.0, 1.1);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.0);
    expect(calculatedEnvelope.attackEndAmplitudePercentage).toEqual(1.0);
    expect(calculatedEnvelope.delayEndTime).toEqual(1.0);
    expect(calculatedEnvelope.delayEndAmplitudePercentage).toEqual(1.0);
  });

  it("should calculate correctly when attack time is longer than note duration", function() {
    var envelope = {
      attack:  0.2,
      decay:   0.0,
      sustain: 1.0,
      release: 0.0,
    }

    var calculatedEnvelope = JSSynth.EnvelopeCalculator.calculate(envelope, 1.0, 1.1);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.1);
    expect(calculatedEnvelope.attackEndAmplitudePercentage).toBeCloseTo(0.5);
    expect(calculatedEnvelope.delayEndTime).toEqual(1.1);
    expect(calculatedEnvelope.delayEndAmplitudePercentage).toEqual(NaN);
  });

  it("should calculate correctly attack time is shorter than note duration ", function() {
    var envelope = {
      attack:  0.5,
      decay:   0.0,
      sustain: 1.0,
      release: 0.0,
    }

    var calculatedEnvelope = JSSynth.EnvelopeCalculator.calculate(envelope, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.5);
    expect(calculatedEnvelope.attackEndAmplitudePercentage).toEqual(1.0);
    expect(calculatedEnvelope.delayEndTime).toEqual(1.5);
    expect(calculatedEnvelope.delayEndAmplitudePercentage).toEqual(1.0);
  });

  it("should calculate correctly when decay ends before note ends", function() {
    var envelope = {
      attack:  0.5,
      decay:   0.25,
      sustain: 1.0,
      release: 0.0,
    }

    var calculatedEnvelope = JSSynth.EnvelopeCalculator.calculate(envelope, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.5);
    expect(calculatedEnvelope.attackEndAmplitudePercentage).toEqual(1.0);
    expect(calculatedEnvelope.delayEndTime).toEqual(1.75);
    expect(calculatedEnvelope.delayEndAmplitudePercentage).toEqual(1.0);
  });

  it("should calculate correctly when decay would end after note ends ", function() {
    var envelope = {
      attack:  0.5,
      decay:   1.0,
      sustain: 1.0,
      release: 0.0,
    }

    var calculatedEnvelope = JSSynth.EnvelopeCalculator.calculate(envelope, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.5);
    expect(calculatedEnvelope.attackEndAmplitudePercentage).toEqual(1.0);
    expect(calculatedEnvelope.delayEndTime).toEqual(2.0);
    expect(calculatedEnvelope.delayEndAmplitudePercentage).toEqual(0.5);
  });
});
