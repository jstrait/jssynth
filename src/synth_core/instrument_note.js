"use strict";

export function InstrumentNote(note, instrument, amplitude, channelID) {
  return {
    note: function() { return note; },
    instrument: function() { return instrument; },
    amplitude: function() { return amplitude; },
    channelID: function() { return channelID; },
  };
};
