"use strict";

import { AudioContextBuilder } from "./audio_context_builder";
import { AudioSource } from "./audio_source";
import { WaveWriter } from "./wave_writer";

export function OfflineTransport(tracks, songPlayer, tempo, amplitude, completeCallback) {
  var NUM_CHANNELS = 1;
  var SAMPLE_RATE = 44100;
  var SIXTEENTHS_PER_MINUTE = tempo * 4;
  var STEP_INTERVAL = 60.0 / SIXTEENTHS_PER_MINUTE;

  var buildOfflineAudioContext = function() {
    var minimumPlaybackTime = songPlayer.stepCount() * STEP_INTERVAL;
    var actualPlaybackTime = songPlayer.playbackTime(STEP_INTERVAL);
    var playbackTime = Math.max(minimumPlaybackTime, actualPlaybackTime);

    var sampleCount = SAMPLE_RATE * playbackTime;
    var offlineAudioContext = AudioContextBuilder.buildOfflineAudioContext(NUM_CHANNELS, sampleCount, SAMPLE_RATE);

    offlineAudioContext.oncomplete = function(e) {
      var waveWriter = WaveWriter();

      var sampleData = e.renderedBuffer.getChannelData(0);
      var outputView = waveWriter.write(sampleData);
      var blob = new Blob([outputView], { type: "audio/wav" });

      completeCallback(blob);
    };

    return offlineAudioContext;
  };

  var tick = function() {
    var scheduleAheadTime = songPlayer.stepCount() * STEP_INTERVAL;
    var startTime = offlineAudioContext.currentTime;
    var finalTime = startTime + scheduleAheadTime;

    songPlayer.reset(startTime);
    songPlayer.tick(offlineAudioContext, offlineAudioSource, finalTime, STEP_INTERVAL, false);

    offlineAudioContext.startRendering();
  };

  var i;
  var offlineAudioContext = buildOfflineAudioContext();
  var offlineAudioSource = AudioSource(offlineAudioContext);
  var track;
  offlineAudioSource.setMasterAmplitude(amplitude);

  for (i = 0; i < tracks.length; i++) {
    track = tracks[i];
    offlineAudioSource.addChannel(track.id, track.volume, track.isMuted, track.reverbBuffer, track.reverbWetPercentage, track.delayTime, track.delayFeedback);
  }


  return {
    tick: tick,
  };
};
