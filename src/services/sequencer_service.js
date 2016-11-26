"use strict";

app.factory('SequencerService', ['$rootScope', 'IdGeneratorService', 'InstrumentService', 'PatternService', function($rootScope, IdGeneratorService, InstrumentService, PatternService) {
  var idGenerator = IdGeneratorService.buildGenerator();

  var tracks = [
                 {
                   id: idGenerator.next(),
                   name: 'Melody',
                   instrumentID: 1,
                   muted: false,
                   volume: 0.8,
                   patterns: [
                     { patternID: 1, },
                     { patternID: 2, },
                     { patternID: 3, },
                     { patternID: 4, },
                     { patternID: 5, },
                     { patternID: 6, },
                     { patternID: 3, },
                     { patternID: 4, },
                   ],
                 },
                 {
                   id: idGenerator.next(),
                   name: 'Chords',
                   instrumentID: 2,
                   muted: false,
                   volume: 0.8,
                   patterns: [
                     { patternID:  7, },
                     { patternID:  8, },
                     { patternID:  9, },
                     { patternID: 10, },
                     { patternID:  7, },
                     { patternID: 11, },
                     { patternID:  9, },
                     { patternID:  7, },
                   ],
                 },
                 {
                   id: idGenerator.next(),
                   name: 'Bass',
                   instrumentID: 3,
                   muted: false,
                   volume: 0.8,
                   patterns: [
                     { patternID: 12, },
                     { patternID: 12, },
                     { patternID: 13, },
                     { patternID: 14, },
                     { patternID: 12, },
                     { patternID: 15, },
                     { patternID: 16, },
                     { patternID: 12, },
                   ],
                 },
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

  sequencerService.changeSequencer = function() {
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
      volume: 0.8,
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

    $rootScope.$broadcast('SequencerService.addTrack');

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

    $rootScope.$broadcast('SequencerService.removeTrack', { trackID: trackID });
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
