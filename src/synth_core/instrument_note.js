"use strict";

export function InstrumentNote(note, amplitude, channelID) {
  return {
    note: function() { return note; },
    amplitude: function() { return amplitude; },
    channelID: function() { return channelID; },
  };
};
