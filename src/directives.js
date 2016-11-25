"use strict";

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


app.filter('octaveOffset', function() {
  return function(input) {
    var integer = parseInt(input);
    return (integer > 0) ? ("+" + integer) : String(integer);
  };
});


app.directive('instrumentEditor', function() {
  return {
    restrict: 'A',
    scope: {},
    bindToController: {
      instrument: '=',
    },
    controller: 'InstrumentController',
    controllerAs: 'ctrl',
    templateUrl: 'templates/instrument_editor.html',
  };
});


app.directive('patternList', function() {
  return {
    restrict: 'A',
    scope: {},
    bindToController: {
      patternOptions: '=',
      selectedPatternId: '=',
      onChangeSelectedPattern: '&',
      onAddPattern: '&',
    },
    controller: 'PatternListController',
    controllerAs: 'ctrl',
    templateUrl: 'templates/pattern_list.html',
  };
});


app.directive('patternEditor', function() {
  return {
    restrict: 'A',
    scope: {},
    bindToController: {
      pattern: '=',
    },
    controller: 'PatternController',
    controllerAs: 'ctrl',
    templateUrl: 'templates/pattern_editor.html',
  };
});


app.directive('sequencer', function() {
  return {
    restrict: 'A',
    scope: {
      expanded: '=',
      addTrack: '&',
      removeTrack: '&',
      changeTrackName: '&',
      toggleTrackMute: '&',
      changeSelectedTrack: '&',
      toggleExpansion: '&',
      updateSequencer: '&',
    },
    controller: 'SequencerController',
    templateUrl: 'templates/sequencer.html',
  };
});


app.directive('trackEditor', function() {
  return {
    restrict: 'A',
    scope: { },
    controller: 'TrackEditorController',
    controllerAs: 'ctrl',
    templateUrl: 'templates/track_editor.html',
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
           var rowIndex = parseInt(element[0].id.split("-")[3], 10);
           var noteIndex = parseInt(element[0].id.split("-")[5], 10);
           var nextNoteId = 'pattern-' + patternID + '-row-' + (rowIndex + config.rowIndexDelta) + '-note-' + (noteIndex + config.noteIndexDelta);

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
             changeCurrentlySelectedNote(element, { rowIndexDelta: 0, noteIndexDelta: -1 });
           }
         }
         else if (e.keyCode === 39) {  // Right arrow key
           if (element[0].selectionEnd === currentValue.length && !(element.hasClass('lastNote'))) {
             changeCurrentlySelectedNote(element, { rowIndexDelta: 0, noteIndexDelta: 1 });
           }
         }
         else if (e.keyCode === 38) {  // Up arrow key
           if (!(element.hasClass('firstRow'))) {
             changeCurrentlySelectedNote(element, { rowIndexDelta: -1, noteIndexDelta: 0 });
           }
         }
         else if (e.keyCode === 40) {  // Down arrow key
           if (!(element.hasClass('lastRow'))) {
             changeCurrentlySelectedNote(element, { rowIndexDelta: 1, noteIndexDelta: 0 });
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
