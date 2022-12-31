"use strict";

// Adapted from https://webaudiodemos.appspot.com/slides/webmidi.html
export const MidiController = function(onStateChange, onMessage, onError) {
  const NOTE_ON_COMMAND = 9;
  const NOTE_OFF_COMMAND = 8;
  const CONTROLLER_COMMAND = 11;

  const onMIDIInit = function(midiAccess) {
    let input;
    inputs = [];

    for (input of midiAccess.inputs.values()) {
      inputs.push(input);
      input.onmidimessage = onMidiMessage;
    }

    midiAccess.onstatechange = function(e) {
      onMIDIInit(e.currentTarget);
      onStateChange({port: e.port.name, connection: e.port.connection, state: e.port.state});
    };
  };

  const onMIDISystemError = function(error) {
    onError(error);
  };

  const onMidiMessage = function(e) {
    let command = e.data[0] >> 4;
    let channel = e.data[0] & 0xf;
    let noteNumber = e.data[1];
    let velocity = (e.data.length > 2) ? e.data[2] : 0;

    // MIDI noteon with velocity=0 is the same as noteoff
    if (command === NOTE_OFF_COMMAND || ((command === NOTE_ON_COMMAND) && (velocity === 0)) ) {
      onMessage("noteoff", { noteNumber: noteNumber });
    }
    else if (command === NOTE_ON_COMMAND) {
      onMessage("noteon", { noteNumber: noteNumber, velocity: velocity });
    }
    else if (command === CONTROLLER_COMMAND) {
      onMessage("controller", { noteNumber: noteNumber, velocity: velocity });
    }
    else {
      // probably sysex!
    }
  };


  let inputs = [];
  let isEnabled = false;

  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDIInit, onMIDISystemError);
    isEnabled = true;
  }
  else {
    isEnabled = false;
  }

  return {
    isEnabled: function() { return isEnabled; },
    inputs: function() { return inputs; },
  };
};
