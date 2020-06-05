"use strict";

export function NotePlayer() {
  var channels = {};

  var scheduleNote = function(channelID, audioContext, audioDestination, note, gateOnTime, gateOffTime) {
    channels[channelID].instrument.scheduleNote(audioContext, audioDestination, note, gateOnTime, gateOffTime);
  };

  var playImmediateNote = function(channelID, audioContext, audioDestination, note) {
    return channels[channelID].instrument.gateOn(audioContext, audioDestination, note, audioContext.currentTime, Number.POSITIVE_INFINITY);
  };

  var stopNote = function(channelID, audioContext, noteContext) {
    channels[channelID].instrument.gateOff(noteContext, audioContext.currentTime, true);
  };

  var addChannel = function(channelID, instrument) {
    channels[channelID] = {instrument: instrument};
  };

  var removeChannel = function(channelID) {
    delete channels[channelID];
  };

  var noteDuration = function(channelID, stepCount, stepDuration) {
    var noteTimeDuration = stepDuration * stepCount;
    return noteTimeDuration + channels[channelID].instrument.config().envelope.releaseTime;
  };


  return {
    scheduleNote: scheduleNote,
    playImmediateNote: playImmediateNote,
    stopNote: stopNote,
    addChannel: addChannel,
    removeChannel: removeChannel,
    noteDuration: noteDuration,
  };
};
