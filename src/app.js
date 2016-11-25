"use strict";

var app = angular.module('js120', []);

app.controller('InstrumentController', ['$scope', 'InstrumentService', function($scope, InstrumentService) {
  this.updateInstrument = function() {
    InstrumentService.updateInstrument();
  };
}]);


app.controller('PatternController', ['$scope', 'PatternService', function($scope, PatternService) {
  this.updateName = function() {
    PatternService.updateName(this.pattern.id);
  };

  this.addRow = function() {
    PatternService.addRow(this.pattern.id);
  };

  this.removeRow = function(rowIndex) {
    PatternService.removeRow(this.pattern.id, rowIndex);
  };

  this.toggleRowMute = function(rowIndex) {
    PatternService.toggleRowMute(this.pattern.id, rowIndex);
  };

  this.updateNotes = function(rowIndex, noteIndex) {
    PatternService.updateNotes(this.pattern.id, rowIndex, noteIndex);
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


app.controller('TrackEditorController',
               ['$scope', 'SequencerService', 'InstrumentService', 'PatternService',
               function($scope, SequencerService, InstrumentService, PatternService) {
  $scope.trackID = 1;
  $scope.selectedTab = "instrument";

  $scope.instrument = InstrumentService.instrumentByID(SequencerService.trackByID($scope.trackID).instrumentID);
  $scope.pattern = PatternService.patternsByTrackID($scope.trackID)[0];

  var buildTrackOptions = function() {
    return SequencerService.tracks().map(function(track) {
      return { id: track.id, name: track.name };
    });
  };

  $scope.trackOptions = buildTrackOptions();

  var buildPatternOptions = function() {
    return PatternService.patternsByTrackID($scope.trackID).map(function(pattern) {
      return { id: pattern.id, name: pattern.name };
    });
  };

  $scope.patternOptions = buildPatternOptions();

  $scope.$on('SequencerService.addTrack', function(event, args) {
    $scope.trackOptions = buildTrackOptions();
  });

  $scope.$on('SequencerService.removeTrack', function(event, args) {
    $scope.trackOptions = buildTrackOptions();

    if (args.trackID === $scope.trackID) {
      $scope.trackID = $scope.trackOptions[0].id;
    }
    $scope.changeSelectedTrack();
  });

  $scope.$on('SequencerController.trackNameChanged', function(event, args) {
    $scope.trackOptions = buildTrackOptions();
  });

   $scope.$on('PatternService.update', function(event, args) {
     $scope.patternOptions = buildPatternOptions();
     $scope.pattern = PatternService.patternByID($scope.pattern.id);
  });

  $scope.changeSelectedTab = function(newSelectedTab) {
    $scope.selectedTab = newSelectedTab;
  };

  $scope.changeSelectedTrack = function() {
    $scope.instrument = InstrumentService.instrumentByID(SequencerService.trackByID($scope.trackID).instrumentID);
    $scope.patternOptions = buildPatternOptions();
    $scope.pattern = PatternService.patternByID($scope.patternOptions[0].id);
  };

  $scope.changeSelectedPattern = function(patternID) {
    $scope.pattern = PatternService.patternByID(patternID);
  };

  $scope.addPattern = function() {
    var newPattern = PatternService.addPattern($scope.trackID);

    $scope.patternOptions = buildPatternOptions();
    $scope.pattern = newPattern;
  };

  $scope.removePattern = function(patternID) {
    var i;
    var newSelectedPatternID;

    if (patternID === $scope.pattern.id) {
      i = 0;
      while (i < this.patternOptions.length && this.patternOptions[i].id !== patternID) {
        i++;
      }

      if (i === (this.patternOptions.length - 1)) {
        newSelectedPatternID = this.patternOptions[i - 1].id;
      }
      else {
        newSelectedPatternID = this.patternOptions[i + 1].id;
      }
    }
    else {
      newSelectedPatternID = $scope.pattern.id;
    }

    SequencerService.unsetPattern(patternID);
    PatternService.removePattern(patternID);

    $scope.patternOptions = buildPatternOptions();
    if (newSelectedPatternID !== patternID) {
      $scope.changeSelectedPattern(newSelectedPatternID);
    }
  };
}]);


app.controller('TransportController', ['$scope', 'SerializationService', 'TransportService', function($scope, SerializationService, TransportService) {
  $scope.playing = false;
  $scope.amplitude = 0.25;
  $scope.tempo = 100;
  $scope.loop = true;

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

  $scope.isEnabled = function() {
    return TransportService.isEnabled();
  };
}]);


app.controller('ExportController', ['$scope', 'TransportService', function($scope, TransportService) {
  var downloadEnabled = typeof document.getElementById("hidden-download-link").download !== "undefined";

  $scope.downloadFileName = "js-120";
  $scope.downloadBoxVisible = false;

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
