"use strict";

app.factory('PatternService', ['$rootScope', 'IdGeneratorService', 'InstrumentService', function($rootScope, IdGeneratorService, InstrumentService) {
  var idGenerator = IdGeneratorService.buildGenerator();

  var patterns = [
                   {
                     id: idGenerator.next(),
                     name: 'Pattern 1',
                     instrumentID: 1,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'E4'},
                                 {name: 'G4'},
                                 {name: ''},
                                 {name: 'E4'},
                                 {name: 'A5'},
                                 {name: '-'},
                                 {name: 'C5'},
                                 {name: '-'},
                                 {name: 'A5'},
                                 {name: '-'},
                                 {name: 'G4'},
                                 {name: '-'},
                                 {name: 'E4'},
                                 {name: 'D4'},
                                 {name: 'C4'},
                                 {name: ''},],
                       },
                     ],
                   },
                   {
                     id: idGenerator.next(),
                     name: 'Pattern 2',
                     instrumentID: 2,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'C1'},
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
                                 {name: 'D1'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},],
                       },
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
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},],
                       },
                       {
                         muted: false,
                         notes: [{name: 'E3'},
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
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},],
                       },
                     ],
                   },
                 ];
  
  var patternService = {};

  patternService.addPattern = function(instrumentID) {
    var id = idGenerator.next();

    var newPattern = {
      id: id,
      name: 'Pattern ' + id,
      instrumentID: instrumentID,
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

    $rootScope.$broadcast('PatternService.update');

    return newPattern;
  };

  patternService.removePattern = function(patternID) {
    var patternIndex = patternIndexByID(patternID);
    patterns.splice(patternIndex, 1);

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

  patternService.patternsByInstrumentID = function(targetID) {
    var filteredPatterns = [];

    for (var i = 0; i < patterns.length; i++) {
      if (patterns[i].instrumentID === targetID) {
        filteredPatterns.push(patterns[i]);
      }
    }

    return filteredPatterns;
  };

  return patternService;
}]);
