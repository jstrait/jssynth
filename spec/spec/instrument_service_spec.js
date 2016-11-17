"use strict";

describe("InstrumentService", function() {
  var instrumentService, rootScope;

  var DEFAULT_INSTRUMENTS = [
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
  ];

  beforeEach(angular.mock.module('js120'));
  beforeEach(angular.mock.inject(function(InstrumentService, $rootScope) {
    instrumentService = InstrumentService;
    rootScope = $rootScope.$new();
  }));

  it("should be initialized with the correct set of Instruments", function() {
    expect(instrumentService.instruments()).toEqual(DEFAULT_INSTRUMENTS);
  });

  it("should add a new instrument successfully", function() {
    instrumentService.addInstrument();

    var expectedResult = DEFAULT_INSTRUMENTS.concat(
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
      }
    );

    expect(instrumentService.instruments()).toEqual(expectedResult);
  });

  describe("removeInstrument", function() {
    it("should remove an existing instrument correctly", function() {
      instrumentService.removeInstrument(1);

      expect(instrumentService.instruments()).toEqual([ DEFAULT_INSTRUMENTS[1] ]);
    });

    it("should do nothing when removing a non-existent Instrument", function() {
      instrumentService.removeInstrument(1232432);

      expect(instrumentService.instruments()).toEqual(DEFAULT_INSTRUMENTS);
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
