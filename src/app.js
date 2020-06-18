"use strict";

import React from "react";
import ReactDOM from "react-dom";

import * as SynthCore from "./synth_core";
import * as DefaultSong from "./default_song";
import { BufferGenerator } from "./buffer_generator";
import { IDGenerator } from "./id_generator";
import { MidiController } from "./midi_controller";
import { Serializer } from "./serializer";

import { DownloadButton } from "./components/download_button";
import { Keyboard } from "./components/keyboard";
import { PatternEditor } from "./components/pattern_editor";
import { SampleInstrumentEditor } from "./components/instrument_editor";
import { Sequencer } from "./components/sequencer";
import { SynthInstrumentEditor } from "./components/instrument_editor";
import { Transport } from "./components/transport";


const VIEW_UNKNOWN = -1;
const VIEW_LOADING = 1;
const VIEW_SEQUENCER = 2;
const VIEW_INSTRUMENT_SYNTH = 3;
const VIEW_INSTRUMENT_SAMPLER = 4;
const VIEW_PATTERN_EDITOR = 5;

const STEPS_PER_MEASURE = 16;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoaded: false,
      loadingStatusMessage: "Loading...",
      measureCount: 1,
      trackBeingEditedID: undefined,
      patternBeingEditedID: undefined,
      selectedPatternRowIndex: undefined,
      selectedPatternStepIndex: undefined,
      isSequencerExpanded: true,
      sequencerScrollLeft: 0,
      copiedPattern: undefined,
      isDownloadEnabled: (typeof document.createElement("a").download !== "undefined"),
      isKeyboardActive: false,
      activeKeyboardNotes: [],
      masterAmplitude: 0.75,
      transport: {
        isPlaying: false,
        tempo: 100,
        step: 0,
      },
      instruments: [],
      patterns: [],
      tracks: [],
      isMidiEnabled: false,
      midiInputNames: ["None"],
    };

    this.itemByID = this.itemByID.bind(this);
    this.indexByID = this.indexByID.bind(this);
    this.trackByID = this.trackByID.bind(this);
    this.instrumentByID = this.instrumentByID.bind(this);
    this.patternByID = this.patternByID.bind(this);
    this.patternIndexByID = this.patternIndexByID.bind(this);
    this.patternsByTrackID = this.patternsByTrackID.bind(this);

    // Transport
    this.rewindTransport = this.rewindTransport.bind(this);
    this.togglePlaying = this.togglePlaying.bind(this);
    this.updateMasterAmplitude = this.updateMasterAmplitude.bind(this);
    this.updateTempo = this.updateTempo.bind(this);
    this.exportToWav = this.exportToWav.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);

    // Sequencer
    this.setMeasureCount = this.setMeasureCount.bind(this);
    this.setIsSequencerExpanded = this.setIsSequencerExpanded.bind(this);
    this.setSequencerScrollLeft = this.setSequencerScrollLeft.bind(this);
    this.setCurrentStep = this.setCurrentStep.bind(this);
    this.setTrackVolume = this.setTrackVolume.bind(this);
    this.toggleTrackMute = this.toggleTrackMute.bind(this);
    this.addGenericTrack = this.addGenericTrack.bind(this);
    this.addSynthTrack = this.addSynthTrack.bind(this);
    this.addSamplerTrack = this.addSamplerTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.setTrackBeingEdited = this.setTrackBeingEdited.bind(this);
    this.setPatternBeingEdited = this.setPatternBeingEdited.bind(this);
    this.setCopiedPattern = this.setCopiedPattern.bind(this);
    this.movePattern = this.movePattern.bind(this);
    this.resizePattern = this.resizePattern.bind(this);
    this.changePatternPlaybackStepCount = this.changePatternPlaybackStepCount.bind(this);
    this.isSpaceForPatternInTrack = this.isSpaceForPatternInTrack.bind(this);
    this.addPattern = this.addPattern.bind(this);
    this.duplicatePattern = this.duplicatePattern.bind(this);
    this.removePattern = this.removePattern.bind(this);
    this.generatePatternImage = this.generatePatternImage.bind(this);

    // Instrument Editor
    this.setTrackName = this.setTrackName.bind(this);
    this.updateInstrument = this.updateInstrument.bind(this);
    this.setBufferFromFile = this.setBufferFromFile.bind(this);
    this.closeInstrumentEditor = this.closeInstrumentEditor.bind(this);

    // Pattern Editor
    this.setPatternName = this.setPatternName.bind(this);
    this.addPatternRow = this.addPatternRow.bind(this);
    this.removePatternRow = this.removePatternRow.bind(this);
    this.setSelectedPatternStepIndex = this.setSelectedPatternStepIndex.bind(this);
    this.setNoteValue = this.setNoteValue.bind(this);
    this.closePatternEditor = this.closePatternEditor.bind(this);

    // Keyboard
    this.activateKeyboard = this.activateKeyboard.bind(this);
    this.deactivateKeyboard = this.deactivateKeyboard.bind(this);
    this.setKeyboardNotes = this.setKeyboardNotes.bind(this);

    // MIDI
    this.onMIDIStateChange = this.onMIDIStateChange.bind(this);
    this.onMIDIMessage = this.onMIDIMessage.bind(this);
    this.onMIDIError = this.onMIDIError.bind(this);

    this.initialize();
  };

  initialize() {
    const audioContext = SynthCore.AudioContextBuilder.buildAudioContext();
    let bufferConfigs;
    let pattern;

    if (audioContext === undefined) {
      this.state.loadingStatusMessage = <span>Your browser doesn&rsquo;t appear to support the WebAudio API needed by the JS-140. Try a recent version of Chrome, Safari, or Firefox.</span>;
      return;
    }

    this.idGenerator = new IDGenerator(100);

    this.mixer = SynthCore.Mixer(audioContext);
    this.timeoutID = undefined;
    this.songPlayer = SynthCore.SongPlayer();
    this.offlineSongPlayer = SynthCore.SongPlayer();
    this.notePlayer = SynthCore.NotePlayer();

    this.transport = SynthCore.Transport(this.mixer, this.songPlayer, this.notePlayer);
    this.mixer.setMasterAmplitude(this.state.masterAmplitude);
    this.activeNoteContexts = [];

    this.midiController = MidiController(this.onMIDIStateChange, this.onMIDIMessage);

    this.bufferCollection = SynthCore.BufferCollection(audioContext);
    this.bufferCollection.addBuffer("white-noise", BufferGenerator.generateWhiteNoise(audioContext));
    this.bufferCollection.addBuffer("pink-noise", BufferGenerator.generatePinkNoise(audioContext));
    this.bufferCollection.addBuffer("reverb", BufferGenerator.generateReverbImpulseResponse(audioContext));

    document.addEventListener("visibilitychange", this.onVisibilityChange, false);

    bufferConfigs = [];
    DefaultSong.instruments.map(function(instrument) {
      if (instrument.type === "sample") {
        instrument.bufferID = "Instrument " + instrument.id;
        bufferConfigs.push({label: instrument.bufferID, url: instrument.filename});
      }
    });

    this.canvas = document.createElement("canvas");
    this.canvasContext = this.canvas.getContext("2d");

    for (pattern of DefaultSong.patterns) {
      pattern.image = this.generatePatternImage(pattern);
    }

    this.bufferCollection.addBuffersFromURLs(
      bufferConfigs,
      () => {
        let track;
        let channelID;
        let instrument;

        this.setState((prevState, props) => ({
          isLoaded: true,
          measureCount: DefaultSong.measureCount,
          transport: Object.assign({}, prevState.transport, {
            tempo: DefaultSong.tempo,
          }),
          instruments: DefaultSong.instruments,
          patterns: DefaultSong.patterns,
          tracks: DefaultSong.tracks,
          isMidiEnabled: this.midiController.isEnabled(),
        }));

        this.transport.setTempo(this.state.transport.tempo);

        for (track of this.state.tracks) {
          channelID = track.id;
          instrument = this.instrumentByID(track.instrumentID);
          this.mixer.addChannel(channelID,
                                track.volume,
                                track.isMuted,
                                this.bufferCollection.getBuffer("reverb"),
                                instrument.reverbWetPercentage,
                                instrument.delayTime,
                                instrument.delayFeedback);
        }

        this.syncScoreToSynthCore();
        this.syncInstrumentsToSynthCore();
      },
      () => {
        this.setState({loadingStatusMessage: "An error occurred while starting up"});
      }
    );
  };

  itemByID(array, targetID) {
    let element;

    for (element of array) {
      if (element.id === targetID) {
        return element;
      }
    }

    return undefined;
  };

  indexByID(array, targetID) {
    let i;
    for (i = 0; i < array.length; i++) {
      if (array[i].id === targetID) {
        return i;
      }
    }

    return undefined;
  };

  trackByID(id) {
    return this.itemByID(this.state.tracks, id);
  };

  trackIndexByID(id) {
    return this.indexByID(this.state.tracks, id);
  };

  instrumentByID(id) {
    return this.itemByID(this.state.instruments, id);
  };

  instrumentIndexByID(id) {
    return this.indexByID(this.state.instruments, id);
  };

  patternByID(id) {
    return this.itemByID(this.state.patterns, id);
  };

  patternIndexByID(id) {
    return this.indexByID(this.state.patterns, id);
  };

  patternsByTrackID(trackID) {
    let i;
    let patterns = [];

    for (i = 0; i < this.state.patterns.length; i++) {
      if (this.state.patterns[i].trackID === trackID) {
        patterns.push(this.state.patterns[i]);
      }
    }

    return patterns;
  };

  updateTempo(e) {
    const newTempo = parseInt(e.target.value, 10);

    this.setState((prevState, props) => ({
      transport: Object.assign({}, prevState.transport, {
        tempo: newTempo,
      }),
    }));
    this.transport.setTempo(newTempo);
  };

  updateMasterAmplitude(e) {
    const newAmplitude = parseFloat(e.target.value);

    this.setState({masterAmplitude: newAmplitude});
    this.mixer.setMasterAmplitude(newAmplitude);
  };

  syncCurrentStep() {
    let newStep = this.transport.currentStep();

    this.setState((prevState, props) => ({
      transport: Object.assign({}, prevState.transport, {
        step: newStep,
      }),
    }));
  };

  rewindTransport(e) {
    this.setCurrentStep(0);
  };

  togglePlaying(e) {
    this.transport.toggle();

    if (this.state.transport.isPlaying) {
      clearInterval(this.timeoutID);

      this.setState((prevState, props) => ({
        transport: Object.assign({}, prevState.transport, {
          isPlaying: !(prevState.transport.isPlaying),
        }),
      }));
    }
    else {
      this.timeoutID = setInterval(() => this.syncCurrentStep(), 15);

      this.setState((prevState, props) => ({
        transport: Object.assign({}, prevState.transport, {
          isPlaying: !(prevState.transport.isPlaying),
        }),
      }));
    }
  };

  syncScoreToSynthCore() {
    let serializedScore = Serializer.serializeScore(this.state.measureCount, this.state.tracks, this.state.patterns);
    this.songPlayer.replaceScore(serializedScore);
    this.offlineSongPlayer.replaceScore(serializedScore);
  };

  syncInstrumentsToSynthCore() {
    let channelID;
    let instrumentConfig;
    let serializedInstrument;
    let i;

    for (i = 0; i < this.state.tracks.length; i++) {
      channelID = this.state.tracks[i].id;
      instrumentConfig = this.instrumentByID(this.state.tracks[i].instrumentID);
      serializedInstrument = Serializer.serializeInstrument(instrumentConfig, this.bufferCollection);

      this.notePlayer.addChannel(channelID, serializedInstrument);
    }
  };

  syncChannels() {
    let track, instrument;

    for (track of this.state.tracks) {
      instrument = this.instrumentByID(track.instrumentID);
      this.mixer.setChannelAmplitude(track.id, track.volume);
      this.mixer.setChannelDelay(track.id, instrument.delayTime, instrument.delayFeedback);
      this.mixer.setChannelReverb(track.id, instrument.reverbWetPercentage);
    }
  };

  setMeasureCount(newMeasureCount) {
    let i;
    let newMaxStep;
    let pattern;
    let patternFinalBaseStep;
    let patternFinalPlaybackStep;
    let newCurrentStep = this.transport.currentStep();
    let newPatternList = this.state.patterns.concat([]);

    if (newMeasureCount < this.state.measureCount) {
      newMaxStep = (newMeasureCount * STEPS_PER_MEASURE) - 1;
      if (this.state.transport.step > newMaxStep) {
        newCurrentStep = newMaxStep;
      }

      for (i = newPatternList.length - 1; i >= 0; i--) {
        pattern = newPatternList[i];
        patternFinalBaseStep = pattern.startStep + pattern.stepCount - 1;
        patternFinalPlaybackStep = pattern.startStep + pattern.playbackStepCount - 1;

        if (pattern.startStep > newMaxStep) {
          newPatternList.splice(i, 1);
        }
        else if (patternFinalPlaybackStep > newMaxStep) {
          pattern.playbackStepCount = newMaxStep - pattern.startStep + 1;

          if (patternFinalBaseStep > newMaxStep) {
            pattern.stepCount = pattern.playbackStepCount;
          }
        }
      }
    }

    this.setState({
      measureCount: newMeasureCount,
      patterns: newPatternList,
    }, function() {
      this.syncScoreToSynthCore();
      this.setCurrentStep(newCurrentStep);
    });
  };

  setIsSequencerExpanded(newIsSequencerExpanded) {
    this.setState({
      isSequencerExpanded: newIsSequencerExpanded,
    });
  };

  setSequencerScrollLeft(newSequencerScrollLeft) {
    this.setState({
      sequencerScrollLeft: newSequencerScrollLeft,
    });
  };

  setCurrentStep(newStep) {
    this.transport.setCurrentStep(newStep);

    this.setState((prevState, props) => ({
      transport: Object.assign({}, prevState.transport, {
        step: newStep,
      }),
    }));
  };

  setTrackName(trackID, newTrackName) {
    let newTrackList = this.state.tracks.concat([]);
    let track = this.itemByID(newTrackList, trackID);

    track.name = newTrackName;

    this.setState({
      tracks: newTrackList,
    });
  };

  setTrackVolume(trackID, newTrackVolume) {
    let tracks = this.state.tracks;
    let newTrackList = tracks.concat([]);
    let track = this.itemByID(newTrackList, trackID);

    track.volume = newTrackVolume;

    this.setState({
      tracks: newTrackList
    });
    this.mixer.setChannelAmplitude(trackID, newTrackVolume);
  };

  toggleTrackMute(trackID, newIsMuted) {
    let tracks = this.state.tracks;
    let newTrackList = tracks.concat([]);
    let track = this.itemByID(newTrackList, trackID);

    track.isMuted = newIsMuted;

    this.setState({
      tracks: newTrackList
    });
    this.mixer.setChannelIsMuted(trackID, newIsMuted);
  };

  addGenericTrack(newInstrument, newTrackName) {
    let newTrack = {
      id: this.idGenerator.next(),
      name: newTrackName,
      instrumentID: newInstrument.id,
      isMuted: false,
      volume: 0.8,
    };

    this.setState((prevState, props) => ({
      instruments: prevState.instruments.concat([newInstrument]),
      tracks: prevState.tracks.concat([newTrack])
    }),
    function() {
      this.mixer.addChannel(newTrack.id, newTrack.volume, newTrack.isMuted, this.bufferCollection.getBuffer("reverb"), newInstrument.reverbWetPercentage, newInstrument.delayTime, newInstrument.delayFeedback);
      this.syncInstrumentsToSynthCore();
    });
  };

  addSynthTrack() {
    let newInstrumentID = this.idGenerator.next();
    let newInstrument = {
      id:                    newInstrumentID,
      type:                  "synth",
      name:                  "Synth Track",
      oscillator1Waveform:   "sine",
      oscillator1Octave:     -1,
      oscillator1Amplitude:  1.0,
      oscillator2Waveform:   "sine",
      oscillator2Detune:     0,
      oscillator2Octave:     1,
      oscillator2Amplitude:  1.0,
      noiseAmplitude:        0.0,
      noiseType:             "pink",
      lfoWaveform:           "sine",
      lfoFrequency:          5,
      lfoAmplitude:          0,
      filterCutoff:          9950,
      filterResonance:       0,
      filterLFOWaveform:     "sine",
      filterLFOFrequency:    5,
      filterLFOAmplitude:    0,
      filterEnvelopeAmount:  1500,
      filterEnvelopeAttackTime: 0.0,
      filterEnvelopeDecayTime: 0.0,
      filterEnvelopeSustainPercentage: 1.0,
      filterEnvelopeReleaseTime: 0.0,
      envelopeAttackTime: 0.0,
      envelopeDecayTime: 0.0,
      envelopeSustainPercentage: 1.0,
      envelopeReleaseTime: 0.0,
      delayTime: 0.0,
      delayFeedback: 0.0,
      reverbWetPercentage: 0.0,
    };

    this.addGenericTrack(newInstrument, "Synth Track");
  };

  addSamplerTrack(file) {
    let newInstrumentID = this.idGenerator.next();
    let label = "Instrument " + newInstrumentID;

    this.bufferCollection.addBufferFromFile(label, file, () => {
      let newInstrument = {
        id:                    newInstrumentID,
        type:                  "sample",
        name:                  "Sampler Track",
        bufferID:              label,
        filename:              file.name,
        loop:                  false,
        rootNoteName:          "A",
        rootNoteOctave:        4,
        filterCutoff:          9950,
        filterResonance:       0,
        filterLFOWaveform:     "sine",
        filterLFOFrequency:    5,
        filterLFOAmplitude:    0,
        filterEnvelopeAmount:  1500,
        filterEnvelopeAttackTime: 0.0,
        filterEnvelopeDecayTime: 0.0,
        filterEnvelopeSustainPercentage: 1.0,
        filterEnvelopeReleaseTime: 0.0,
        envelopeAttackTime: 0.0,
        envelopeDecayTime: 0.0,
        envelopeSustainPercentage: 1.0,
        envelopeReleaseTime: 0.0,
        delayTime: 0.0,
        delayFeedback: 0.0,
        reverbWetPercentage: 0.0,
      };

      this.addGenericTrack(newInstrument, "Sampler Track");
    });
  };

  removeTrack(trackID) {
    let track = this.trackByID(trackID);
    let trackIndex = this.trackIndexByID(trackID);

    let newInstruments = this.state.instruments.concat([]);
    newInstruments.splice(this.instrumentIndexByID(track.instrumentID), 1);

    let newTracks = this.state.tracks.concat([]);
    newTracks.splice(trackIndex, 1);

    let newPatterns = this.state.patterns.concat([]);
    newPatterns = newPatterns.filter(pattern => pattern.trackID !== track.id);

    let removedInstrument = this.instrumentByID(track.instrumentID);
    if (removedInstrument.type === "sample") {
      this.bufferCollection.removeBuffer(removedInstrument.bufferID);
    }

    this.setState({
      instruments: newInstruments,
      patterns: newPatterns,
      tracks: newTracks,
    }, function() {
      this.mixer.removeChannel(trackID);
      this.notePlayer.removeChannel(trackID);
      this.syncScoreToSynthCore();
      this.syncInstrumentsToSynthCore();

      if (this.state.tracks.length === 0) {
        this.addSynthTrack();
      }
    });
  };

  addPattern(trackID, startStep) {
    let newPatternID = this.idGenerator.next();

    let newPattern = {
      id: newPatternID,
      name: "",
      trackID: trackID,
      startStep: startStep,
      stepCount: STEPS_PER_MEASURE,
      playbackStepCount: STEPS_PER_MEASURE,
      rows: [
        {
          notes: [{name: ""},
                  {name: ""},
                  {name: ""},
                  {name: ""},
                  {name: ""},
                  {name: ""},
                  {name: ""},
                  {name: ""},
                  {name: ""},
                  {name: ""},
                  {name: ""},
                  {name: ""},
                  {name: ""},
                  {name: ""},
                  {name: ""},
                  {name: ""},],
        },
      ]
    };

    newPattern.image = this.generatePatternImage(newPattern);

    this.setState({
      patterns: this.state.patterns.concat(newPattern),
    });
  };

  duplicatePattern(trackID, originalPattern, startStep) {
    let newPatternID = this.idGenerator.next();
    let duplicatedRows = [];
    let i, j;

    if (this.isSpaceForPatternInTrack(trackID, startStep, originalPattern.playbackStepCount, undefined) !== true) {
      return;
    }

    for (i = 0; i < originalPattern.rows.length; i++) {
      duplicatedRows.push({ notes: [] });
      for (j = 0; j < originalPattern.rows[i].notes.length; j++) {
        duplicatedRows[i].notes.push({ name: originalPattern.rows[i].notes[j].name });
      }
    }

    let newPattern = {
      id: newPatternID,
      name: originalPattern.name,
      trackID: trackID,
      startStep: startStep,
      stepCount: originalPattern.stepCount,
      playbackStepCount: originalPattern.playbackStepCount,
      rows: duplicatedRows,
    };

    newPattern.image = this.generatePatternImage(newPattern);

    this.setState({
      patterns: this.state.patterns.concat(newPattern),
    }, function() {
      this.syncScoreToSynthCore();
    });
  };

  removePattern(patternID) {
    let patternIndex = this.patternIndexByID(patternID);
    let newPatterns = this.state.patterns.concat([]);

    newPatterns.splice(patternIndex, 1);

    this.setState({
      patterns: newPatterns,
    }, function() {
      this.syncScoreToSynthCore();
    });
  };

  setPatternName(patternID, newPatternName) {
    let newPatternList = this.state.patterns.concat([]);
    let pattern = this.itemByID(newPatternList, patternID);

    pattern.name = newPatternName;

    this.setState({
      patterns: newPatternList,
    });
  };

  addPatternRow(patternID) {
    let i;
    let newPatternList = this.state.patterns.concat([]);
    let pattern = this.patternByID(patternID);
    let notesArray = Array(pattern.stepCount);
    let newRow = { notes: notesArray };

    for (i = 0; i < notesArray.length; i++) {
      notesArray[i] = {name: ""};
    }

    pattern.rows.push(newRow);

    this.setState({
      patterns: newPatternList,
    });
  };

  removePatternRow(patternID, rowIndex) {
    let patternIndex = this.patternIndexByID(patternID);
    let pattern = this.patternByID(patternID);
    let newPatterns = this.state.patterns.concat([]);

    let i;
    let notesArray;

    newPatterns[patternIndex].rows.splice(rowIndex, 1);
    if (newPatterns[patternIndex].rows.length === 0) {
      notesArray = Array(pattern.stepCount);

      for (i = 0; i < notesArray.length; i++) {
        notesArray[i] = {name: ""};
      }

      newPatterns[patternIndex].rows.push({
        notes: notesArray,
      });
    }

    this.setState({
      patterns: newPatterns,
    }, function() {
      this.syncScoreToSynthCore();
    });
  };

  setTrackBeingEdited(newTrackBeingEditedID) {
    this.setState({
      trackBeingEditedID: newTrackBeingEditedID,
      patternBeingEditedID: undefined,
    });
  };

  setPatternBeingEdited(newPatternBeingEditedID) {
    this.setState({
      trackBeingEditedID: undefined,
      patternBeingEditedID: newPatternBeingEditedID,
    });
  };

  setCopiedPattern(copiedPatternID) {
    let originalPattern = this.patternByID(copiedPatternID);
    let duplicatedRows = [];
    let i, j;

    for (i = 0; i < originalPattern.rows.length; i++) {
      duplicatedRows.push({ notes: [] });
      for (j = 0; j < originalPattern.rows[i].notes.length; j++) {
        duplicatedRows[i].notes.push({ name: originalPattern.rows[i].notes[j].name });
      }
    }

    let newPattern = {
      id: undefined,
      name: originalPattern.name,
      trackID: undefined,
      startStep: originalPattern.startStep,
      stepCount: originalPattern.stepCount,
      playbackStepCount: originalPattern.playbackStepCount,
      rows: duplicatedRows,
    };

    this.setState({
      copiedPattern: newPattern,
    });
  };

  movePattern(patternID, newTrackIndex, newStartStep) {
    let newPatternList = this.state.patterns.concat([]);
    let pattern = this.itemByID(newPatternList, patternID);
    let newTrackID = this.state.tracks[newTrackIndex].id;

    if (pattern.trackID === newTrackID && pattern.startStep === newStartStep) {
      return;
    }

    if (this.isSpaceForPatternInTrack(newTrackID, newStartStep, pattern.playbackStepCount, patternID) !== true) {
      return;
    }

    pattern.trackID = newTrackID;
    pattern.startStep = newStartStep;

    this.setState({
      patterns: newPatternList,
    }, function() {
      this.syncScoreToSynthCore();
    });
  };

  resizePattern(patternID, newStepCount) {
    let newPatternList = this.state.patterns.concat([]);
    let pattern = this.itemByID(newPatternList, patternID);
    let originalStepCount = pattern.stepCount;
    let newEndStep;
    let i, j;

    if (originalStepCount === newStepCount) {
      return;
    }

    if (this.isSpaceForPatternInTrack(pattern.trackID, pattern.startStep, newStepCount, patternID) !== true) {
      return;
    }

    pattern.stepCount = newStepCount;
    pattern.playbackStepCount = newStepCount;
    newEndStep = pattern.startStep + newStepCount - 1;

    // Add extra steps to each pattern row, if necessary
    if (newStepCount > originalStepCount) {
      for (i = 0; i < pattern.rows.length; i++) {
        for (j = 0; j <= (newEndStep - originalStepCount); j++) {
          pattern.rows[i].notes.push({name: ""});
        }
      }
    }

    this.setState({
      patterns: newPatternList,
    }, function() {
      this.syncScoreToSynthCore();
    });
  };

  changePatternPlaybackStepCount(patternID, newPlaybackStepCount) {
    let newPatternList = this.state.patterns.concat([]);
    let pattern = this.itemByID(newPatternList, patternID);

    if (pattern.playbackStepCount === newPlaybackStepCount) {
      return;
    }

    if (this.isSpaceForPatternInTrack(pattern.trackID, pattern.startStep, newPlaybackStepCount, patternID) !== true) {
      return;
    }

    pattern.playbackStepCount = newPlaybackStepCount;

    this.setState({
      patterns: newPatternList,
    }, function() {
      this.syncScoreToSynthCore();
    });
  };

  isSpaceForPatternInTrack(trackID, startStep, stepCount, patternToIgnoreID) {
    const endStep = startStep + stepCount - 1;
    let patternsInTrack;
    let otherPattern;
    let otherPatternEndStep;

    if (startStep < 0 || endStep >= (this.state.measureCount * STEPS_PER_MEASURE)) {
      return false;
    }

    patternsInTrack = this.patternsByTrackID(trackID);
    for (otherPattern of patternsInTrack) {
      otherPatternEndStep = otherPattern.startStep + otherPattern.playbackStepCount - 1;
      if (patternToIgnoreID !== otherPattern.id && !((endStep < otherPattern.startStep) || (startStep > otherPatternEndStep))) {
        return false;
      }
    }

    return true;
  };

  setSelectedPatternStepIndex(rowIndex, stepIndex) {
    this.setState({ selectedPatternRowIndex: rowIndex, selectedPatternStepIndex: stepIndex });
  };

  setNoteValue(noteValue, patternID, rowIndex, stepIndex) {
    let i;
    let pattern = this.patternByID(patternID);
    let patternRowNotes = pattern.rows[rowIndex].notes;
    let previousValue = patternRowNotes[stepIndex].name;

    patternRowNotes[stepIndex] = {name: noteValue};

    if (noteValue === "-") {
      i = stepIndex - 1;
      while (i >= 0 && patternRowNotes[i].name === "") {
        patternRowNotes[i] = {name: "-"};
        i -= 1;
      }
    }
    else if (noteValue === "" || previousValue === "-") {
      i = stepIndex + 1;
      while (i < patternRowNotes.length && patternRowNotes[i].name === "-") {
        patternRowNotes[i] = {name: ""};
        i += 1;
      }
    }

    this.forceUpdate();
    this.syncScoreToSynthCore();
  };

  closePatternEditor() {
    let newPatternList = this.state.patterns.concat([]);
    let pattern = this.itemByID(newPatternList, this.state.patternBeingEditedID);

    pattern.image = this.generatePatternImage(pattern);

    this.setState({
      patterns: newPatternList,
    });

    this.setKeyboardNotes([]);
    this.setPatternBeingEdited(undefined);
  }

  updateInstrument(instrumentID, field, value) {
    this.instrumentByID(instrumentID)[field] = value;
    this.forceUpdate();

    this.syncInstrumentsToSynthCore();
    this.syncChannels();
  };

  setBufferFromFile(instrumentID, file) {
    let instrument = this.instrumentByID(instrumentID);
    let label = instrument.bufferID;

    this.bufferCollection.addBufferFromFile(label, file, () => {
      this.updateInstrument(instrumentID, "filename", file.name);
    });
  };

  closeInstrumentEditor() {
    this.setKeyboardNotes([]);
    this.setTrackBeingEdited(undefined);
  }

  activateKeyboard() {
    this.setState({
      isKeyboardActive: true
    });
  };

  deactivateKeyboard() {
    this.setState({
      isKeyboardActive: false
    });
  };

  setKeyboardNotes(notes) {
    let i;
    let noteContext;
    let note;
    let currentTrackID;
    let patternBeingEdited;

    if (this.state.trackBeingEditedID !== undefined) {
      currentTrackID = this.state.trackBeingEditedID;
    }
    else if (this.state.patternBeingEditedID !== undefined) {
      patternBeingEdited = this.patternByID(this.state.patternBeingEditedID);
      currentTrackID = patternBeingEdited.trackID;
    }
    else {
      return;
    }

    let activeNoteSetHasChanged = false;
    let newActiveKeyboardNotes = this.state.activeKeyboardNotes.concat([]);

    // First, stop notes no longer in the active set
    for (i = newActiveKeyboardNotes.length - 1; i >= 0; i--) {
      if (!notes.includes(newActiveKeyboardNotes[i])) {
        noteContext = this.activeNoteContexts[i];

        this.notePlayer.stopNote(currentTrackID, this.mixer.audioContext(), noteContext);
        newActiveKeyboardNotes.splice(i, 1);
        this.activeNoteContexts.splice(i, 1);

        activeNoteSetHasChanged = true;
      }
    }

    // Next, start notes newly added to the active set
    for (i = 0; i < notes.length; i++) {
      if (!this.state.activeKeyboardNotes.includes(notes[i])) {
        if (this.state.selectedPatternRowIndex !== undefined && this.state.selectedPatternStepIndex !== undefined) {
          this.setNoteValue(notes[i], this.state.patternBeingEditedID, this.state.selectedPatternRowIndex, this.state.selectedPatternStepIndex);
        }

        note = SynthCore.Note(notes[i].slice(0, -1), parseInt(notes[i].slice(-1), 10), 1.0, 1);
        noteContext = this.notePlayer.playImmediateNote(currentTrackID,
                                                        this.mixer.audioContext(),
                                                        this.mixer.destination(currentTrackID),
                                                        note);

        newActiveKeyboardNotes.push(notes[i]);
        this.activeNoteContexts.push(noteContext);
        activeNoteSetHasChanged = true;
      }
    }

    // Finally, update state
    if (activeNoteSetHasChanged === true) {
      this.setState({
        activeKeyboardNotes: newActiveKeyboardNotes,
      });
    }
  };

  onMIDIStateChange(data) {
    let inputs = this.midiController.inputs();

    let connectedInputNames = inputs.map(function(input) {
      return (input.state === "connected") ? input.name : undefined;
    });

    connectedInputNames = connectedInputNames.filter(function(inputName) { return inputName !== undefined });
    if (connectedInputNames.length === 0) {
      connectedInputNames = ["None"];
    }

    this.setState({midiInputNames: [].concat(connectedInputNames)});
  };

  onMIDIMessage(messageType, data) {
    const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    let noteName, octave, noteString;
    let newActiveNotes = this.state.activeKeyboardNotes.concat([]);

    // Note number 0-11 are for the -1 octave, which is not currently supported
    if (data.noteNumber < 12) {
      return;
    }

    // Convert MIDI note number into internal note format
    noteName = NOTE_NAMES[data.noteNumber % 12];
    octave = Math.floor(data.noteNumber / 12) - 1;
    noteString = `${noteName}${octave}`;

    if (messageType === "noteon") {
      if (!newActiveNotes.includes(noteString)) {
        newActiveNotes.push(noteString);
      }
      this.setKeyboardNotes(newActiveNotes);
    }
    else if (messageType === "noteoff") {
      let noteIndex = newActiveNotes.indexOf(noteString);
      if (noteIndex !== -1) {
        newActiveNotes.splice(noteIndex, 1);
      }
      this.setKeyboardNotes(newActiveNotes);
    }
    else if (messageType === "controller") {
      // Maybe do something with controller messages in the future
    }
  };

  onMIDIError() {
    console.log("Unexpected MIDI error");
  };

  exportToWav(onExportComplete) {
    let offlineTransport;

    let serializedTracks = [];
    let track, instrument;
    for (track of this.state.tracks) {
      instrument = this.instrumentByID(track.instrumentID);
      serializedTracks.push({id: track.id,
                             volume: track.volume,
                             isMuted: track.isMuted,
                             reverbBuffer: this.bufferCollection.getBuffer("reverb"),
                             reverbWetPercentage: instrument.reverbWetPercentage,
                             delayTime: instrument.delayTime,
                             delayFeedback: instrument.delayFeedback});
    }

    offlineTransport = new SynthCore.OfflineTransport(serializedTracks, this.offlineSongPlayer, this.notePlayer, this.state.transport.tempo, this.state.masterAmplitude, this.mixer.audioContext().sampleRate, onExportComplete);
    offlineTransport.tick();
  };

  onVisibilityChange(e) {
    if (document.hidden === true && this.state.transport.isPlaying === true) {
      this.togglePlaying();
    }
  };


  generatePatternImage(pattern) {
    const STEP_WIDTH_IN_PIXELS = 9;
    const TRACK_HEIGHT_IN_PIXELS = 72;
    const STEP_HEIGHT_IN_PIXELS = 2;
    const PIXEL_RATIO = window.devicePixelRatio;

    let i;
    let serializedPatternRows;
    let row;
    let note;
    let minMidiNote = Number.POSITIVE_INFINITY;
    let maxMidiNote = Number.NEGATIVE_INFINITY;
    let midiNote;
    let yMarginInPixels;
    let noteTopPixel;

    this.canvas.height = TRACK_HEIGHT_IN_PIXELS * PIXEL_RATIO;
    this.canvas.width = pattern.stepCount * STEP_WIDTH_IN_PIXELS * PIXEL_RATIO;
    this.canvasContext.fillStyle = "#130f30";

    serializedPatternRows = Serializer.serializePatternRows(pattern.stepCount, pattern.stepCount, pattern.rows);

    for (row of serializedPatternRows) {
      for (note of row) {
        if (note !== undefined) {
          midiNote = note.midiNote();

          if (midiNote < minMidiNote) {
            minMidiNote = midiNote;
          }

          if (midiNote > maxMidiNote) {
            maxMidiNote = midiNote;
          }
        }
      }
    }

    yMarginInPixels = (TRACK_HEIGHT_IN_PIXELS - ((maxMidiNote - minMidiNote) * STEP_HEIGHT_IN_PIXELS)) / 2;
    yMarginInPixels = Math.max(0, yMarginInPixels);

    for (row of serializedPatternRows) {
      for (i = 0; i < row.length; i++) {
        if (row[i] !== undefined) {
          note = row[i];
          noteTopPixel = (maxMidiNote - note.midiNote()) * STEP_HEIGHT_IN_PIXELS;

          this.canvasContext.fillRect(i * STEP_WIDTH_IN_PIXELS * PIXEL_RATIO,
                                      (noteTopPixel + yMarginInPixels) * PIXEL_RATIO,
                                      ((note.stepCount() * STEP_WIDTH_IN_PIXELS) - 1) * PIXEL_RATIO,
                                      STEP_HEIGHT_IN_PIXELS * PIXEL_RATIO);
        }
      }
    }

    return this.canvas.toDataURL("image/png");
  };


  render() {
    let track;
    let pattern;
    let instrument;

    let view = VIEW_UNKNOWN;

    if (this.state.isLoaded !== true) {
      view = VIEW_LOADING;
    }
    else {
      if (this.state.patternBeingEditedID !== undefined) {
        view = VIEW_PATTERN_EDITOR;

        pattern = this.patternByID(this.state.patternBeingEditedID);
        track = this.trackByID(pattern.trackID);
        instrument = this.instrumentByID(track.instrumentID);
      }
      else if (this.state.trackBeingEditedID !== undefined) {
        track = this.trackByID(this.state.trackBeingEditedID);
        instrument = this.instrumentByID(track.instrumentID);

        if (instrument.type === "synth") {
          view = VIEW_INSTRUMENT_SYNTH;
        }
        else if (instrument.type === "sample") {
          view = VIEW_INSTRUMENT_SAMPLER;
        }
        else {
          view = VIEW_UNKNOWN;
        }
      }
      else {
        view = VIEW_SEQUENCER;
      }
    }


    return <div>
      {view === VIEW_LOADING &&
      <div className="absolute t0 b0 full-width flex flex-column flex-align-center flex-justify-center">
        <h1 className="h2 lh-2 red bold mt0 mb0">JS-140</h1>
        <span className="h3 lightText">Web Synthesizer</span>
        <span className="mt1 ml1 mr1">{this.state.loadingStatusMessage}</span>
      </div>
      }
      {view !== VIEW_LOADING &&
      <div className="flex flex-column flex-justify-space-between" style={{"minHeight": "100vh"}}>
        <div id="header" className="flex flex-align-center pt-half pb-half pl1-safe pr1-safe border-box full-width">
          <div id="logo-container">
            <h1 className="h3 lh-3 red bold mt0 mb0">JS-140</h1>
            <span className="lightText">Web Synthesizer</span>
          </div>
          <Transport isPlaying={this.state.transport.isPlaying}
                     amplitude={this.state.masterAmplitude}
                     tempo={this.state.transport.tempo}
                     rewindTransport={this.rewindTransport}
                     togglePlaying={this.togglePlaying}
                     updateAmplitude={this.updateMasterAmplitude}
                     updateTempo={this.updateTempo} />
          <DownloadButton isEnabled={this.state.isDownloadEnabled} onRequestDownload={this.exportToWav} />
        </div>
        {view === VIEW_SEQUENCER &&
        <Sequencer tracks={this.state.tracks}
                   patterns={this.state.patterns}
                   measureCount={this.state.measureCount}
                   setMeasureCount={this.setMeasureCount}
                   isExpanded={this.state.isSequencerExpanded}
                   setIsExpanded={this.setIsSequencerExpanded}
                   scrollLeft={this.state.sequencerScrollLeft}
                   setScrollLeft={this.setSequencerScrollLeft}
                   currentStep={this.state.transport.step}
                   setCurrentStep={this.setCurrentStep}
                   setTrackVolume={this.setTrackVolume}
                   toggleTrackMute={this.toggleTrackMute}
                   setTrackBeingEdited={this.setTrackBeingEdited}
                   setPatternBeingEdited={this.setPatternBeingEdited}
                   copiedPattern={this.state.copiedPattern}
                   setCopiedPattern={this.setCopiedPattern}
                   addSynthTrack={this.addSynthTrack}
                   addSamplerTrack={this.addSamplerTrack}
                   addPattern={this.addPattern}
                   duplicatePattern={this.duplicatePattern}
                   isSpaceForPatternInTrack={this.isSpaceForPatternInTrack}
                   movePattern={this.movePattern}
                   resizePattern={this.resizePattern}
                   changePatternPlaybackStepCount={this.changePatternPlaybackStepCount}
                   removePattern={this.removePattern}
                   removeTrack={this.removeTrack} />
        }
        {view === VIEW_INSTRUMENT_SYNTH &&
        <div className="pb1 pl1 pr1 border-box bt-thick">
          <SynthInstrumentEditor instrument={instrument}
                                 trackID={track.id}
                                 trackName={track.name}
                                 setTrackName={this.setTrackName}
                                 updateInstrument={this.updateInstrument}
                                 onClose={this.closeInstrumentEditor}
          />
        </div>
        }
        {view === VIEW_INSTRUMENT_SAMPLER &&
        <div className="pb1 pl1 pr1 border-box bt-thick">
          <SampleInstrumentEditor instrument={instrument}
                                  trackID={track.id}
                                  trackName={track.name}
                                  setTrackName={this.setTrackName}
                                  setBufferFromFile={this.setBufferFromFile}
                                  updateInstrument={this.updateInstrument}
                                  onClose={this.closeInstrumentEditor}
          />
        </div>
        }
        {view === VIEW_PATTERN_EDITOR &&
        <div className="pb1 pl1 pr1 border-box bt-thick">
          <PatternEditor pattern={pattern}
                         selectedRowIndex={this.state.selectedPatternRowIndex}
                         selectedStepIndex={this.state.selectedPatternStepIndex}
                         setPatternName={this.setPatternName}
                         addPatternRow={this.addPatternRow}
                         removePatternRow={this.removePatternRow}
                         setSelectedStepIndex={this.setSelectedPatternStepIndex}
                         setNoteValue={this.setNoteValue}
                         isKeyboardActive={this.state.isKeyboardActive}
                         onClose={this.closePatternEditor}
          />
        </div>
        }
        {(view === VIEW_PATTERN_EDITOR || view === VIEW_INSTRUMENT_SYNTH || view === VIEW_INSTRUMENT_SAMPLER) &&
        <Keyboard isActive={this.state.isKeyboardActive}
                  rootNoteName={instrument.rootNoteName}
                  rootNoteOctave={instrument.rootNoteOctave}
                  activeNotes={this.state.activeKeyboardNotes}
                  activate={this.activateKeyboard}
                  deactivate={this.deactivateKeyboard}
                  setNotes={this.setKeyboardNotes} />
        }
        <div className="flex flex-column flex-uniform-size flex-justify-end mt0">
          <p className="center mt1 mb0">MIDI Device(s):&nbsp;
          {this.state.isMidiEnabled === false && <span>Browser doesn&rsquo;t support MIDI</span>}
          {this.state.isMidiEnabled === true && this.state.midiInputNames.join(", ")}
          </p>
          <p className="center mt0 mb1">Made by <a href="https://www.joelstrait.com/">Joel Strait</a>, &copy; 2014-20</p>
        </div>
      </div>
      }
    </div>;
  };
};

ReactDOM.render(<App />, document.getElementById("root"));
