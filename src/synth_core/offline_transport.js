"use strict";

import { AudioContextBuilder } from "./audio_context_builder";
import { AudioSource } from "./audio_source";
import { NotePlayer } from "./note_player";
import { WaveWriter } from "./wave_writer";

export function OfflineTransport(tracks, songPlayer, notePlayer, tempo, masterAmplitude, completeCallback) {
  var NUM_CHANNELS = 1;
  var SAMPLE_RATE = 44100;
  var SIXTEENTHS_PER_MINUTE = tempo * 4;
  var STEP_INTERVAL_IN_SECONDS = 60.0 / SIXTEENTHS_PER_MINUTE;
  var FADE_OUT_TIME_IN_SECONDS = 1.5;

  var calculatePlaybackTimeInSeconds = function() {
    var minimumPlaybackTime = songPlayer.stepCount() * STEP_INTERVAL_IN_SECONDS;
    var actualPlaybackTime = songPlayer.playbackTime(notePlayer, STEP_INTERVAL_IN_SECONDS);

    return Math.max(minimumPlaybackTime, actualPlaybackTime) + FADE_OUT_TIME_IN_SECONDS;
  };

  var buildOfflineAudioContext = function(playbackTimeInSeconds) {
    var sampleCount = SAMPLE_RATE * playbackTimeInSeconds;
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
    var scheduleAheadTimeInSeconds = songPlayer.stepCount() * STEP_INTERVAL_IN_SECONDS;
    var startTimeInSeconds = offlineAudioContext.currentTime;
    var finalTimeInSeconds = startTimeInSeconds + scheduleAheadTimeInSeconds;

    songPlayer.reset(startTimeInSeconds);
    songPlayer.tick(offlineAudioSource, notePlayer, finalTimeInSeconds, STEP_INTERVAL_IN_SECONDS, false);

    offlineAudioContext.startRendering();
  };

  var i;
  var playbackTimeInSeconds = calculatePlaybackTimeInSeconds();
  var offlineAudioContext = buildOfflineAudioContext(playbackTimeInSeconds);
  var offlineAudioSource = AudioSource(offlineAudioContext);
  var track;
  offlineAudioSource.setMasterAmplitude(masterAmplitude);

  for (i = 0; i < tracks.length; i++) {
    track = tracks[i];
    offlineAudioSource.addChannel(track.id, track.volume, track.isMuted, track.reverbBuffer, track.reverbWetPercentage, track.delayTime, track.delayFeedback);
  }

  offlineAudioSource.masterGainNode().gain.setValueAtTime(masterAmplitude, playbackTimeInSeconds - FADE_OUT_TIME_IN_SECONDS);
  offlineAudioSource.masterGainNode().gain.linearRampToValueAtTime(0.0, playbackTimeInSeconds);


  return {
    tick: tick,
  };
};
