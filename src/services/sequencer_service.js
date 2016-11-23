"use strict";

app.factory('SequencerService', ['$rootScope', 'IdGeneratorService', 'InstrumentService', 'PatternService', function($rootScope, IdGeneratorService, InstrumentService, PatternService) {
  var idGenerator = IdGeneratorService.buildGenerator();

  var tracks = [
                   {
                     id: idGenerator.next(),
                     name: 'Melody',
                     instrumentID: 1,
                     muted: false,
                     volume: 1.0,
                     patterns: [
                       { patternID: 1, },
                       { patternID: 1, },
                       { patternID: 1, },
                       { patternID: 1, },
                       { patternID: 1, },
                       { patternID: 1, },
                       { patternID: 1, },
                       { patternID: 1, },
                     ],
                   },
                   {
                     id: idGenerator.next(),
                     name: 'Chords',
                     instrumentID: 2,
                     muted: false,
                     volume: 1.0,
                     patterns: [
                       { patternID: 2, },
                       { patternID: 2, },
                       { patternID: 2, },
                       { patternID: 2, },
                       { patternID: 2, },
                       { patternID: 2, },
                       { patternID: 2, },
                       { patternID: 2, },
                     ],
                   }
                 ];

  var trackIndexByID = function(targetID) {
    for (var i = 0; i < tracks.length; i++) {
      if (tracks[i].id === targetID) {
        return i;
      }
    }

    return null;
  };

  var sequencerService = {};

  sequencerService.tracks = function() { return tracks; };

  sequencerService.changeSequencer = function(sequenceIndex) {
    $rootScope.$broadcast('SequencerService.update');
  };

  sequencerService.trackByID = function(targetID) {
    for (var i = 0; i < tracks.length; i++) {
      if (tracks[i].id === targetID) {
        return tracks[i];
      }
    }

    return null;
  };

  sequencerService.addTrack = function() {
    var newInstrument = InstrumentService.addInstrument();

    var newTrack = {
      id: idGenerator.next(),
      name: 'New Track',
      instrumentID: newInstrument.id,
      muted: false,
      volume: 1.0,
      patterns: [
        { patternID: -1, },
        { patternID: -1, },
        { patternID: -1, },
        { patternID: -1, },
        { patternID: -1, },
        { patternID: -1, },
        { patternID: -1, },
        { patternID: -1, },
      ],
    };
    tracks.push(newTrack);

    var newPattern = PatternService.addPattern(newTrack.id);

    $rootScope.$broadcast('SequencerService.update');

    return newTrack;
  };

  sequencerService.removeTrack = function(trackID) {
    var track = sequencerService.trackByID(trackID);
    var trackIndex = trackIndexByID(trackID);

    PatternService.patternsByTrackID(trackID).forEach(function(pattern) {
      PatternService.removePattern(pattern.id);
    });

    InstrumentService.removeInstrument(track.instrumentID);

    tracks.splice(trackIndex, 1);

    if (tracks.length === 0) {
      sequencerService.addTrack();
    }

    $rootScope.$broadcast('SequencerService.update');
  };

  sequencerService.toggleTrackMute = function(trackID) {
    var trackIndex = trackIndexByID(trackID);
    tracks[trackIndex].muted = !tracks[trackIndex].muted;
    $rootScope.$broadcast('SequencerService.update');
  };

  sequencerService.unsetPattern = function(patternID) {
    tracks.forEach(function(track) {
      track.patterns.forEach(function(pattern) {
        if (pattern.patternID === patternID) {
          pattern.patternID = -1;
        }
      });
    });
  };

  return sequencerService;
}]);
