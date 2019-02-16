"use strict";

import React from 'react';
import ReactDOM from 'react-dom';

import * as JSSynth from "./jssynth";
import * as DefaultSong from "./default_song";
import { BufferGenerator } from "./buffer_generator";
import { IDGenerator } from "./id_generator";
import { MidiController } from "./midi_controller";
import { Serializer } from "./serializer";

import { DownloadButton } from "./components/download_button";
import { Keyboard } from "./components/keyboard";
import { Sequencer } from "./components/sequencer";
import { TrackEditor } from "./components/track_editor";
import { Transport } from "./components/transport";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.idGenerator = new IDGenerator(100);

    this.state = {
      isLoaded: false,
      loadingStatusMessage: "Loading...",
      measureCount: 8,
      selectedTrackID: 1,
      selectedPatternID: 1,
      selectedPatternRowIndex: undefined,
      selectedPatternNoteIndex: undefined,
      downloadEnabled: (typeof document.createElement('a').download !== "undefined"),
      downloadInProgress: false,
      downloadFileName: "js-130",
      keyboardActive: false,
      activeKeyboardNotes: [],
      activeNoteContexts: [],
      masterAmplitude: 0.75,
      transport: {
        playing: false,
        tempo: 114,
        measure: undefined,
        step: undefined,
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
    this.songPlayer = JSSynth.SongPlayer();
    this.offlineSongPlayer = JSSynth.SongPlayer();

    this.togglePlaying = this.togglePlaying.bind(this);
    this.updateMasterAmplitude = this.updateMasterAmplitude.bind(this);
    this.updateTempo = this.updateTempo.bind(this);
    this.setDownloadFileName = this.setDownloadFileName.bind(this);
    this.export = this.export.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);

    // Sequencer
    this.setMeasureCount = this.setMeasureCount.bind(this);
    this.setTrackName = this.setTrackName.bind(this);
    this.setTrackVolume = this.setTrackVolume.bind(this);
    this.toggleTrackMute = this.toggleTrackMute.bind(this);
    this.setTrackPattern = this.setTrackPattern.bind(this);
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
    this.setSelectedPattern = this.setSelectedPattern.bind(this);
    this.updateInstrument = this.updateInstrument.bind(this);
    this.setBufferFromFile = this.setBufferFromFile.bind(this);
    this.addPattern = this.addPattern.bind(this);
    this.duplicatePattern = this.duplicatePattern.bind(this);
    this.removePattern = this.removePattern.bind(this);
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

    this.audioSource = JSSynth.AudioSource(JSSynth.AudioContextBuilder.buildAudioContext());
    this.notePlayer = JSSynth.NotePlayer();

    if (this.audioSource.audioContext() === undefined) {
      this.state.loadingStatusMessage = <span>Your browser doesn&rsquo;t appear to support the WebAudio API needed by the JS-130. Try a recent version of Chrome, Safari, or Firefox.</span>;
      return;
    }

    this.transport = JSSynth.Transport(this.audioSource, this.songPlayer, this.notePlayer, function() {});
    this.transport.setTempo(this.state.transport.tempo);
    this.audioSource.setMasterAmplitude(this.state.masterAmplitude);

    this.bufferCollection = JSSynth.BufferCollection(this.audioSource.audioContext());
    this.bufferCollection.addBuffer("white-noise", BufferGenerator.generateWhiteNoise(this.audioSource.audioContext()));
    this.bufferCollection.addBuffer("pink-noise", BufferGenerator.generatePinkNoise(this.audioSource.audioContext()));
    this.bufferCollection.addBuffer("reverb", BufferGenerator.generateReverbImpulseResponse(this.audioSource.audioContext()));

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
          this.audioSource.addChannel(channelID,
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

  searchForNextPatternIDAscending(trackID, patterns, startIndex) {
    let i = startIndex;

    while (i < patterns.length) {
      if (patterns[i].trackID === trackID) {
        return patterns[i].id;
      }
      i++;
    }

    return undefined;
  };

  searchForNextPatternIDDescending(trackID, patterns, startIndex) {
    let i = startIndex;

    while (i >= 0) {
      if (patterns[i].trackID === trackID) {
        return patterns[i].id;
      }
      i--;
    }

    return undefined;
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
    this.audioSource.setMasterAmplitude(newAmplitude);
  };

  syncCurrentStep() {
    let newStep = this.transport.currentStep();
    let newMeasure = Math.floor((newStep / 16) % this.state.measureCount);

    this.setState((prevState, props) => ({
      transport: Object.assign({}, prevState.transport, {
        measure: newMeasure,
        step: newStep,
      }),
    }));
  };

  togglePlaying(e) {
    this.transport.toggle();

    if (this.state.transport.playing) {
      clearInterval(this.timeoutID);

      this.setState((prevState, props) => ({
        transport: Object.assign({}, prevState.transport, {
          playing: !(prevState.transport.playing),
          measure: undefined,
          step: undefined,
        }),
      }));
    }
    else {
      this.timeoutID = setInterval(() => this.syncCurrentStep(), 15);

      this.setState((prevState, props) => ({
        transport: Object.assign({}, prevState.transport, {
          playing: !(prevState.transport.playing),
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
      this.audioSource.setChannelAmplitude(track.id, track.volume);
      this.audioSource.setChannelDelay(track.id, instrument.delayTime, instrument.delayFeedback);
      this.audioSource.setChannelReverb(track.id, instrument.reverbWetPercentage);
    }
  };

  setMeasureCount(newMeasureCount) {
    let i, j;
    let extraPatterns;

    if (newMeasureCount > this.state.measureCount) {
      for (i = 0; i < this.state.tracks.length; i++) {
        extraPatterns = new Array(newMeasureCount - this.state.measureCount);
        for (j = 0; j < extraPatterns.length; j++) {
          extraPatterns[j] = {patternID: -1};
        }
        this.state.tracks[i].patterns = this.state.tracks[i].patterns.concat(extraPatterns);
      }
      this.forceUpdate();
    }
    else if (newMeasureCount < this.state.measureCount) {
      for (i = 0; i < this.state.tracks.length; i++) {
        this.state.tracks[i].patterns.splice(newMeasureCount, this.state.measureCount - newMeasureCount);
      }
      this.forceUpdate();
    }
    else {
      // Should not get here
    }


    this.setState({
      measureCount: newMeasureCount,
    }, function() {
      this.syncScoreToSynthCore();
    });
  };

  setTrackName(trackID, newTrackName) {
    let i;
    let patternIndex = 1;
    let newTrackList = this.state.tracks.concat([]);
    let newPatternList = this.state.patterns.concat([]);

    let track = this.itemByID(newTrackList, trackID);
    track.name = newTrackName;

    for (i = 0; i < newPatternList.length; i++) {
      if (newPatternList[i].trackID == trackID) {
        newPatternList[i].name = newTrackName + " " + patternIndex;
        patternIndex += 1;
      }
    }

    this.setState({
      tracks: newTrackList,
      patterns: newPatternList,
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
    this.audioSource.setChannelAmplitude(trackID, newTrackVolume);
  };

  toggleTrackMute(trackID, newIsMuted) {
    let tracks = this.state.tracks;
    let newTrackList = tracks.concat([]);
    let track = this.itemByID(newTrackList, trackID);

    track.muted = newIsMuted;

    this.setState({
      tracks: newTrackList
    });
    this.audioSource.setChannelIsMuted(trackID, newIsMuted);
  };

  setTrackPattern(trackID, measure, patternID) {
    this.trackByID(trackID).patterns[measure].patternID = patternID;
    this.forceUpdate();

    this.syncScoreToSynthCore();
  };

  addGenericTrack(newInstrument, newTrackName) {
    let newTrack = {
      id: this.idGenerator.next(),
      name: newTrackName,
      instrumentID: newInstrument.id,
      muted: false,
      volume: 0.8,
      patterns: [],
    };

    let newPattern = {
      id: this.idGenerator.next(),
      name: newTrack.name + " 1",
      trackID: newTrack.id,
      rows: [
        {
          notes: [{name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},],
        },
      ]
    };

    let i = 0;
    for (i = 0; i < this.state.measureCount; i++) {
      newTrack.patterns[i] = { patternID: -1, };
    }

    this.setState((prevState, props) => ({
      instruments: prevState.instruments.concat([newInstrument]),
      patterns: prevState.patterns.concat([newPattern]),
      tracks: prevState.tracks.concat([newTrack])
    }),
    function() {
      this.audioSource.addChannel(newTrack.id, newTrack.volume, newTrack.muted, this.bufferCollection.getBuffer("reverb"), newInstrument.reverbWetPercentage, newInstrument.delayTime, newInstrument.delayFeedback);
      this.syncInstrumentsToSynthCore();
      this.setSelectedTrack(newTrack.id);
    });
  };

  addSynthTrack() {
    let newInstrumentID = this.idGenerator.next();
    let newInstrument = {
      id:                    newInstrumentID,
      type:                  'synth',
      name:                  'Instrument ' + newInstrumentID,
      oscillator1Waveform:   'sine',
      oscillator1Octave:     -1,
      oscillator1Amplitude:  1.0,
      oscillator2Waveform:   'sine',
      oscillator2Detune:     0,
      oscillator2Octave:     1,
      oscillator2Amplitude:  1.0,
      noiseAmplitude:        0.0,
      noiseType:             'pink',
      lfoWaveform:           'sine',
      lfoFrequency:          5,
      lfoAmplitude:          0,
      filterCutoff:          9950,
      filterResonance:       0,
      filterLFOWaveform:     'sine',
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
    let label = 'Instrument ' + newInstrumentID;

    this.bufferCollection.addBufferFromFile(label, file, () => {
      let newInstrument = {
        id:                    newInstrumentID,
        type:                  'sample',
        name:                  label,
        sample:                label,
        filename:              file.name,
        loop:                  false,
        rootNoteName:          "A",
        rootNoteOctave:        4,
        filterCutoff:          9950,
        filterResonance:       0,
        filterLFOWaveform:     'sine',
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

  removeTrackInner(id) {
    let track = this.trackByID(id);
    let trackIndex = this.trackIndexByID(id);
    let newSelectedTrackID = this.state.selectedTrackID;
    let newSelectedPatternID = this.state.selectedPatternID;

    let newInstruments = this.state.instruments.concat([]);
    newInstruments.splice(this.instrumentIndexByID(track.instrumentID), 1);

    let newTracks = this.state.tracks.concat([]);
    newTracks.splice(trackIndex, 1);

    let newPatterns = this.state.patterns.concat([]);
    newPatterns = newPatterns.filter(pattern => pattern.trackID !== track.id);

    if (newSelectedTrackID === id && newTracks.length > 0) {
      if (trackIndex === this.state.tracks.length - 1) {
        newSelectedTrackID = this.state.tracks[trackIndex - 1].id;
      }
      else {
        newSelectedTrackID = this.state.tracks[trackIndex + 1].id;
      }
      newSelectedPatternID = this.patternsByTrackID(newSelectedTrackID)[0].id;
    }

    let removedInstrument = this.instrumentByID(track.instrumentID);
    if (removedInstrument.type === "sample") {
      this.bufferCollection.removeBuffer(removedInstrument.sample);
    }

    this.setState({
      selectedTrackID: newSelectedTrackID,
      selectedPatternID: newSelectedPatternID,
      instruments: newInstruments,
      patterns: newPatterns,
      tracks: newTracks,
    }, function() {
      this.audioSource.removeChannel(id);
      this.notePlayer.removeChannel(id);
      this.syncScoreToSynthCore();
      this.syncInstrumentsToSynthCore();
    });
  };

  removeTrack(id) {
    if (this.state.tracks.length === 1) {
      this.addSynthTrack();

      let newSelectedTrackID = this.state.tracks[this.state.tracks.length - 1].id;

      this.setState({
        selectedTrackID: newSelectedTrackID,
        selectedPatternID: this.patternsByTrackID(newSelectedTrackID)[0].id,
      }, function() {
        this.removeTrackInner(id);
      });
    }
    else {
      this.removeTrackInner(id);
    }
  };

  addPattern(trackID) {
    let track = this.trackByID(trackID);
    let newPatternID = this.idGenerator.next();

    let newPattern = {
      id: newPatternID,
      name: track.name + " " + (this.patternsByTrackID(trackID).length + 1),
      trackID: trackID,
      rows: [
        {
          notes: [{name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},],
        },
      ]
    };

    this.setState({
      patterns: this.state.patterns.concat(newPattern),
      selectedPatternID: newPattern.id,
    });
  };

  duplicatePattern(patternID) {
    let originalPattern = this.patternByID(patternID);
    let newPatternID = this.idGenerator.next();
    let track = this.trackByID(originalPattern.trackID);
    let duplicatedRows = [];
    let i, j;

    for (i = 0; i < originalPattern.rows.length; i++) {
      duplicatedRows.push({ notes: [] });
      for (j = 0; j < originalPattern.rows[i].notes.length; j++) {
        duplicatedRows[i].notes.push({ name: originalPattern.rows[i].notes[j].name });
      }
    }

    let newPattern = {
      id: newPatternID,
      name: track.name + " " + (this.patternsByTrackID(track.id).length + 1),
      trackID: track.id,
      rows: duplicatedRows,
    };

    this.setState({
      patterns: this.state.patterns.concat(newPattern),
      selectedPatternID: newPattern.id,
    });
  };

  removePattern(id) {
    let i, patternCount = 1;
    let pattern = this.patternByID(id);
    let patternIndex = this.patternIndexByID(id);
    let newPatterns = this.state.patterns.concat([]);
    let track = this.trackByID(pattern.trackID);
    let trackIndex = this.trackIndexByID(track.id);
    let newTracks = this.state.tracks.concat([]);
    let newTrack = Object.assign({}, track);

    let newSelectedPatternID = this.state.selectedPatternID;

    newPatterns.splice(patternIndex, 1);
    for (i = 0; i < newPatterns.length; i++) {
      if (newPatterns[i].trackID === track.id) {
        newPatterns[i].name = track.name + " " + patternCount;
        patternCount += 1;
      }
    }

    newTrack.patterns = track.patterns.concat([]);
    for (i = 0; i < newTrack.patterns.length; i++) {
      if (newTrack.patterns[i].patternID === pattern.id) {
        newTrack.patterns[i].patternID = -1;
      }
    }
    newTracks[trackIndex] = newTrack;

    if (newSelectedPatternID === pattern.id) {
      newSelectedPatternID = this.searchForNextPatternIDAscending(track.id, this.state.patterns, patternIndex + 1);
      if (newSelectedPatternID === undefined) {
        newSelectedPatternID = this.searchForNextPatternIDDescending(track.id, this.state.patterns, patternIndex - 1);
      }
    }

    this.setState({
      patterns: newPatterns,
      tracks: newTracks,
      selectedPatternID: newSelectedPatternID,
    }, function() {
      this.syncScoreToSynthCore();
    });
  };

  addPatternRow(patternID) {
    let newRow = {
      notes: [{name: ''},
              {name: ''},
              {name: ''},
              {name: ''},
              {name: ''},
              {name: ''},
              {name: ''},
              {name: ''},
              {name: ''},
              {name: ''},
              {name: ''},
              {name: ''},
              {name: ''},
              {name: ''},
              {name: ''},
              {name: ''}],
    };

    let pattern = this.patternByID(patternID);
    pattern.rows.push(newRow);
    this.forceUpdate();
  };

  removePatternRow(patternID, rowIndex) {
    let patternIndex = this.patternIndexByID(patternID);

    let newPatterns = this.state.patterns.concat([]);
    newPatterns[patternIndex].rows.splice(rowIndex, 1);
    if (newPatterns[patternIndex].rows.length === 0) {
      newPatterns[patternIndex].rows.push({
        notes: [{name: ''},
                {name: ''},
                {name: ''},
                {name: ''},
                {name: ''},
                {name: ''},
                {name: ''},
                {name: ''},
                {name: ''},
                {name: ''},
                {name: ''},
                {name: ''},
                {name: ''},
                {name: ''},
                {name: ''},
                {name: ''}],
      });
    }

    this.setState({
      patterns: newPatterns,
    }, function() {
      this.syncScoreToSynthCore();
    });
  };

  setSelectedTrack(newSelectedTrackID) {
    let newSelectedPatternID = this.state.selectedPatternID;
    if (newSelectedTrackID !== this.state.selectedTrackID) {
      newSelectedPatternID = this.searchForNextPatternIDAscending(newSelectedTrackID, this.state.patterns, 0);
    }

    this.setState({
      selectedTrackID: newSelectedTrackID,
      selectedPatternID: newSelectedPatternID,
    });
  };

  setSelectedPattern(newSelectedPatternID) {
    this.setState({
      selectedPatternID: newSelectedPatternID,
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

  updateInstrument(id, field, value) {
    this.instrumentByID(id)[field] = value;
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
      keyboardActive: true
    });
  };

  deactivateKeyboard() {
    this.setState({
      keyboardActive: false
    });
  };

  setKeyboardNotes(notes) {
    let i;
    let noteContext;
    let note;
    let currentTrack = this.trackByID(this.state.selectedTrackID);
    let instrumentID = currentTrack.instrumentID;
    let instrument = Serializer.serializeInstrument(this.instrumentByID(instrumentID), this.bufferCollection);
    let activeNoteSetHasChanged = false;

    let newActiveKeyboardNotes = this.state.activeKeyboardNotes.concat([]);
    let newActiveNoteContexts = this.state.activeNoteContexts.concat([]);

    // First, stop notes no longer in the active set
    for (i = newActiveKeyboardNotes.length - 1; i >= 0; i--) {
      if (!notes.includes(newActiveKeyboardNotes[i])) {
        noteContext = newActiveNoteContexts[i];

        this.notePlayer.stopNote(this.state.selectedTrackID, this.audioSource.audioContext(), noteContext);
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

        note = JSSynth.Note(notes[i].slice(0, -1), notes[i].slice(-1), 1);
        noteContext = this.notePlayer.playImmediateNote(currentTrack.id,
                                                        this.audioSource.audioContext(),
                                                        this.audioSource.destination(currentTrack.id),
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

  export() {
    let app = this;

    let exportCompleteCallback = function(blob) {
      let url = window.URL.createObjectURL(blob);

      let hiddenDownloadLink = document.getElementById("hidden-download-link");
      hiddenDownloadLink.href = url;
      hiddenDownloadLink.click();

      window.URL.revokeObjectURL(blob);

      app.setState({downloadInProgress: false});
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

    this.setState({downloadInProgress: true});

    offlineTransport = new JSSynth.OfflineTransport(serializedTracks, this.offlineSongPlayer, this.notePlayer, this.state.transport.tempo, this.state.masterAmplitude, exportCompleteCallback);
    offlineTransport.tick();
  };

  onVisibilityChange(e) {
    if (document.hidden === true && this.state.transport.playing === true) {
      this.togglePlaying();
    }
 };

  render() {
    let selectedTrack = this.trackByID(this.state.selectedTrackID);
    let instrument = this.instrumentByID(selectedTrack.instrumentID);
    let patterns = this.patternsByTrackID(this.state.selectedTrackID);

    let i;
    let trackPatternOptions = {};
    for (i = 0; i < this.state.tracks.length; i++) {
      trackPatternOptions[this.state.tracks[i].id] = this.patternsByTrackID(this.state.tracks[i].id);
    }

    let isLoaded = this.state.isLoaded;

    return <div>
      {isLoaded !== true &&
      <div className="full-width flex flex-column flex-align-center flex-justify-center" style={{"minHeight": "100vh"}}>
        <h1 className="logo h2 bold mt0 mb0">JS-130</h1>
        <span className="lightText">Web Synthesizer</span>
        <span className="mt1 ml1 mr1">{this.state.loadingStatusMessage}</span>
      </div>
      }
      {isLoaded === true &&
      <div>
        <div id="header" className="flex flex-align-center pt1 pb1 pl1 pr1 border-box full-width">
          <div id="logo-container">
            <h1 className="logo h2 bold mt0 mb0">JS-130</h1>
            <span className="lightText">Web Synthesizer</span>
          </div>
          <Transport playing={this.state.transport.playing}
                     amplitude={this.state.masterAmplitude}
                     tempo={this.state.transport.tempo}
                     togglePlaying={this.togglePlaying}
                     updateAmplitude={this.updateMasterAmplitude}
                     updateTempo={this.updateTempo} />
          <DownloadButton enabled={this.state.downloadEnabled} downloadInProgress={this.state.downloadInProgress} downloadFileName={this.state.downloadFileName} setDownloadFileName={this.setDownloadFileName} export={this.export} />
        </div>
        <Sequencer tracks={this.state.tracks}
                   trackPatternOptions={trackPatternOptions}
                   measureCount={this.state.measureCount}
                   setMeasureCount={this.setMeasureCount}
                   currentMeasure={this.state.transport.measure}
                   currentStep={this.state.transport.step}
                   isPlaying={this.state.transport.playing}
                   setTrackName={this.setTrackName}
                   setTrackVolume={this.setTrackVolume}
                   toggleTrackMute={this.toggleTrackMute}
                   setTrackPattern={this.setTrackPattern}
                   addSynthTrack={this.addSynthTrack}
                   addSamplerTrack={this.addSamplerTrack}
                   removeTrack={this.removeTrack} />
        <TrackEditor tracks={this.state.tracks}
                     selectedTrackID={this.state.selectedTrackID}
                     selectedPattern={this.patternByID(this.state.selectedPatternID)}
                     selectedPatternRowIndex={this.state.selectedPatternRowIndex}
                     selectedPatternNoteIndex={this.state.selectedPatternNoteIndex}
                     instrument={instrument}
                     patterns={patterns}
                     setSelectedTrack={this.setSelectedTrack}
                     updateInstrument={this.updateInstrument}
                     setBufferFromFile={this.setBufferFromFile}
                     setSelectedPattern={this.setSelectedPattern}
                     addPattern={this.addPattern}
                     duplicatePattern={this.duplicatePattern}
                     removePattern={this.removePattern}
                     addPatternRow={this.addPatternRow}
                     removePatternRow={this.removePatternRow}
                     setSelectedPatternNoteIndex={this.setSelectedPatternNoteIndex}
                     setNoteValue={this.setNoteValue}
                     keyboardActive={this.state.keyboardActive} />
        <Keyboard active={this.state.keyboardActive}
                  rootNoteName={instrument.rootNoteName}
                  rootNoteOctave={instrument.rootNoteOctave}
                  activeNotes={this.state.activeKeyboardNotes}
                  activate={this.activateKeyboard}
                  deactivate={this.deactivateKeyboard}
                  setNotes={this.setKeyboardNotes} />
        <div className="flex flex-column flex-uniform-size flex-justify-end mt0">
          <p className="center mt1 mb1">MIDI Device(s):&nbsp;
          {this.state.midiEnabled === false && <span>Browser doesn&rsquo;t support MIDI</span>}
          {this.state.midiEnabled === true && this.state.midiInputNames.join(", ")}
          </p>
          <p className="center mt1 mb1">Made by <a href="https://www.joelstrait.com/">Joel Strait</a>, &copy; 2014-19</p>
        </div>
      </div>
      }
    </div>;
  };
};

ReactDOM.render(<App />, document.getElementById('root'));
