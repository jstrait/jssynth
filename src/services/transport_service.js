"use strict";

app.factory('TransportService', ['$rootScope', function($rootScope) {
  var playing = false;
  var amplitude = 0.25;
  var tempo = 100;
  var loop = true;

  var stopCallback = function() {
    playing = false;
  };

  var songPlayer = new JSSynth.SongPlayer();
  var offlineSongPlayer = new JSSynth.SongPlayer();
  var transport = new JSSynth.Transport(songPlayer, stopCallback);
  var enabled = (transport !== false);

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

  transportService.setNotes = function(newNotes) {
    songPlayer.replaceNotes(newNotes);
    offlineSongPlayer.replaceNotes(newNotes);
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

  transportService.isEnabled = function() {
    return enabled;
  };

  return transportService;
}]);
