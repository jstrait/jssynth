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
