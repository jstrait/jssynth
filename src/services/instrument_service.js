"use strict";

app.factory('InstrumentService', ['$rootScope', 'IdGeneratorService', function($rootScope, IdGeneratorService) {
  var idGenerator = IdGeneratorService.buildGenerator();

  var instruments = [{
                        id:                 idGenerator.next(),
                        name:               'Instrument 1',
                        waveform1:          'square',
                        waveform1Octave:    0,
                        waveform2:          'sawtooth',
                        waveform2Detune:    0,
                        waveform2Octave:    0,
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
                        id:                 idGenerator.next(),
                        name:               'Instrument 2',
                        waveform1:          'sawtooth',
                        waveform1Octave:    0,
                        waveform2:          'sine',
                        waveform2Detune:    0,
                        waveform2Octave:    0,
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
      filterLFOWaveform:  'sine',
      filterLFOFrequency: 5,
      filterLFOAmplitude: 0,
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
