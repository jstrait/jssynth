"use strict";

describe("InstrumentService", function() {
  var instrumentService, rootScope;
  
  beforeEach(angular.mock.module('js120'));
  beforeEach(angular.mock.inject(function(InstrumentService, $rootScope) {
    instrumentService = InstrumentService;
    rootScope = $rootScope.$new();
  }));

  it("should be initialized with the correct set of Instruments", function() {
    expect(instrumentService.instruments()).toEqual([
      {
        id:                 1,
        name:               'Instrument 1',
        waveform:           'square',
        lfoWaveform:        'sine',
        lfoFrequency:       5,
        lfoAmplitude:       10,
        filterCutoff:       1000,
        filterResonance:    0,
        filterLFOWaveform:  'sine',
        filterLFOFrequency: 5,
        filterLFOAmplitude: 0,
        envelopeAttack:     0.0,
        envelopeDecay:      0.0,
        envelopeSustain:    1.0,
        envelopeRelease:    0.0,
      },
      {
        id:                 2,
        name:               'Instrument 2',
        waveform:           'sawtooth',
        lfoWaveform:        'sine',
        lfoFrequency:       5,
        lfoAmplitude:       0,
        filterCutoff:       1000,
        filterResonance:    0,
        filterLFOWaveform:  'sine',
        filterLFOFrequency: 5,
        filterLFOAmplitude: 0,
        envelopeAttack:     0.0,
        envelopeDecay:      0.0,
        envelopeSustain:    1.0,
        envelopeRelease:    0.0,
      },
    ]);
  });

  it("should add a new instrument successfully", function() {
    instrumentService.addInstrument();

    expect(instrumentService.instruments()).toEqual([
      {
        id:                 1,
        name:               'Instrument 1',
        waveform:           'square',
        lfoWaveform:        'sine',
        lfoFrequency:       5,
        lfoAmplitude:       10,
        filterCutoff:       1000,
        filterResonance:    0,
        filterLFOWaveform:  'sine',
        filterLFOFrequency: 5,
        filterLFOAmplitude: 0,
        envelopeAttack:     0.0,
        envelopeDecay:      0.0,
        envelopeSustain:    1.0,
        envelopeRelease:    0.0,
      },
      {
        id:                 2,
        name:               'Instrument 2',
        waveform:           'sawtooth',
        lfoWaveform:        'sine',
        lfoFrequency:       5,
        lfoAmplitude:       0,
        filterCutoff:       1000,
        filterResonance:    0,
        filterLFOWaveform:  'sine',
        filterLFOFrequency: 5,
        filterLFOAmplitude: 0,
        envelopeAttack:     0.0,
        envelopeDecay:      0.0,
        envelopeSustain:    1.0,
        envelopeRelease:    0.0,
      },
      {
        id:                 3,
        name:               'Instrument 3',
        waveform:           'sawtooth',
        lfoWaveform:        'sine',
        lfoFrequency:       5,
        lfoAmplitude:       0,
        filterCutoff:       1000,
        filterResonance:    0,
        filterLFOWaveform:  'sine',
        filterLFOFrequency: 5,
        filterLFOAmplitude: 0,
        envelopeAttack:     0.0,
        envelopeDecay:      0.0,
        envelopeSustain:    1.0,
        envelopeRelease:    0.0,
      },
    ]);
  });

  describe("instrumentById", function() {
    it("should find the correct Instrument by ID", function() {
      var instrument = instrumentService.instrumentByID(2);

      expect(instrument).toEqual({
        id:                 2,
        name:               'Instrument 2',
        waveform:           'sawtooth',
        lfoWaveform:        'sine',
        lfoFrequency:       5,
        lfoAmplitude:       0,
        filterCutoff:       1000,
        filterResonance:    0,
        filterLFOWaveform:  'sine',
        filterLFOFrequency: 5,
        filterLFOAmplitude: 0,
        envelopeAttack:     0.0,
        envelopeDecay:      0.0,
        envelopeSustain:    1.0,
        envelopeRelease:    0.0,
      });
    });

    it("should return the correct value for a non-existent Instrument", function() {
      var instrument = instrumentService.instrumentByID(20);

      expect(instrument).toBe(null);
    });
  });
});

describe("JSSynth.Pattern", function() {
  it("should construct an empty Pattern properly", function() {
    var pattern = new JSSynth.Pattern();

    expect(pattern.stepCount()).toBe(0);
  });

  it("should all replacing a Pattern's tracks properly", function() {
    var instrument = null;

    var tracks = [];
    tracks.push(new JSSynth.Track(instrument, new JSSynth.SequenceParser.parse("A1 A1"), false));
    tracks.push(new JSSynth.Track(instrument, new JSSynth.SequenceParser.parse("A1 A1 A1 A1"), false));
    tracks.push(new JSSynth.Track(instrument, new JSSynth.SequenceParser.parse("A1 A1 A1 A1"), false));
    tracks.push(new JSSynth.Track(instrument, new JSSynth.SequenceParser.parse("A1 A1 A1"), false));

    var pattern = new JSSynth.Pattern();
    pattern.replaceTracks(tracks);

    expect(pattern.stepCount()).toBe(4);
  });
});

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
    expect(note1.frequency()).toEqual(309.375);

    expect(note2.name()).toEqual('Eb');
    expect(note2.octave()).toEqual(3);
    expect(note2.stepDuration()).toEqual(1);
    expect(note2.frequency()).toEqual(309.375);

    expect(note3.name()).toEqual('Fbb');
    expect(note3.octave()).toEqual(3);
    expect(note3.stepDuration()).toEqual(1);
    expect(note3.frequency()).toEqual(309.375);
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
