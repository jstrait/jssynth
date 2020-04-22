"use strict";

export function InstrumentNote(note, channelID) {
  return {
    note: function() { return note; },
    channelID: function() { return channelID; },
  };
};
