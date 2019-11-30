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

class App extends React.Component {
  constructor(props) {
    super(props);

    this.idGenerator = new IDGenerator(100);

    this.state = {
      isLoaded: false,
      loadingStatusMessage: "Loading...",
      measureCount: 8,
      selectedTrackID: undefined,
      selectedPatternID: undefined,
      selectedPatternRowIndex: undefined,
      selectedPatternNoteIndex: undefined,
      copiedPattern: undefined,
      isDownloadEnabled: (typeof document.createElement("a").download !== "undefined"),
      isDownloadInProgress: false,
      downloadFileName: "js-130",
      isKeyboardActive: false,
      activeKeyboardNotes: [],
      activeNoteContexts: [],
      masterAmplitude: 0.75,
      transport: {
        isPlaying: false,
        tempo: 114,
        step: 0,
      },
      instruments: DefaultSong.instruments,
      patterns: DefaultSong.patterns,
      tracks: DefaultSong.tracks,
      midiEnabled: false,
      midiInputNames: ["None"],
    };

    this.itemByID = this.itemByID.bind(this);
    this.indexByID = this.indexByID.bind(this);

    // Transport
    this.timeoutID = undefined;
    this.songPlayer = SynthCore.SongPlayer();
    this.offlineSongPlayer = SynthCore.SongPlayer();

    this.rewindTransport = this.rewindTransport.bind(this);
    this.togglePlaying = this.togglePlaying.bind(this);
    this.updateMasterAmplitude = this.updateMasterAmplitude.bind(this);
    this.updateTempo = this.updateTempo.bind(this);
    this.setDownloadFileName = this.setDownloadFileName.bind(this);
    this.export = this.export.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);

    // Sequencer
    this.setMeasureCount = this.setMeasureCount.bind(this);
    this.setCurrentStep = this.setCurrentStep.bind(this);
    this.setTrackName = this.setTrackName.bind(this);
    this.setTrackVolume = this.setTrackVolume.bind(this);
    this.toggleTrackMute = this.toggleTrackMute.bind(this);
    this.addGenericTrack = this.addGenericTrack.bind(this);
    this.addSynthTrack = this.addSynthTrack.bind(this);
    this.addSamplerTrack = this.addSamplerTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);

    // Track Editor
    this.setSelectedTrack = this.setSelectedTrack.bind(this);
    this.trackByID = this.trackByID.bind(this);
    this.instrumentByID = this.instrumentByID.bind(this);
    this.patternByID = this.patternByID.bind(this);
    this.patternIndexByID = this.patternIndexByID.bind(this);
    this.patternsByTrackID = this.patternsByTrackID.bind(this);
    this.isPatternsOverlapping = this.isPatternsOverlapping.bind(this);
    this.setSelectedPattern = this.setSelectedPattern.bind(this);
    this.setCopiedPattern = this.setCopiedPattern.bind(this);
    this.movePattern = this.movePattern.bind(this);
    this.resizePattern = this.resizePattern.bind(this);
    this.changePatternPlaybackStepCount = this.changePatternPlaybackStepCount.bind(this);
    this.updateInstrument = this.updateInstrument.bind(this);
    this.setBufferFromFile = this.setBufferFromFile.bind(this);
    this.addPattern = this.addPattern.bind(this);
    this.duplicatePattern = this.duplicatePattern.bind(this);
    this.removePattern = this.removePattern.bind(this);
    this.setPatternName = this.setPatternName.bind(this);
    this.addPatternRow = this.addPatternRow.bind(this);
    this.removePatternRow = this.removePatternRow.bind(this);
    this.setSelectedPatternNoteIndex = this.setSelectedPatternNoteIndex.bind(this);
    this.setNoteValue = this.setNoteValue.bind(this);

    // Keyboard
    this.activateKeyboard = this.activateKeyboard.bind(this);
    this.deactivateKeyboard = this.deactivateKeyboard.bind(this);
    this.setKeyboardNotes = this.setKeyboardNotes.bind(this);

    // MIDI
    this.onMIDIStateChange = this.onMIDIStateChange.bind(this);
    this.onMIDIMessage = this.onMIDIMessage.bind(this);
    this.onMIDIError = this.onMIDIError.bind(this);
    this.midiController = MidiController(this.onMIDIStateChange, this.onMIDIMessage);

    document.addEventListener("visibilitychange", this.onVisibilityChange, false);

    this.initialize();
  };

  initialize() {
    const bufferConfigs = [
      { label: "Instrument 4", url: "sounds/bass.wav", },
      { label: "Instrument 5", url: "sounds/snare.wav", },
      { label: "Instrument 6", url: "sounds/hihat.wav", },
    ];

    const audioContext = SynthCore.AudioContextBuilder.buildAudioContext();

    if (audioContext === undefined) {
      this.state.loadingStatusMessage = <span>Your browser doesn&rsquo;t appear to support the WebAudio API needed by the JS-130. Try a recent version of Chrome, Safari, or Firefox.</span>;
      return;
    }

    this.mixer = SynthCore.Mixer(audioContext);
    this.notePlayer = SynthCore.NotePlayer();

    this.transport = SynthCore.Transport(this.mixer, this.songPlayer, this.notePlayer, function() {});
    this.transport.setTempo(this.state.transport.tempo);
    this.mixer.setMasterAmplitude(this.state.masterAmplitude);

    this.bufferCollection = SynthCore.BufferCollection(audioContext);
    this.bufferCollection.addBuffer("white-noise", BufferGenerator.generateWhiteNoise(audioContext));
    this.bufferCollection.addBuffer("pink-noise", BufferGenerator.generatePinkNoise(audioContext));
    this.bufferCollection.addBuffer("reverb", BufferGenerator.generateReverbImpulseResponse(audioContext));

    this.bufferCollection.addBuffersFromURLs(
      bufferConfigs,
      () => {
        let i;
        let channelID;
        let instrument;

        this.setState({isLoaded: true, midiEnabled: this.midiController.enabled()});

        for (i = 0; i < this.state.tracks.length; i++) {
          channelID = this.state.tracks[i].id;
          instrument = this.instrumentByID(this.state.tracks[i].instrumentID);
          this.mixer.addChannel(channelID,
                                this.state.tracks[i].volume,
                                this.state.tracks[i].muted,
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
    let i;
    for (i = 0; i < array.length; i++) {
      if (array[i].id === targetID) {
        return array[i];
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

  isPatternsOverlapping(pattern, otherPattern) {
    const patternEndStep = pattern.startStep + pattern.playbackStepCount - 1;
    const otherPatternEndStep = otherPattern.startStep + otherPattern.playbackStepCount - 1;

    return pattern.trackID === otherPattern.trackID &&
           pattern.id !== otherPattern.id &&
           !((patternEndStep <= otherPattern.startStep) || (pattern.startStep >= otherPatternEndStep))
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
    let i;
    let track, instrument;

    for (i = 0; i < this.state.tracks.length; i++) {
      track = this.state.tracks[i];
      instrument = this.instrumentByID(track.instrumentID);
      this.mixer.setChannelAmplitude(track.id, track.volume);
      this.mixer.setChannelDelay(track.id, instrument.delayTime, instrument.delayFeedback);
      this.mixer.setChannelReverb(track.id, instrument.reverbWetPercentage);
    }
  };

  setMeasureCount(newMeasureCount) {
    let i;
    let newMaxStep;
    let patternFinalStep;
    let newCurrentStep = this.transport.currentStep();
    let newSelectedPatternID = this.state.selectedPatternID;

    if (newMeasureCount < this.state.measureCount) {
      newMaxStep = (newMeasureCount * 16) - 1;
      if (this.state.transport.step > newMaxStep) {
        newCurrentStep = newMaxStep;
      }

      for (i = this.state.patterns.length - 1; i >= 0; i--) {
        patternFinalStep = this.state.patterns[i].startStep + this.state.patterns[i].playbackStepCount - 1;
        if (patternFinalStep > newMaxStep) {
          if (newSelectedPatternID === this.state.patterns[i].id) {
            newSelectedPatternID = undefined;
          }

          this.state.patterns.splice(i, 1);
        }
      }

      this.forceUpdate();
    }

    this.setState({
      measureCount: newMeasureCount,
      selectedPatternID: newSelectedPatternID,
    }, function() {
      this.syncScoreToSynthCore();
      this.setCurrentStep(newCurrentStep);
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

    track.muted = newIsMuted;

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
      muted: false,
      volume: 0.8,
    };

    this.setState((prevState, props) => ({
      instruments: prevState.instruments.concat([newInstrument]),
      tracks: prevState.tracks.concat([newTrack])
    }),
    function() {
      this.mixer.addChannel(newTrack.id, newTrack.volume, newTrack.muted, this.bufferCollection.getBuffer("reverb"), newInstrument.reverbWetPercentage, newInstrument.delayTime, newInstrument.delayFeedback);
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
        sample:                label,
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

  removeTrackInner(trackID) {
    let track = this.trackByID(trackID);
    let trackIndex = this.trackIndexByID(trackID);
    let newSelectedTrackID = this.state.selectedTrackID;

    let newInstruments = this.state.instruments.concat([]);
    newInstruments.splice(this.instrumentIndexByID(track.instrumentID), 1);

    let newTracks = this.state.tracks.concat([]);
    newTracks.splice(trackIndex, 1);

    let newPatterns = this.state.patterns.concat([]);
    newPatterns = newPatterns.filter(pattern => pattern.trackID !== track.id);

    if (newSelectedTrackID === trackID && newTracks.length > 0) {
      if (trackIndex === this.state.tracks.length - 1) {
        newSelectedTrackID = this.state.tracks[trackIndex - 1].id;
      }
      else {
        newSelectedTrackID = this.state.tracks[trackIndex + 1].id;
      }
    }

    let removedInstrument = this.instrumentByID(track.instrumentID);
    if (removedInstrument.type === "sample") {
      this.bufferCollection.removeBuffer(removedInstrument.sample);
    }

    this.setState({
      selectedTrackID: undefined,
      selectedPatternID: undefined,
      instruments: newInstruments,
      patterns: newPatterns,
      tracks: newTracks,
    }, function() {
      this.mixer.removeChannel(trackID);
      this.notePlayer.removeChannel(trackID);
      this.syncScoreToSynthCore();
      this.syncInstrumentsToSynthCore();
    });
  };

  removeTrack(trackID) {
    if (this.state.tracks.length === 1) {
      this.addSynthTrack();

      let newSelectedTrackID = this.state.tracks[this.state.tracks.length - 1].id;

      this.setState({
        selectedTrackID: newSelectedTrackID,
      }, function() {
        this.removeTrackInner(trackID);
      });
    }
    else {
      this.removeTrackInner(trackID);
    }
  };

  addPattern(trackID, startStep) {
    let newPatternID = this.idGenerator.next();

    let newPattern = {
      id: newPatternID,
      name: "",
      trackID: trackID,
      startStep: startStep,
      stepCount: 16,
      playbackStepCount: 16,
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

    this.setState({
      patterns: this.state.patterns.concat(newPattern),
    });
  };

  duplicatePattern(trackID, originalPattern, startStep) {
    let newPatternID = this.idGenerator.next();
    let track = this.trackByID(trackID);
    let patternsInNewTrack = this.patternsByTrackID(trackID);
    let duplicatedRows = [];
    let newEndStep = startStep + originalPattern.playbackStepCount - 1;
    let songMaxStep = (this.state.measureCount * 16) - 1;
    let i, j;

    if (newEndStep > songMaxStep) {
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
      trackID: track.id,
      startStep: startStep,
      stepCount: originalPattern.stepCount,
      playbackStepCount: originalPattern.playbackStepCount,
      rows: duplicatedRows,
    };

    // Check for overlap with other existing patterns
    for (i = 0; i < patternsInNewTrack.length; i++) {
      if (this.isPatternsOverlapping(newPattern, patternsInNewTrack[i]) === true) {
        return;
      }
    }

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
    let pattern = this.patternByID(patternID);

    let i;
    let notesArray = Array(pattern.stepCount);
    let newRow = { notes: notesArray };

    for (i = 0; i < notesArray.length; i++) {
      notesArray[i] = {name: ""};
    }

    pattern.rows.push(newRow);
    this.forceUpdate();
  };

  removePatternRow(patternID, rowIndex) {
    let patternIndex = this.patternIndexByID(patternID);

    let newPatterns = this.state.patterns.concat([]);

    let i;
    let pattern;
    let notesArray;

    newPatterns[patternIndex].rows.splice(rowIndex, 1);
    if (newPatterns[patternIndex].rows.length === 0) {
      pattern = this.patternByID(patternID);
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

  setSelectedTrack(newSelectedTrackID) {
    this.setState({
      selectedTrackID: newSelectedTrackID,
      selectedPatternID: undefined,
    });
  };

  setSelectedPattern(newSelectedPatternID) {
    this.setState({
      selectedTrackID: undefined,
      selectedPatternID: newSelectedPatternID,
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
    let patternStepCount = pattern.playbackStepCount;
    let newTrackID = this.state.tracks[newTrackIndex].id;
    let patternsInNewTrack = this.patternsByTrackID(newTrackID);
    let originalTrackID = pattern.trackID;
    let originalStartStep = pattern.startStep;
    let i;

    newStartStep = Math.min((this.state.measureCount * 16) - patternStepCount, newStartStep);

    if (pattern.trackID === newTrackID && pattern.startStep === newStartStep) {
      return;
    }

    pattern.trackID = newTrackID;
    pattern.startStep = newStartStep;

    // Check for overlap with other existing patterns
    for (i = 0; i < patternsInNewTrack.length; i++) {
      if (this.isPatternsOverlapping(pattern, patternsInNewTrack[i]) === true) {
        pattern.trackID = originalTrackID;
        pattern.startStep = originalStartStep;

        return;
      }
    }

    this.setState({
      patterns: newPatternList,
    }, function() {
      this.syncScoreToSynthCore();
    });
  };

  resizePattern(patternID, newStepCount) {
    let newPatternList = this.state.patterns.concat([]);
    let pattern = this.itemByID(newPatternList, patternID);
    let patternsInTrack = this.patternsByTrackID(pattern.trackID);
    let originalStepCount = pattern.stepCount;
    let originalPlaybackStepCount = pattern.playbackStepCount;
    let newEndStep;
    let i, j;

    pattern.stepCount = newStepCount;
    pattern.playbackStepCount = newStepCount;
    newEndStep = pattern.startStep + newStepCount - 1;

    // Check for overlap with other existing patterns
    for (i = 0; i < patternsInTrack.length; i++) {
      if (this.isPatternsOverlapping(pattern, patternsInTrack[i]) === true) {
        pattern.stepCount = originalStepCount;
        pattern.playbackStepCount = originalPlaybackStepCount;

        return;
      }
    }

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
    let patternsInTrack = this.patternsByTrackID(pattern.trackID);
    let originalPlaybackStepCount = pattern.playbackStepCount;
    let i;

    pattern.playbackStepCount = newPlaybackStepCount;

    // Check for overlap with other existing patterns
    for (i = 0; i < patternsInTrack.length; i++) {
      if (this.isPatternsOverlapping(pattern, patternsInTrack[i]) === true) {
        pattern.playbackStepCount = originalPlaybackStepCount;

        return;
      }
    }

    this.setState({
      patterns: newPatternList,
    }, function() {
      this.syncScoreToSynthCore();
    });
  };

  setSelectedPatternNoteIndex(rowIndex, noteIndex) {
    this.setState({ selectedPatternRowIndex: rowIndex, selectedPatternNoteIndex: noteIndex });
  };

  setNoteValue(noteValue, patternID, rowIndex, noteIndex) {
    let i;
    let pattern = this.patternByID(patternID);
    let previousValue = pattern.rows[rowIndex].notes[noteIndex].name;

    pattern.rows[rowIndex].notes[noteIndex].name = noteValue;

    if (noteValue === "-") {
      i = noteIndex - 1;
      while (i >= 0 && pattern.rows[rowIndex].notes[i].name === "") {
        pattern.rows[rowIndex].notes[i].name = "-";
        i -= 1;
      }
    }
    else if (noteValue === "" || previousValue === "-") {
      i = noteIndex + 1;
      while (i < pattern.rows[rowIndex].notes.length && pattern.rows[rowIndex].notes[i].name === "-") {
        pattern.rows[rowIndex].notes[i].name = "";
        i += 1;
      }
    }

    this.forceUpdate();
    this.syncScoreToSynthCore();
  };

  updateInstrument(instrumentID, field, value) {
    this.instrumentByID(instrumentID)[field] = value;
    this.forceUpdate();

    this.syncInstrumentsToSynthCore();
    this.syncChannels();
  };

  setBufferFromFile(instrumentID, file) {
    let instrument = this.instrumentByID(instrumentID);
    let label = instrument.sample;

    this.bufferCollection.addBufferFromFile(label, file, () => {
      this.updateInstrument(instrumentID, "filename", file.name);
    });
  };

  setDownloadFileName(e) {
    this.setState({ downloadFileName: e.target.value });
  };

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
    let currentTrack;
    let selectedPattern;

    if (this.state.selectedTrackID !== undefined) {
      currentTrack = this.trackByID(this.state.selectedTrackID);
    }
    else if (this.state.selectedPatternID !== undefined) {
      selectedPattern = this.patternByID(this.state.selectedPatternID)
      currentTrack = this.trackByID(selectedPattern.trackID);
    }
    else {
      return;
    }

    let instrumentID = currentTrack.instrumentID;
    let instrument = Serializer.serializeInstrument(this.instrumentByID(instrumentID), this.bufferCollection);
    let activeNoteSetHasChanged = false;

    let newActiveKeyboardNotes = this.state.activeKeyboardNotes.concat([]);
    let newActiveNoteContexts = this.state.activeNoteContexts.concat([]);

    // First, stop notes no longer in the active set
    for (i = newActiveKeyboardNotes.length - 1; i >= 0; i--) {
      if (!notes.includes(newActiveKeyboardNotes[i])) {
        noteContext = newActiveNoteContexts[i];

        this.notePlayer.stopNote(currentTrack.id, this.mixer.audioContext(), noteContext);
        newActiveKeyboardNotes.splice(i, 1);
        newActiveNoteContexts.splice(i, 1);

        activeNoteSetHasChanged = true;
      }
    }

    // Next, start notes newly added to the active set
    for (i = 0; i < notes.length; i++) {
      if (!this.state.activeKeyboardNotes.includes(notes[i])) {
        if (this.state.selectedPatternRowIndex !== undefined && this.state.selectedPatternNoteIndex !== undefined) {
          this.setNoteValue(notes[i], this.state.selectedPatternID, this.state.selectedPatternRowIndex, this.state.selectedPatternNoteIndex);
        }

        note = SynthCore.Note(notes[i].slice(0, -1), parseInt(notes[i].slice(-1), 10), 1);
        noteContext = this.notePlayer.playImmediateNote(currentTrack.id,
                                                        this.mixer.audioContext(),
                                                        this.mixer.destination(currentTrack.id),
                                                        note,
                                                        1.0);

        newActiveKeyboardNotes.push(notes[i]);
        newActiveNoteContexts.push(noteContext);
        activeNoteSetHasChanged = true;
      }
    }

    // Finally, update state
    if (activeNoteSetHasChanged === true) {
      this.setState({
        activeKeyboardNotes: newActiveKeyboardNotes,
        activeNoteContexts: newActiveNoteContexts,
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

  export(downloadTriggerLink) {
    let app = this;

    let exportCompleteCallback = function(blob) {
      let url = window.URL.createObjectURL(blob);

      downloadTriggerLink.href = url;
      downloadTriggerLink.click();

      window.URL.revokeObjectURL(blob);

      app.setState({isDownloadInProgress: false});
    };

    let offlineTransport;

    let i;
    let serializedTracks = [];
    let track, instrument;
    for(i = 0; i < this.state.tracks.length; i++) {
      track = this.state.tracks[i];
      instrument = this.instrumentByID(track.instrumentID);
      serializedTracks.push({id: track.id,
                             volume: track.volume,
                             isMuted: track.muted,
                             reverbBuffer: this.bufferCollection.getBuffer("reverb"),
                             reverbWetPercentage: instrument.reverbWetPercentage,
                             delayTime: instrument.delayTime,
                             delayFeedback: instrument.delayFeedback});
    }

    this.setState({isDownloadInProgress: true});

    offlineTransport = new SynthCore.OfflineTransport(serializedTracks, this.offlineSongPlayer, this.notePlayer, this.state.transport.tempo, this.state.masterAmplitude, exportCompleteCallback);
    offlineTransport.tick();
  };

  onVisibilityChange(e) {
    if (document.hidden === true && this.state.transport.isPlaying === true) {
      this.togglePlaying();
    }
 };

  render() {
    let selectedTrack;
    let selectedPattern;
    let instrument;
    let isLoaded = this.state.isLoaded;

    let i;
    let patternsByTrackID = {};
    for (i = 0; i < this.state.tracks.length; i++) {
      patternsByTrackID[this.state.tracks[i].id] = this.patternsByTrackID(this.state.tracks[i].id);
    }

    if (this.state.selectedTrackID !== undefined) {
      selectedTrack = this.trackByID(this.state.selectedTrackID);
      instrument = this.instrumentByID(selectedTrack.instrumentID);
    }
    else if (this.state.selectedPatternID !== undefined) {
      selectedPattern = this.patternByID(this.state.selectedPatternID)
      selectedTrack = this.trackByID(selectedPattern.trackID);
      instrument = this.instrumentByID(selectedTrack.instrumentID);
    }

    return <div>
      {isLoaded !== true &&
      <div className="full-width flex flex-column flex-align-center flex-justify-center" style={{"minHeight": "100vh"}}>
        <h1 className="logo h2 bold mt0 mb0">JS-130</h1>
        <span className="lightText">Web Synthesizer</span>
        <span className="mt1 ml1 mr1">{this.state.loadingStatusMessage}</span>
      </div>
      }
      {isLoaded === true &&
      <div className="flex flex-column flex-justify-space-between" style={{"minHeight": "100vh"}}>
        <div id="header" className="flex flex-align-center pt1 pb1 pl1 pr1 border-box full-width">
          <div id="logo-container">
            <h1 className="logo h2 bold mt0 mb0">JS-130</h1>
            <span className="lightText">Web Synthesizer</span>
          </div>
          <Transport isPlaying={this.state.transport.isPlaying}
                     amplitude={this.state.masterAmplitude}
                     tempo={this.state.transport.tempo}
                     rewindTransport={this.rewindTransport}
                     togglePlaying={this.togglePlaying}
                     updateAmplitude={this.updateMasterAmplitude}
                     updateTempo={this.updateTempo} />
          <DownloadButton isEnabled={this.state.isDownloadEnabled} isDownloadInProgress={this.state.isDownloadInProgress} downloadFileName={this.state.downloadFileName} setDownloadFileName={this.setDownloadFileName} export={this.export} />
        </div>
        {this.state.selectedTrackID === undefined && this.state.selectedPatternID === undefined &&
        <Sequencer tracks={this.state.tracks}
                   patternsByTrackID={patternsByTrackID}
                   measureCount={this.state.measureCount}
                   setMeasureCount={this.setMeasureCount}
                   currentStep={this.state.transport.step}
                   setCurrentStep={this.setCurrentStep}
                   setTrackVolume={this.setTrackVolume}
                   toggleTrackMute={this.toggleTrackMute}
                   setSelectedTrack={this.setSelectedTrack}
                   selectedPatternID={this.state.selectedPatternID}
                   setSelectedPattern={this.setSelectedPattern}
                   copiedPattern={this.state.copiedPattern}
                   setCopiedPattern={this.setCopiedPattern}
                   addSynthTrack={this.addSynthTrack}
                   addSamplerTrack={this.addSamplerTrack}
                   addPattern={this.addPattern}
                   duplicatePattern={this.duplicatePattern}
                   movePattern={this.movePattern}
                   resizePattern={this.resizePattern}
                   changePatternPlaybackStepCount={this.changePatternPlaybackStepCount}
                   removePattern={this.removePattern}
                   removeTrack={this.removeTrack} />
        }
        {this.state.selectedTrackID !== undefined && instrument.type === "synth" &&
        <div className="pb1 pl1 pr1 border-box bt-thick">
          <SynthInstrumentEditor instrument={instrument}
                                 trackID={selectedTrack.id}
                                 trackName={selectedTrack.name}
                                 setTrackName={this.setTrackName}
                                 setSelectedTrack={this.setSelectedTrack}
                                 updateInstrument={this.updateInstrument} />
        </div>
        }
        {this.state.selectedTrackID !== undefined && instrument.type === "sample" &&
        <div className="pb1 pl1 pr1 border-box bt-thick">
          <SampleInstrumentEditor instrument={instrument}
                                  trackID={selectedTrack.id}
                                  trackName={selectedTrack.name}
                                  setTrackName={this.setTrackName}
                                  setSelectedTrack={this.setSelectedTrack}
                                  setBufferFromFile={this.setBufferFromFile}
                                  updateInstrument={this.updateInstrument} />
        </div>
        }
        {this.state.selectedPatternID !== undefined &&
        <div className="pb1 pl1 pr1 border-box bt-thick">
          <PatternEditor selectedPattern={selectedPattern}
                         selectedPatternRowIndex={this.state.selectedPatternRowIndex}
                         selectedPatternNoteIndex={this.state.selectedPatternNoteIndex}
                         setPatternName={this.setPatternName}
                         addPatternRow={this.addPatternRow}
                         removePatternRow={this.removePatternRow}
                         setSelectedPattern={this.setSelectedPattern}
                         setSelectedPatternNoteIndex={this.setSelectedPatternNoteIndex}
                         setNoteValue={this.setNoteValue}
                         keyboardActive={this.state.isKeyboardActive} />
        </div>
        }
        {(this.state.selectedTrackID !== undefined || this.state.selectedPatternID !== undefined) &&
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
          {this.state.midiEnabled === false && <span>Browser doesn&rsquo;t support MIDI</span>}
          {this.state.midiEnabled === true && this.state.midiInputNames.join(", ")}
          </p>
          <p className="center mt0 mb1">Made by <a href="https://www.joelstrait.com/">Joel Strait</a>, &copy; 2014-19</p>
        </div>
      </div>
      }
    </div>;
  };
};

ReactDOM.render(<App />, document.getElementById("root"));
