"use strict";

export function Transport(mixer, songPlayer, notePlayer, stopCallback) {
  var SCHEDULE_AHEAD_TIME = 0.2;  // in seconds
  var TICK_INTERVAL = 50;         // in milliseconds
  var LOOP = true;

  var currentStep = 0;
  var scheduledSteps;
  var stepInterval;
  var timeoutId;
  var isPlaying = false;

  var tick = function() {
    var currentTime = mixer.audioContext().currentTime;
    var finalTime = currentTime + SCHEDULE_AHEAD_TIME;
    var i;

    var newScheduledSteps = songPlayer.tick(mixer, notePlayer, finalTime, stepInterval, LOOP);
    scheduledSteps = scheduledSteps.concat(newScheduledSteps);

    i = 0;
    while (i < scheduledSteps.length && scheduledSteps[i].time <= currentTime) {
      currentStep = scheduledSteps[i].step;
      scheduledSteps.splice(0, 1);

      i++;
    }

    if (songPlayer.isFinishedPlaying() === true) {
      stop();
      window.setTimeout(stopCallback, stepInterval * 1000);
    }
  };

  var start = function() {
    var audioContext = mixer.audioContext();

    scheduledSteps = [];
    songPlayer.reset(audioContext.currentTime, currentStep);

    // Fix for Safari 9.1 (and maybe 9?)
    // For some reason, the AudioContext on a new page load is in suspended state
    // in this version of Safari, which means that no audio playback will occur.
    // If you re-load the same page, it will no longer be in suspended state
    // and audio playback will occur.
    //
    // This fixes this by detecting if the AudioContext is in suspended state,
    // and manually forcing it to resume.
    if (audioContext.state === "suspended") {
      if (audioContext.resume) {
        audioContext.resume();
      }
    }

    mixer.setClipDetectionEnabled(true);

    tick();
    timeoutId = window.setInterval(tick, TICK_INTERVAL);
    isPlaying = true;
  };

  var stop = function() {
    window.clearInterval(timeoutId);
    mixer.setClipDetectionEnabled(false);
    isPlaying = false;
  };

  var setTempo = function(newTempo) {
    var sixteenthsPerMinute = newTempo * 4;
    stepInterval = 60.0 / sixteenthsPerMinute;
  };

  var setCurrentStep = function(newCurrentStep) {
    if (currentStep === newCurrentStep) {
      return;
    }

    currentStep = newCurrentStep;

    if (isPlaying === true) {
      songPlayer.reset(mixer.audioContext().currentTime, currentStep);
      scheduledSteps = [];
    }
  };

  var toggle = function() {
    if (isPlaying === true) {
      stop();
    }
    else {
      start();
    }
  };


  setTempo(100);


  return {
    setTempo: setTempo,
    toggle: toggle,
    currentStep: function() { return currentStep; },
    setCurrentStep: setCurrentStep,
  };
};
