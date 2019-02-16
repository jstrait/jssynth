"use strict";

export var AudioContextBuilder = (function() {
  var buildAudioContext = function() {
    var audioContext;

    if (window.AudioContext) {
      // Why create an AudioContext, immediately close it, and then recreate
      // another one? Good question.
      //
      // The reason is that in iOS, there is a bug in which an AudioContext
      // can be created with a sample rate of 48,000Hz, which for reasons
      // causes audio playback to be distorted. If you re-load the page,
      // the sample rate will be set to 44,100Hz instead, and playback
      // will sound normal.
      //
      // Creating an AudioContext, closing it, and recreating another
      // one works around this issue, I _think_ by basically simulating
      // the page re-load behavior, causing the sample rate of the 2nd
      // AudioContext to be 44,100Hz.
      //
      // This fix was figured out by searching Google, which returned
      // this GitHub issue: https://github.com/photonstorm/phaser/issues/2373
      audioContext = new AudioContext();
      if (audioContext.close) {
        audioContext.close();
        audioContext = new AudioContext();
      }
    }

    return audioContext;
  };

  var buildOfflineAudioContext = function(channelCount, sampleCount, sampleRate) {
    var offlineAudioContext;

    if (window.OfflineAudioContext) {
      offlineAudioContext = new OfflineAudioContext(channelCount, sampleCount, sampleRate);
    }
    else if (window.webkitOfflineAudioContext) {
      offlineAudioContext = new webkitOfflineAudioContext(channelCount, sampleCount, sampleRate);
    }

    return offlineAudioContext;
  };

  return {
    buildAudioContext: buildAudioContext,
    buildOfflineAudioContext: buildOfflineAudioContext,
  };
})();
