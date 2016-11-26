"use strict";

app.factory('PatternService', ['$rootScope', 'IdGeneratorService', 'InstrumentService', function($rootScope, IdGeneratorService, InstrumentService) {
  var idGenerator = IdGeneratorService.buildGenerator();

  var patterns = [
                   {
                     id: idGenerator.next(),
                     name: 'Melody 1',
                     trackID: 1,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'G2'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: 'G2'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},],
                       },
                     ],
                   },
                   {
                     id: idGenerator.next(),
                     name: 'Melody 2',
                     trackID: 1,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'Ab2'},
                                 {name: 'Bb3'},
                                 {name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: 'Bb3'},
                                 {name: ''},
                                 {name: 'Ab2'},
                                 {name: ''},],
                       },
                     ],
                   },
                   {
                     id: idGenerator.next(),
                     name: 'Melody 3',
                     trackID: 1,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'G2'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: 'Eb3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: 'B3'},
                                 {name: 'C3'},
                                 {name: 'B3'},
                                 {name: 'C3'},
                                 {name: 'B3'},
                                 {name: 'C3'},
                                 {name: 'A3'},
                                 {name: 'B3'},],
                       },
                     ],
                   },
                   {
                     id: idGenerator.next(),
                     name: 'Melody 4',
                     trackID: 1,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},],
                       },
                     ],
                   },
                   {
                     id: idGenerator.next(),
                     name: 'Melody 5',
                     trackID: 1,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},],
                       },
                     ],
                   },
                   {
                     id: idGenerator.next(),
                     name: 'Melody 6',
                     trackID: 1,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'C3'},
                                 {name: ''},
                                 {name: 'Bb3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: 'G2'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},],
                       },
                     ],
                   },

                   {
                     id: idGenerator.next(),
                     name: 'Chords 1',
                     trackID: 2,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'G3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'G3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'G3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'G3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},],
                       },
                       {
                         muted: false,
                         notes: [{name: 'Eb3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'Eb3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'Eb3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'Eb3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},],
                       },
                       {
                         muted: false,
                         notes: [{name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},],
                       },
                     ],
                   },
                   {
                     id: idGenerator.next(),
                     name: 'Chords 2',
                     trackID: 2,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'Ab3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'Ab3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'Ab3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'Ab3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},],
                       },
                       {
                         muted: false,
                         notes: [{name: 'F3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'F3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'F3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'F3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},],
                       },
                       {
                         muted: false,
                         notes: [{name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},],
                       },
                     ],
                   },
                   {
                     id: idGenerator.next(),
                     name: 'Chords 3',
                     trackID: 2,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'G3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'G3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'G3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'G3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},],
                       },
                       {
                         muted: false,
                         notes: [{name: 'Eb3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'Eb3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'F3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'F3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},],
                       },
                       {
                         muted: false,
                         notes: [{name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'D3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'D3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},],
                       },
                     ],
                   },
                   {
                     id: idGenerator.next(),
                     name: 'Chords 4',
                     trackID: 2,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'G3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'G3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'G3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'G3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: 'Ab3'},],
                       },
                       {
                         muted: false,
                         notes: [{name: 'Eb3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'Eb3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'Eb3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'Eb3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: 'F3'},],
                       },
                       {
                         muted: false,
                         notes: [{name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: 'C3'},],
                       },
                     ],
                   },
                   {
                     id: idGenerator.next(),
                     name: 'Chords 5',
                     trackID: 2,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'G3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'G3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'G3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'G3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},],
                       },
                       {
                         muted: false,
                         notes: [{name: 'Eb3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'Eb3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'Eb3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'Eb3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},],
                       },
                       {
                         muted: false,
                         notes: [{name: 'Bb3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'Bb3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'Bb3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},],
                       },
                     ],
                   },


                   {
                     id: idGenerator.next(),
                     name: 'Bass 1',
                     trackID: 3,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'C1'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: 'C1'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: 'C1'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: 'C1'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},],
                       },
                     ],
                   },
                   {
                     id: idGenerator.next(),
                     name: 'Bass 2',
                     trackID: 3,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'C1'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: 'C1'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: 'G0'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: 'G0'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},],
                       },
                     ],
                   },
                   {
                     id: idGenerator.next(),
                     name: 'Bass 3',
                     trackID: 3,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'C1'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: 'C1'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: 'C1'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: 'C1'},
                                 {name: ''},
                                 {name: ''},
                                 {name: 'F0'},],
                       },
                     ],
                   },
                   {
                     id: idGenerator.next(),
                     name: 'Bass 4',
                     trackID: 3,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'Eb1'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: 'Eb1'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: 'Eb1'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: 'C1'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},],
                       },
                     ],
                   },
                   {
                     id: idGenerator.next(),
                     name: 'Bass 5',
                     trackID: 3,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'G0'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: 'G0'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: 'G0'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: 'G0'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},],
                       },
                     ],
                   },
                 ];
  
  var patternService = {};

  patternService.addPattern = function(trackID) {
    var id = idGenerator.next();

    var newPattern = {
      id: id,
      name: 'Pattern ' + id,
      trackID: trackID,
      rows: [
        {
          muted: false,
          notes: [{name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},],
        },
      ]
    };

    patterns.push(newPattern);

    $rootScope.$broadcast('PatternService.add');

    return newPattern;
  };

  patternService.removePattern = function(patternID) {
    var patternIndex = patternIndexByID(patternID);
    patterns.splice(patternIndex, 1);

    $rootScope.$broadcast('PatternService.remove');
    $rootScope.$broadcast('PatternService.update');
  };

  var patternIndexByID = function(targetID) {
    for (var i = 0; i < patterns.length; i++) {
      if (patterns[i].id === targetID) {
        return i;
      }
    }

    return null;
  };

  patternService.addRow = function(patternID) {
    var newRow = {
                   muted: false,
                   notes: [{name: ''},
                           {name: ''},
                           {name: ''},
                           {name: ''},
                           {name: ''},
                           {name: ''},
                           {name: ''},
                           {name: ''},
                           {name: ''},
                           {name: ''},
                           {name: ''},
                           {name: ''},
                           {name: ''},
                           {name: ''},
                           {name: ''},
                           {name: ''}],
                   };
    var pattern = patternService.patternByID(patternID);
    pattern.rows.push(newRow);

    $rootScope.$broadcast('PatternService.update');
  };

  patternService.removeRow = function(patternID, rowIndex) {
    var pattern = patternService.patternByID(patternID);
    pattern.rows.splice(rowIndex, 1);

    if (pattern.rows.length === 0) {
      patternService.addRow(patternID);
    }

    $rootScope.$broadcast('PatternService.update');
  };

  patternService.toggleRowMute = function(patternID, rowIndex) {
    var pattern = patternService.patternByID(patternID);
    pattern.rows[rowIndex].muted = !pattern.rows[rowIndex].muted;
    $rootScope.$broadcast('PatternService.update');
  };

  patternService.updateName = function(patternID) {
    $rootScope.$broadcast('PatternService.update');
  };

  patternService.updateNotes = function(patternID, rowIndex, noteIndex) {
    var i;
    var pattern = patternService.patternByID(patternID);
    var newNoteName = pattern.rows[rowIndex].notes[noteIndex].name;

    if (newNoteName === "-") {
      i = noteIndex - 1;
      while (i >= 0 && pattern.rows[rowIndex].notes[i].name === "") {
        pattern.rows[rowIndex].notes[i].name = "-";
        i -= 1;
      }
    }
    else if (newNoteName === "") {
      i = noteIndex + 1;
      while (i < pattern.rows[rowIndex].notes.length && pattern.rows[rowIndex].notes[i].name === "-") {
        pattern.rows[rowIndex].notes[i].name = "";
        i += 1;
      }
    }

    $rootScope.$broadcast('PatternService.update');
  };
 
  patternService.patterns = function() { return patterns; };

  patternService.patternByID = function(targetID) {
    for (var i = 0; i < patterns.length; i++) {
      if (patterns[i].id === targetID) {
        return patterns[i];
      }
    }

    return null;
  };

  patternService.patternsByTrackID = function(trackID) {
    var filteredPatterns = [];

    for (var i = 0; i < patterns.length; i++) {
      if (patterns[i].trackID === trackID) {
        filteredPatterns.push(patterns[i]);
      }
    }

    return filteredPatterns;
  };

  return patternService;
}]);
