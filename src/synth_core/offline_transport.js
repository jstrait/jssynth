"use strict";

import { AudioContextBuilder } from "./audio_context_builder";
import { Mixer } from "./mixer";
import { NotePlayer } from "./note_player";
import { WaveWriter } from "./wave_writer";

export function OfflineTransport(tracks, songPlayer, notePlayer, tempo, masterAmplitude, sampleRate, completeCallback) {
  const NUM_CHANNELS = 1;
  const SIXTEENTHS_PER_MINUTE = tempo * 4;
  const STEP_INTERVAL_IN_SECONDS = 60.0 / SIXTEENTHS_PER_MINUTE;
  const FADE_OUT_TIME_IN_SECONDS = 1.5;

  var calculatePlaybackTimeInSeconds = function() {
    var minimumPlaybackTime = songPlayer.stepCount() * STEP_INTERVAL_IN_SECONDS;
    var actualPlaybackTime = songPlayer.playbackTime(notePlayer, STEP_INTERVAL_IN_SECONDS);

    return Math.max(minimumPlaybackTime, actualPlaybackTime) + FADE_OUT_TIME_IN_SECONDS;
  };

  var buildOfflineAudioContext = function(playbackTimeInSeconds) {
    var sampleCount = sampleRate * playbackTimeInSeconds;
    var offlineAudioContext = AudioContextBuilder.buildOfflineAudioContext(NUM_CHANNELS, sampleCount, sampleRate);

    offlineAudioContext.oncomplete = function(e) {
      var waveWriter = WaveWriter(sampleRate);

      var sampleData = e.renderedBuffer.getChannelData(0);
      var outputView = waveWriter.write(sampleData);
      var blob = new Blob([outputView], { type: "audio/wav" });

      completeCallback(blob);
    };

    return offlineAudioContext;
  };

  var buildOfflineMixer = function(offlineAudioContext) {
    var i;
    var track;
    var offlineMixer = Mixer(offlineAudioContext);

    offlineMixer.setMasterAmplitude(masterAmplitude);

    for (i = 0; i < tracks.length; i++) {
      track = tracks[i];
      offlineMixer.addChannel(track.id, track.volume, track.isMuted, track.reverbBuffer, track.reverbWetPercentage, track.delayTime, track.delayFeedback);
    }

    offlineMixer.masterGainNode().gain.setValueAtTime(masterAmplitude, playbackTimeInSeconds - FADE_OUT_TIME_IN_SECONDS);
    offlineMixer.masterGainNode().gain.linearRampToValueAtTime(0.0, playbackTimeInSeconds);

    return offlineMixer;
  };

  var tick = function() {
    var scheduleAheadTimeInSeconds = songPlayer.stepCount() * STEP_INTERVAL_IN_SECONDS;
    var startTimeInSeconds = offlineAudioContext.currentTime;
    var finalTimeInSeconds = startTimeInSeconds + scheduleAheadTimeInSeconds;

    songPlayer.reset(startTimeInSeconds, 0);
    songPlayer.tick(offlineMixer, notePlayer, finalTimeInSeconds, STEP_INTERVAL_IN_SECONDS, false);

    offlineAudioContext.startRendering();
  };

  var playbackTimeInSeconds = calculatePlaybackTimeInSeconds();
  var offlineAudioContext = buildOfflineAudioContext(playbackTimeInSeconds);
  var offlineMixer = buildOfflineMixer(offlineAudioContext);


  return {
    tick: tick,
  };
};
