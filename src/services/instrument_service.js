"use strict";

app.factory('InstrumentService', ['$rootScope', 'IdGeneratorService', function($rootScope, IdGeneratorService) {
  var idGenerator = IdGeneratorService.buildGenerator();

  var instruments = [{
                        id:                 idGenerator.next(),
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
                        filterModulator:    'lfo',
                        filterLFOWaveform:  'sine',
                        filterLFOFrequency: 5,
                        filterLFOAmplitude: 0.46,
                        filterEnvelopeAttack:  0.04,
                        filterEnvelopeDecay:   0.0,
                        filterEnvelopeSustain: 1.0,
                        filterEnvelopeRelease: 0.2,
                        envelopeAttack:     0.04,
                        envelopeDecay:      0.0,
                        envelopeSustain:    1.0,
                        envelopeRelease:    0.2,
                     },
                     {
                        id:                 idGenerator.next(),
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
                        filterModulator:    'lfo',
                        filterLFOWaveform:  'sine',
                        filterLFOFrequency: 2.4,
                        filterLFOAmplitude: 0.78,
                        filterEnvelopeAttack:  0.04,
                        filterEnvelopeDecay:   0.0,
                        filterEnvelopeSustain: 1.0,
                        filterEnvelopeRelease: 0.2,
                        envelopeAttack:     0.05,
                        envelopeDecay:      0.0,
                        envelopeSustain:    1.0,
                        envelopeRelease:    0.0,
                     },
                     {
                        id:                 idGenerator.next(),
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
                        filterModulator:    'lfo',
                        filterLFOWaveform:  'sine',
                        filterLFOFrequency: 5,
                        filterLFOAmplitude: 0,
                        filterEnvelopeAttack:  0.04,
                        filterEnvelopeDecay:   0.0,
                        filterEnvelopeSustain: 1.0,
                        filterEnvelopeRelease: 0.2,
                        envelopeAttack:     0.02,
                        envelopeDecay:      0.0,
                        envelopeSustain:    1.0,
                        envelopeRelease:    0.0,
                     },];

  var instrumentService = {};

  instrumentService.addInstrument = function() {
    var id = idGenerator.next();
    var newInstrument = {
      id:                 id,
      name:               'Instrument ' + id,
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
      filterModulator:    'lfo',
      filterLFOWaveform:  'sine',
      filterLFOFrequency: 5,
      filterLFOAmplitude: 0,
      filterEnvelopeAttack:  0.0,
      filterEnvelopeDecay:   0.0,
      filterEnvelopeSustain: 1.0,
      filterEnvelopeRelease: 0.0,
      envelopeAttack:     0.0,
      envelopeDecay:      0.0,
      envelopeSustain:    1.0,
      envelopeRelease:    0.0,
    };

    instruments.push(newInstrument);

    return newInstrument;
  };

  instrumentService.removeInstrument = function(instrumentID) {
    var i;

    var instrumentIndex = null;
    for (i = 0; i < instruments.length; i++) {
      if (instruments[i].id === instrumentID) {
        instrumentIndex = i;
      }
    }

    if (instrumentIndex !== null) {
      instruments.splice(instrumentIndex, 1);
    }
  };

  instrumentService.updateInstrument = function() {
    $rootScope.$broadcast('InstrumentService.update');
  };

  instrumentService.instrumentByID = function(targetID) {
    for (var i = 0; i < instruments.length; i++) {
      if (instruments[i].id === targetID) {
        return instruments[i];
      }
    }

    return null;
  };

  instrumentService.instruments = function() { return instruments; };

  return instrumentService;
}]);
