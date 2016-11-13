"use strict";

var app = angular.module('js120', []);

app.controller('InstrumentController', ['$scope', 'InstrumentService', 'SequencerService', function($scope, InstrumentService, SequencerService) {
  var instrumentID = 1;
  
  $scope.instrument = InstrumentService.instrumentByID(instrumentID);
  $scope.$on('SequencerController.selectedTrackChanged', function(event, args) {
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
  var instrumentID = 1;

  var buildPatternOptions = function() {
    return PatternService.patternsByInstrumentID(instrumentID).map(function(pattern) {
     return { id: pattern.id, name: pattern.name };
    });
  };

  $scope.patternOptions = buildPatternOptions();
  $scope.$on('SequencerController.selectedTrackChanged', function(event, args) {
    instrumentID = SequencerService.trackByID(args.trackID).instrumentID;
    $scope.patternOptions = buildPatternOptions();
    $scope.changeSelectedPattern($scope.patternOptions[0].id);
  });
  $scope.$on('PatternService.update', function(event) {
    $scope.patternOptions = buildPatternOptions();
  });

  $scope.selectedPatternID = 1;

  $scope.addPattern = function() {
    var newPattern = PatternService.addPattern(instrumentID);
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

  $scope.changeInstrument = function() {
    PatternService.changeInstrument($scope.pattern.id);
  };

  $scope.addTrack = function() {
    PatternService.addTrack($scope.pattern.id);
  };

  $scope.removeTrack = function(trackIndex) {
    PatternService.removeTrack($scope.pattern.id, trackIndex);
  };

  $scope.toggleTrackMute = function(trackIndex) {
    PatternService.toggleTrackMute($scope.pattern.id, trackIndex);
  };

  $scope.updateNotes = function(trackIndex, noteIndex) {
    PatternService.updateNotes($scope.pattern.id, trackIndex, noteIndex);
  };
}]);


app.controller('SequencerController', ['$rootScope', '$scope', '$interval', 'InstrumentService', 'PatternService', 'SequencerService', 'TransportService', function($rootScope, $scope, $interval, InstrumentService, PatternService, SequencerService, TransportService) {
  var timeoutId;

  $scope.tracks = SequencerService.tracks();
  $scope.selectedTrack = SequencerService.trackByID(1);
  $scope.currentStep = null;

  var buildPatternOptions = function() {
    var patternOptions = InstrumentService.instruments().map(function(instrument) {
      var instrumentPatterns = PatternService.patternsByInstrumentID(instrument.id);
      var options = instrumentPatterns.map(function(pattern) {
        return { id: pattern.id, name: pattern.name, }
      });

      options.unshift({ id: -1, name: ''});

      return options;
    });

    return patternOptions;
  };

  $scope.$on('TransportService.start', function(event) {
    var timeoutId = $interval(function() {
      $scope.syncCurrentStep();
    }, 15);
  });

  $scope.$on('TransportService.stop', function(event) {
    $interval.cancel(timeoutId);
  });

  $scope.patternOptions = buildPatternOptions();
  $scope.$on('PatternService.update', function(event) {
    $scope.patternOptions = buildPatternOptions();
  });

  $scope.changeSequencer = function(sequenceIndex) {
    SequencerService.changeSequencer(sequenceIndex);
  };

  $scope.addTrack = function() {
    SequencerService.addTrack();
  };

  $scope.removeTrack = function(trackID) {
    SequencerService.removeTrack(trackID);
  };

  $scope.toggleTrackMute = function(trackID) {
    SequencerService.toggleTrackMute(trackID);
  };

  $scope.changeSelectedTrack = function(trackID) {
    $scope.selectedTrack = SequencerService.trackByID(trackID);
    $rootScope.$broadcast('SequencerController.selectedTrackChanged', { trackID: $scope.selectedTrack.id, });
  };

  $scope.changeTrackName = function(trackID) {
    $rootScope.$broadcast('SequencerController.trackNameChanged', { trackID: trackID, });
  }

  $scope.syncCurrentStep = function() {
    if (TransportService.currentStep()) {
      $scope.currentStep = Math.floor((TransportService.currentStep() / 16) % 8) + 1;
    }
    else
    {
      $scope.currentStep = null;
    }
  };
}]);


app.controller('TrackEditorController', ['$scope', 'SequencerService', function($scope, SequencerService) {
  $scope.trackID = 1;
  $scope.trackName = SequencerService.trackByID($scope.trackID).name;

  $scope.$on('SequencerController.selectedTrackChanged', function(event, args) {
    var track = SequencerService.trackByID(args.trackID);
    $scope.trackID = track.id;
    $scope.trackName = track.name;
  });

  $scope.$on('SequencerController.trackNameChanged', function(event, args) {
    if (args.trackID === $scope.trackID) {
      var track = SequencerService.trackByID(args.trackID);
      $scope.trackName = track.name;
    }
  });
}]);


app.controller('TransportController', ['$scope', 'SerializationService', 'TransportService', function($scope, SerializationService, TransportService) {
  $scope.playing = false;
  $scope.amplitude = 0.25;
  $scope.tempo = 100;
  $scope.loop = true;
  $scope.downloadFileName = "js-120";

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

  $scope.export = function() {
    var exportCompleteCallback = function(blob) {
      var url  = window.URL.createObjectURL(blob);

      var hiddenDownloadLink = document.getElementById("hidden-download-link");
      if (typeof hiddenDownloadLink.download != "undefined") {
        hiddenDownloadLink.download = $scope.downloadFileName + ".wav";
        hiddenDownloadLink.href = url;
        hiddenDownloadLink.click();
      }
      else {
        alert("Downloading to Wave file is not supported in your browser.");
      }

      window.URL.revokeObjectURL(blob);
    };

    TransportService.export(exportCompleteCallback);
  };
}]);


// Copied from Angular docs, added to allow using an integer value
// with a <select> tag.
app.directive('convertToNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(val) {
        return parseInt(val, 10);
      });
      ngModel.$formatters.push(function(val) {
        return '' + val;
      });
    }
  };
});


app.directive('instrumentEditor', function() {
  var controller = ['$scope', function ($scope) { }];

  return {
    restrict: 'A',
    scope: {
      instrument: '=',
      updateInstrument: '&',
    },
    controller: controller,
    templateUrl: 'instrument.html',
  };
});


app.directive('tabList', function() {
  return {
    restrict: 'A',
    transclude: true,
    scope: {
      title: '@',
    },
    controller: ['$scope', function($scope) {
      var panes = $scope.panes = [];

      $scope.select = function(pane) {
        panes.forEach(function(pane) {
          pane.selected = false;
        });
        pane.selected = true;
      };

      this.addPane = function(pane) {
        if (panes.length === 0) {
          $scope.select(pane);
        }
        panes.push(pane);
      };
    }],
    templateUrl: 'tabList.html'
  };
});

app.directive('tabPane', function() {
  return {
    require: '^^tabList',
    restrict: 'A',
    transclude: true,
    scope: {
      title: '@'
    },
    link: function(scope, element, attrs, tabsCtrl) {
      tabsCtrl.addPane(scope);
    },
    templateUrl: 'tabPane.html'
  };
});


app.directive('noteInput', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ctrl) {
       if (!ctrl) return;

       var formatNoteValue = function(rawValue) {
         var formattedValue = rawValue;

         // Make first character uppercase (but not subsequent characters, to avoid
         // making a 'b' uppercase, which will mess with ♭ replacement).
         var firstCharacter = formattedValue.substr(0, 1);
         formattedValue = firstCharacter.toUpperCase() + formattedValue.substr(1);

         formattedValue = formattedValue.replace("##", "𝄪");
         formattedValue = formattedValue.replace("#", "♯");
         formattedValue = formattedValue.replace("bb", "𝄫");
         formattedValue = formattedValue.replace("b", "♭");
         formattedValue = formattedValue.replace("-", "—");

         return formattedValue;
       };

       ctrl.$formatters.push(function (a) {
         return formatNoteValue(ctrl.$modelValue);
       });

       ctrl.$parsers.unshift(function (viewValue) {
         var parsedValue = viewValue;

         // Make first character uppercase (but not subsequent characters, to avoid
         // making a 'b' uppercase, which will mess with ♭ replacement).
         var firstCharacter = viewValue.substr(0, 1);
         parsedValue = firstCharacter.toUpperCase() + viewValue.substr(1);
         parsedValue = parsedValue.replace("♯", "#");
         parsedValue = parsedValue.replace("𝄪", "##");
         parsedValue = parsedValue.replace("♭", "b");
         parsedValue = parsedValue.replace("𝄫", "bb");

         if (/^$|^-$|(^[A-G](b|bb|#|##){0,1}[0-7]$)/.test(parsedValue)) {
           ctrl.$setValidity('noteInput', true);
           return parsedValue;
         }
         else {
           ctrl.$setValidity('noteInput', false);
           return '';
         }
       });

       element.bind('blur', function(e) {
         element.val(formatNoteValue(element.val()));
       });

       element.bind('keydown', function(e) {
         var changeCurrentlySelectedNote = function(element, config) {
           var patternID = parseInt(element[0].id.split("-")[1], 10);
           var trackIndex = parseInt(element[0].id.split("-")[3], 10);
           var noteIndex = parseInt(element[0].id.split("-")[5], 10);
           var nextNoteId = 'pattern-' + patternID + '-track-' + (trackIndex + config.trackIndexDelta) + '-note-' + (noteIndex + config.noteIndexDelta);

           document.getElementById(nextNoteId).focus();
         };

         var currentValue = element.val();

         if (e.keyCode === 32) {  // Space bar
           element.val('');
         }
         else if (e.keyCode >= 48 && e.keyCode <= 57) {  // Numbers 0 through 9
           if (/^.*\d$/.test(currentValue)) {
             element.val(currentValue.slice(0, currentValue.length - 1));
           }
         }
         else if (e.keyCode === 189) {  // Dash
           element.val('');
         }
         else if (e.keyCode === 37) {  // Left arrow key
           if (element[0].selectionStart === 0 && !(element.hasClass('firstNote'))) {
             changeCurrentlySelectedNote(element, { trackIndexDelta: 0, noteIndexDelta: -1 });
           }
         }
         else if (e.keyCode === 39) {  // Right arrow key
           if (element[0].selectionEnd === currentValue.length && !(element.hasClass('lastNote'))) {
             changeCurrentlySelectedNote(element, { trackIndexDelta: 0, noteIndexDelta: 1 });
           }
         }
         else if (e.keyCode === 38) {  // Up arrow key
           if (!(element.hasClass('firstTrack'))) {
             changeCurrentlySelectedNote(element, { trackIndexDelta: -1, noteIndexDelta: 0 });
           }
         }
         else if (e.keyCode === 40) {  // Down arrow key
           if (!(element.hasClass('lastTrack'))) {
             changeCurrentlySelectedNote(element, { trackIndexDelta: 1, noteIndexDelta: 0 });
           }
         }
       });

       element.bind('keyup', function(e) {
         if (e.keyCode === 32) {  // Space bar
           element.val('');
         }
       });
    }
  };
});
