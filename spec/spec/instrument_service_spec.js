"use strict";

describe("InstrumentService", function() {
  var instrumentService, rootScope;

  var DEFAULT_INSTRUMENTS = [
    {
      id:                 1,
      name:               'Melody',
      waveform1:          'sawtooth',
      waveform1Octave:    0,
      waveform2:          'sawtooth',
      waveform2Detune:    6,
      waveform2Octave:    0,
      lfoWaveform:        'sine',
      lfoFrequency:       5,
      lfoAmplitude:       6,
      filterCutoff:       2200,
      filterResonance:    0,
      filterLFOWaveform:  'sine',
      filterLFOFrequency: 5,
      filterLFOAmplitude: 0.46,
      envelopeAttack:     0.04,
      envelopeDecay:      0.0,
      envelopeSustain:    1.0,
      envelopeRelease:    0.2,
    },
    {
      id:                 2,
      name:               'Chords',
      waveform1:          'triangle',
      waveform1Octave:    0,
      waveform2:          'sine',
      waveform2Detune:    6,
      waveform2Octave:    0,
      lfoWaveform:        'sine',
      lfoFrequency:       5,
      lfoAmplitude:       0,
      filterCutoff:       1400,
      filterResonance:    0,
      filterLFOWaveform:  'sine',
      filterLFOFrequency: 2.4,
      filterLFOAmplitude: 0.78,
      envelopeAttack:     0.05,
      envelopeDecay:      0.0,
      envelopeSustain:    1.0,
      envelopeRelease:    0.0,
    },
    {
      id:                 3,
      name:               'Bass',
      waveform1:          'sawtooth',
      waveform1Octave:    0,
      waveform2:          'sawtooth',
      waveform2Detune:    0,
      waveform2Octave:    0,
      lfoWaveform:        'sine',
      lfoFrequency:       5,
      lfoAmplitude:       0,
      filterCutoff:       1200,
      filterResonance:    0,
      filterLFOWaveform:  'sine',
      filterLFOFrequency: 5,
      filterLFOAmplitude: 0,
      envelopeAttack:     0.02,
      envelopeDecay:      0.0,
      envelopeSustain:    1.0,
      envelopeRelease:    0.0,
    },
  ];

  beforeEach(angular.mock.module('js120'));
  beforeEach(angular.mock.inject(function(InstrumentService, $rootScope) {
    instrumentService = InstrumentService;
    rootScope = $rootScope.$new();
    spyOn($rootScope, '$broadcast');
  }));

  it("should be initialized with the correct set of Instruments", function() {
    expect(instrumentService.instruments()).toEqual(DEFAULT_INSTRUMENTS);
  });

  it("should add a new instrument successfully", function() {
    instrumentService.addInstrument();

    var expectedResult = DEFAULT_INSTRUMENTS.concat(
      {
        id:                 4,
        name:               'Instrument 4',
        waveform1:          'sawtooth',
        waveform1Octave:    0,
        waveform2:          'square',
        waveform2Detune:    0,
        waveform2Octave:    0,
        lfoWaveform:        'sine',
        lfoFrequency:       5,
        lfoAmplitude:       0,
        filterCutoff:       9950,
        filterResonance:    0,
        filterLFOWaveform:  'sine',
        filterLFOFrequency: 5,
        filterLFOAmplitude: 0,
        envelopeAttack:     0.0,
        envelopeDecay:      0.0,
        envelopeSustain:    1.0,
        envelopeRelease:    0.0,
      }
    );

    expect(instrumentService.instruments()).toEqual(expectedResult);
  });

  describe("removeInstrument", function() {
    it("should remove an existing instrument correctly", function() {
      instrumentService.removeInstrument(2);

      expect(instrumentService.instruments()).toEqual([ DEFAULT_INSTRUMENTS[0], DEFAULT_INSTRUMENTS[2] ]);
    });

    it("should do nothing when removing a non-existent Instrument", function() {
      instrumentService.removeInstrument(1232432);

      expect(instrumentService.instruments()).toEqual(DEFAULT_INSTRUMENTS);
    });
  });

  describe("updateInstrument", function() {
    it("should broadcast a message that the instrument was updated", function() {
      instrumentService.updateInstrument();

      expect(rootScope.$broadcast).toHaveBeenCalledWith('InstrumentService.update');
    });
  });

  describe("instrumentById", function() {
    it("should find the correct Instrument by ID", function() {
      var instrument = instrumentService.instrumentByID(2);

      expect(instrument).toEqual(DEFAULT_INSTRUMENTS[1]);
    });

    it("should return the correct value for a non-existent Instrument", function() {
      var instrument = instrumentService.instrumentByID(20);

      expect(instrument).toBe(null);
    });
  });
});
