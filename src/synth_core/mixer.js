"use strict";

function MixerChannel(audioContext, audioDestination, initialAmplitude, initialMultiplier, initialIsMuted, reverbBuffer, initialReverbWetPercentage, delayTime, delayFeedback) {
  var HALF_PI = Math.PI / 2;

  var amplitude = initialAmplitude;
  var multiplier = initialMultiplier;
  var isMuted = initialIsMuted;

  var inputNode = audioContext.createGain();
  var reverb = audioContext.createConvolver();
  var reverbDryGain = audioContext.createGain();
  var reverbWetGain = audioContext.createGain();
  var delay = audioContext.createDelay();
  var delayGain = audioContext.createGain();
  var feedback = audioContext.createGain();
  var gain = audioContext.createGain();

  var setAmplitude = function(newAmplitude) {
    amplitude = newAmplitude;
    syncGain();
  };

  var setMultiplier = function(newMultiplier) {
    multiplier = newMultiplier;
    syncGain();
  };

  var setIsMuted = function(newIsMuted) {
    isMuted = newIsMuted;
    syncGain();
  };

  var setDelay = function(delayTime, delayFeedback) {
    delay.delayTime.value = delayTime;
    feedback.gain.value = delayFeedback;

    if (delayTime === 0.0) {
      // Turn off the delay, to avoid doubling the base sound,
      // and causing the track to be artificially loud.
      delayGain.gain.value = 0.0;
    }
    else {
      delayGain.gain.value = 1.0;
    }
  };

  var setReverb = function(newReverbWetPercentage) {
    // Equal power crossfade, as described at https://www.html5rocks.com/en/tutorials/webaudio/intro/
    // (source code https://www.html5rocks.com/en/tutorials/webaudio/intro/js/crossfade-sample.js).
    reverbDryGain.gain.value = Math.cos(newReverbWetPercentage * HALF_PI);
    reverbWetGain.gain.value = Math.cos((1.0 - newReverbWetPercentage) * HALF_PI);
  };

  var input = function() {
    return inputNode;
  };

  var destroy = function() {
    gain.disconnect(audioDestination);
  };

  var syncGain = function() {
    if (isMuted === true) {
      gain.gain.value = 0.0;
    }
    else {
      gain.gain.value = amplitude * multiplier;
    }
  };

  setAmplitude(initialAmplitude);

  inputNode.gain.value = 1.0;
  reverb.buffer = reverbBuffer;
  setReverb(initialReverbWetPercentage);
  setDelay(delayTime, delayFeedback);

  inputNode.connect(reverbDryGain);
  inputNode.connect(reverb);
  inputNode.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(delayGain);
  delayGain.connect(reverbDryGain);
  delayGain.connect(reverb);
  reverb.connect(reverbWetGain);
  reverbDryGain.connect(gain);
  reverbWetGain.connect(gain);
  gain.connect(audioDestination);

  return {
    setAmplitude: setAmplitude,
    setMultiplier: setMultiplier,
    setIsMuted: setIsMuted,
    setDelay: setDelay,
    setReverb: setReverb,
    input: input,
    destroy: destroy,
  };
};

function MixerChannelCollection(audioContext, audioDestination) {
  var channels = {};
  var count = 0;

  var channel = function(id) {
    return channels[id];
  };

  var add = function(id, amplitude, isMuted, reverbBuffer, reverbWetPercentage, delayTime, delayFeedback) {
    channels[id] = MixerChannel(audioContext, audioDestination, amplitude, 1.0, isMuted, reverbBuffer, reverbWetPercentage, delayTime, delayFeedback);
    count += 1;

    setMultipliers();
  };

  var remove = function(id) {
    channels[id].destroy();
    delete channels[id];
    count -= 1;

    setMultipliers();
  };

  var setMultipliers = function() {
    var id;
    var newMultiplier = 1 / Math.max(8, count);

    for (id in channels) {
      channels[id].setMultiplier(newMultiplier);
    }
  };

  return {
    channel: channel,
    add: add,
    remove: remove,
    count: function() { return count; },
  };
};

function Mixer(audioContext) {
  var clipDetector;
  var masterGain;
  var channelCollection;

  var detectClipping = function(e) {
    var i;
    var samples = e.inputBuffer.getChannelData(0);
    var numSamples = samples.length;

    for (i = 0; i < numSamples; i++) {
      if (Math.abs(samples[i]) > 1.0) {
        console.log("Clipping! " + samples[i]);
        break;
      }
    }
  };

  var addChannel = function(id, amplitude, isMuted, reverbBuffer, reverbWetPercentage, delayTime, delayFeedback) {
    channelCollection.add(id, amplitude, isMuted, reverbBuffer, reverbWetPercentage, delayTime, delayFeedback);
  };

  var removeChannel = function(id) {
    channelCollection.remove(id);
  };

  var setChannelAmplitude = function(id, newAmplitude) {
    var channel = channelCollection.channel(id);
    channel.setAmplitude(newAmplitude);
  };

  var setChannelIsMuted = function(id, newIsMuted) {
    var channel = channelCollection.channel(id);
    channel.setIsMuted(newIsMuted);
  };

  var setChannelDelay = function(channelID, delayTime, delayFeedback) {
    var channel = channelCollection.channel(channelID);
    channel.setDelay(delayTime, delayFeedback);
  };

  var setChannelReverb = function(channelID, reverbWetPercentage) {
    var channel = channelCollection.channel(channelID);
    channel.setReverb(reverbWetPercentage);
  };

  var setMasterAmplitude = function(newAmplitude) {
    masterGain.gain.value = newAmplitude;
  };

  var destination = function(id) {
    var channel = channelCollection.channel(id);

    if (channel === undefined) {
      return undefined;
    }

    return channel.input();
  };

  var setClipDetectionEnabled = function(isEnabled) {
    // This following if/else is set up to handle differences between Chrome, Safari
    // and Firefox.
    //
    // Chrome 80: For clip detection to work, the master gain has to be connected to
    //   clip detector, and the clip detector must be connected to audio context
    //   destination. However, `detectClipping()` will continuously fire if the clip
    //   detector is connected to audio context destination outside of song playback.
    //
    // Safari 13: Same as Chrome, but master gain must be re-connected to the audio
    //   context destination after the clip detector is disconnected, or there will
    //   be no audio.
    //
    // Firefox 74: Only the master gain needs to be connected to clip detector for
    //   clip detection to work, but `detectClipping()` will fire continuously if it
    //   is connected outside of song playback.
    if (isEnabled === true) {
      masterGain.connect(clipDetector);
      clipDetector.connect(audioContext.destination);
    }
    else {
      masterGain.disconnect();
      masterGain.connect(audioContext.destination);
      clipDetector.disconnect(audioContext.destination);
    }
  };


  if (audioContext !== undefined) {
    clipDetector = audioContext.createScriptProcessor(512);
    clipDetector.onaudioprocess = detectClipping;

    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);

    channelCollection = MixerChannelCollection(audioContext, masterGain);
  }

  return {
    audioContext: function() { return audioContext; },
    addChannel: addChannel,
    removeChannel: removeChannel,
    setChannelAmplitude: setChannelAmplitude,
    setChannelIsMuted: setChannelIsMuted,
    setChannelDelay: setChannelDelay,
    setChannelReverb: setChannelReverb,
    masterGainNode: function() { return masterGain; },
    setMasterAmplitude: setMasterAmplitude,
    destination: destination,
    setClipDetectionEnabled: setClipDetectionEnabled,
  };
};

export { Mixer };
