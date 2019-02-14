"use strict";

export function SongPlayer() {
  var notes = [];

  var stepIndex;
  var isFinishedPlaying;
  var currentTime;

  var reset = function(newCurrentTime) {
    stepIndex = 0;
    isFinishedPlaying = false;
    currentTime = newCurrentTime;
  };

  var replaceNotes = function(newNotes) {
    notes = newNotes;
  };

  var tick = function(audioSource, notePlayer, endTime, stepDuration, loop) {
    var scheduledSteps = [];
    var noteTimeDuration;
    var incomingNotes;

    while (currentTime < endTime) {
      incomingNotes = notes[stepIndex];
      incomingNotes.forEach(function(note) {
        noteTimeDuration = stepDuration * note.note().stepCount();
        notePlayer.scheduleNote(note.channelID(),
                                audioSource.audioContext(),
                                audioSource.destination(note.channelID()),
                                note.note(),
                                note.amplitude(),
                                currentTime,
                                currentTime + noteTimeDuration);
      });

      scheduledSteps.push({ step: stepIndex, time: currentTime });

      stepIndex += 1;
      if (stepIndex >= notes.length) {
        if (loop) {
          stepIndex = 0;
        }
        else {
          isFinishedPlaying = true;
          return;
        }
      }

      currentTime += stepDuration;
    }

    return scheduledSteps;
  };

  var playbackTime = function(notePlayer, stepDuration) {
    var note, noteEndTime;
    var i, j;

    var noteStartTime = 0.0;
    var maxNoteEndTime = 0.0;

    for (i = 0; i < notes.length; i++) {
      for(j = 0; j < notes[i].length; j++) {
        note = notes[i][j];
        noteEndTime = noteStartTime + notePlayer.noteDuration(note.channelID(), note.note().stepCount(), stepDuration);
        if (noteEndTime > maxNoteEndTime) {
          maxNoteEndTime = noteEndTime;
        }
      }

      noteStartTime += stepDuration;
    }

    return maxNoteEndTime;
  };


  reset();


  return {
    reset: reset,
    stepCount: function() { return notes.length; },
    isFinishedPlaying: function() { return isFinishedPlaying; },
    replaceNotes: replaceNotes,
    tick: tick,
    playbackTime: playbackTime,
  };
};
