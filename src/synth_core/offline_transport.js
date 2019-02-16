"use strict";

import { AudioContextBuilder } from "./audio_context_builder";
import { AudioSource } from "./audio_source";
import { NotePlayer } from "./note_player";
import { WaveWriter } from "./wave_writer";

export function OfflineTransport(tracks, songPlayer, notePlayer, tempo, masterAmplitude, completeCallback) {
  var NUM_CHANNELS = 1;
  var SAMPLE_RATE = 44100;
  var SIXTEENTHS_PER_MINUTE = tempo * 4;
  var STEP_INTERVAL = 60.0 / SIXTEENTHS_PER_MINUTE;
  var FADE_OUT_TIME_IN_SECONDS = 1.5;

  var calculatePlaybackTime = function() {
    var minimumPlaybackTime = songPlayer.stepCount() * STEP_INTERVAL;
    var actualPlaybackTime = songPlayer.playbackTime(notePlayer, STEP_INTERVAL);

    return Math.max(minimumPlaybackTime, actualPlaybackTime) + FADE_OUT_TIME_IN_SECONDS;
  };

  var buildOfflineAudioContext = function(playbackTime) {
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
    songPlayer.tick(offlineAudioSource, notePlayer, finalTime, STEP_INTERVAL, false);

    offlineAudioContext.startRendering();
  };

  var i;
  var playbackTime = calculatePlaybackTime();
  var offlineAudioContext = buildOfflineAudioContext(playbackTime);
  var offlineAudioSource = AudioSource(offlineAudioContext);
  var track;
  offlineAudioSource.setMasterAmplitude(masterAmplitude);

  for (i = 0; i < tracks.length; i++) {
    track = tracks[i];
    offlineAudioSource.addChannel(track.id, track.volume, track.isMuted, track.reverbBuffer, track.reverbWetPercentage, track.delayTime, track.delayFeedback);
  }

  offlineAudioSource.masterGainNode().gain.setValueAtTime(masterAmplitude, playbackTime - FADE_OUT_TIME_IN_SECONDS);
  offlineAudioSource.masterGainNode().gain.linearRampToValueAtTime(0.0, playbackTime);


  return {
    tick: tick,
  };
};
