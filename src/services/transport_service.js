"use strict";

app.factory('TransportService', ['$rootScope', function($rootScope) {
  var playing = false;
  var amplitude = 0.25;
  var tempo = 100;
  var loop = true;

  var stopCallback = function() {
    playing = false;
  };

  var songPlayer = new JSSynth.SongPlayer([[new JSSynth.Pattern()]]);
  var offlineSongPlayer = new JSSynth.SongPlayer([[new JSSynth.Pattern()]]);
  var transport = new JSSynth.Transport(songPlayer, stopCallback);

  if (!transport) {
    alert("Your browser doesn't appear to support WebAudio, and so won't be able to use the JS-120. Try a recent version of Chrome, Safari, or Firefox.");
    return;
  }

  var transportService = {};

  transportService.toggle = function() {
    transport.toggle();
    playing = !playing;

    if (playing) {
      $rootScope.$broadcast('TransportService.start');
    }
    else {
      $rootScope.$broadcast('TransportService.stop');
    }
  };

  transportService.setTempo = function(newTempo) {
    tempo = newTempo;
    transport.setTempo(newTempo);
  };

  transportService.setAmplitude = function(newAmplitude) {
    amplitude = newAmplitude;
    transport.setAmplitude(newAmplitude);
  };

  transportService.setPatterns = function(newPatterns) {
    songPlayer.replacePatterns(newPatterns);
    offlineSongPlayer.replacePatterns(newPatterns);
  };

  transportService.loop = function(newLoop) {
    loop = newLoop;
  };

  transportService.currentStep = function() {
    return (playing) ? transport.currentStep() : null;
  };

  transportService.export = function(exportCompleteCallback) {
    var offlineTransport = new JSSynth.OfflineTransport(offlineSongPlayer, tempo, amplitude, exportCompleteCallback);
    offlineTransport.tick();
  };

  return transportService;
}]);
