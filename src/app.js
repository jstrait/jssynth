"use strict";

var app = angular.module('js120', []);

app.controller('InstrumentController', ['$scope', 'InstrumentService', 'SequencerService', function($scope, InstrumentService, SequencerService) {
  var instrumentID = 1;
  
  $scope.instrument = InstrumentService.instrumentByID(instrumentID);

  $scope.$on('TrackEditorController.selectedTrackChanged', function(event, args) {
    instrumentID = SequencerService.trackByID(args.trackID).instrumentID;
    $scope.instrument = InstrumentService.instrumentByID(instrumentID);
  });

  $scope.$on('InstrumentService.update', function(event) {
    $scope.instrument = InstrumentService.instrumentByID(instrumentID);
  });

  $scope.updateInstrument = function() {
    InstrumentService.updateInstrument();
  };
}]);


app.controller('PatternCollectionController', ['$rootScope', '$scope', 'PatternService', 'SequencerService', function($rootScope, $scope, PatternService, SequencerService) {
  var trackID = 1;

  var buildPatternOptions = function() {
    return PatternService.patternsByTrackID(trackID).map(function(pattern) {
     return { id: pattern.id, name: pattern.name };
    });
  };

  $scope.patternOptions = buildPatternOptions();

  $scope.$on('TrackEditorController.selectedTrackChanged', function(event, args) {
    trackID = args.trackID;
    $scope.patternOptions = buildPatternOptions();
    $scope.changeSelectedPattern($scope.patternOptions[0].id);
  });
  $scope.$on('PatternService.update', function(event) {
    $scope.patternOptions = buildPatternOptions();
  });

  $scope.selectedPatternID = 1;

  $scope.addPattern = function() {
    var newPattern = PatternService.addPattern(trackID);
    $scope.changeSelectedPattern(newPattern.id);
  };

  $scope.removePattern = function(patternID) {
    var i;
    var newSelectedPatternID;
    
    if (patternID === $scope.selectedPatternID) {
      i = 0;
      while (i < $scope.patternOptions.length && $scope.patternOptions[i].id !== patternID) {
        i++;
      }

      if (i === ($scope.patternOptions.length - 1)) {
        newSelectedPatternID = $scope.patternOptions[i - 1].id;
      }
      else {
        newSelectedPatternID = $scope.patternOptions[i + 1].id;
      }
    }
    else {
      newSelectedPatternID = $scope.selectedPatternID;
    }

    SequencerService.unsetPattern(patternID);
    PatternService.removePattern(patternID);

    if (newSelectedPatternID !== patternID) {
      $scope.changeSelectedPattern(newSelectedPatternID);
    }
  };

  $scope.changeSelectedPattern = function(patternID) {
    $scope.selectedPatternID = patternID;
    $rootScope.$broadcast('PatternCollectionController.selectedPatternChanged', { patternID: patternID });
  };
}]);


app.controller('PatternController', ['$scope', 'InstrumentService', 'PatternService', function($scope, InstrumentService, PatternService) {
  var instrumentID = 1;
  $scope.pattern = PatternService.patternByID(1);

  var buildInstrumentOptions = function() {
    return InstrumentService.instruments().map(function(instrument) {
     return { id: instrument.id, name: instrument.name };
    });
  };

  $scope.instrumentOptions = buildInstrumentOptions();
  $scope.$on('InstrumentService.update', function(event) {
    $scope.instrumentOptions = buildInstrumentOptions();
  });
  $scope.$on('PatternCollectionController.selectedPatternChanged', function(event, args) {
    $scope.pattern = PatternService.patternByID(args.patternID);
  });

  $scope.$on('PatternService.update', function(event) {
    $scope.pattern = PatternService.patternByID($scope.pattern.id);
  });

  $scope.updateName = function() {
    PatternService.updateName($scope.pattern.id);
  };

  $scope.addRow = function() {
    PatternService.addRow($scope.pattern.id);
  };

  $scope.removeRow = function(rowIndex) {
    PatternService.removeRow($scope.pattern.id, rowIndex);
  };

  $scope.toggleRowMute = function(rowIndex) {
    PatternService.toggleRowMute($scope.pattern.id, rowIndex);
  };

  $scope.updateNotes = function(rowIndex, noteIndex) {
    PatternService.updateNotes($scope.pattern.id, rowIndex, noteIndex);
  };
}]);


app.controller('SequencerController', ['$rootScope', '$scope', '$interval', 'InstrumentService', 'PatternService', 'SequencerService', 'TransportService', function($rootScope, $scope, $interval, InstrumentService, PatternService, SequencerService, TransportService) {
  var LEFT_ARROW = "←";
  var RIGHT_ARROW = "→";
  var timeoutId;

  $scope.expanded = true;
  $scope.expansionToggleLabel = LEFT_ARROW;
  $scope.tracks = SequencerService.tracks();
  $scope.currentStep = null;

  var buildPatternOptions = function() {
    var patternOptions = $scope.tracks.map(function(track) {
      var trackPatterns = PatternService.patternsByTrackID(track.id);
      var options = trackPatterns.map(function(pattern) {
        return { id: pattern.id, name: pattern.name, }
      });

      options.unshift({ id: -1, name: ''});

      return options;
    });

    return patternOptions;
  };

  $scope.$on('TransportService.start', function(event) {
    timeoutId = $interval(function() {
      $scope.syncCurrentStep();
    }, 15);
  });

  $scope.$on('TransportService.stop', function(event) {
    $interval.cancel(timeoutId);
    $scope.currentStep = null;
  });

  $scope.patternOptions = buildPatternOptions();
  $scope.$on('PatternService.update', function(event) {
    $scope.patternOptions = buildPatternOptions();
  });

  $scope.changeSequencer = function() {
    SequencerService.changeSequencer();
  };

  $scope.toggleExpansion = function() {
    $scope.expanded = !$scope.expanded;

    if ($scope.expanded) {
      $scope.expansionToggleLabel = LEFT_ARROW;
    }
    else {
      $scope.expansionToggleLabel = RIGHT_ARROW;
    }
  };

  $scope.addTrack = function() {
    var newTrack = SequencerService.addTrack();
  };

  $scope.removeTrack = function(trackID) {
    SequencerService.removeTrack(trackID);
    $scope.patternOptions = buildPatternOptions();
  };

  $scope.toggleTrackMute = function(trackID) {
    SequencerService.toggleTrackMute(trackID);
  };

  $scope.changeTrackName = function(trackID) {
    $rootScope.$broadcast('SequencerController.trackNameChanged', { trackID: trackID, });
  }

  $scope.syncCurrentStep = function() {
    if (TransportService.currentStep() !== null) {
      $scope.currentStep = Math.floor((TransportService.currentStep() / 16) % 8) + 1;
    }
    else
    {
      $scope.currentStep = null;
    }
  };
}]);


app.controller('TrackEditorController', ['$rootScope', '$scope', 'SequencerService', function($rootScope, $scope, SequencerService) {
  $scope.trackID = 1;
  $scope.selectedTab = "instrument";

  var buildTrackOptions = function() {
    return SequencerService.tracks().map(function(track) {
     return { id: track.id, name: track.name };
    });
  };

  $scope.trackOptions = buildTrackOptions();

  $scope.$on('SequencerService.addTrack', function(event, args) {
    $scope.trackOptions = buildTrackOptions();
  });

  $scope.$on('SequencerService.removeTrack', function(event, args) {
    $scope.trackOptions = buildTrackOptions();
  });

  $scope.$on('SequencerController.trackNameChanged', function(event, args) {
    $scope.trackOptions = buildTrackOptions();
  });

  $scope.changeSelectedTab = function(newSelectedTab) {
    $scope.selectedTab = newSelectedTab;
  };

  $scope.changeSelectedTrack = function() {
    $rootScope.$broadcast('TrackEditorController.selectedTrackChanged', { trackID: $scope.trackID });
  };
}]);


app.controller('TransportController', ['$scope', 'SerializationService', 'TransportService', function($scope, SerializationService, TransportService) {
  var downloadEnabled = typeof document.getElementById("hidden-download-link").download !== "undefined";

  $scope.playing = false;
  $scope.amplitude = 0.25;
  $scope.tempo = 100;
  $scope.loop = true;
  $scope.downloadFileName = "js-120";
  $scope.downloadBoxVisible = false;

  TransportService.setPatterns(SerializationService.serialize());
  $scope.$on('InstrumentService.update', function(event) {
    TransportService.setPatterns(SerializationService.serialize());
  });
  $scope.$on('PatternService.update', function(event) {
    TransportService.setPatterns(SerializationService.serialize());
  });
  $scope.$on('SequencerService.update', function(event) {
    TransportService.setPatterns(SerializationService.serialize());
  });

  $scope.updateTempo = function() {
    TransportService.setTempo(parseInt($scope.tempo, 10));
  };

  $scope.updateAmplitude = function() {
    TransportService.setAmplitude(parseFloat($scope.amplitude));
  };

  $scope.toggle = function() {
    TransportService.toggle();
    $scope.playing = !$scope.playing;
  };

  $scope.updateLoop = function() {
    TransportService.loop = $scope.loop;
  };

  $scope.toggleDownloadBox = function() {
    $scope.downloadBoxVisible = !$scope.downloadBoxVisible;
  };

  $scope.export = function() {
    if (!downloadEnabled) {
      alert("Downloading to Wave file is not supported in your browser.");
      return;
    }

    var exportCompleteCallback = function(blob) {      
      var url  = window.URL.createObjectURL(blob);

      var hiddenDownloadLink = document.getElementById("hidden-download-link");
      hiddenDownloadLink.download = $scope.downloadFileName + ".wav";
      hiddenDownloadLink.href = url;
      hiddenDownloadLink.click();

      window.URL.revokeObjectURL(blob);
    };

    TransportService.export(exportCompleteCallback);
  };
}]);
