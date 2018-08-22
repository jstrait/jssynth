"use strict";

import React from 'react';
import ReactDOM from 'react-dom';

import * as JSSynth from "./jssynth";
import { IDGenerator } from "./id_generator";
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
      transport: {
        enabled: true,
        playing: false,
        amplitude: 0.75,
        tempo: 114,
        measure: undefined,
        step: undefined,
      },
      instruments: [
        {
          id: 1,
          type: "synth",
          name: "Bass Synth",
          oscillator1Waveform: "sawtooth",
          oscillator1Octave: 0,
          oscillator1Amplitude: 1.0,
          oscillator2Waveform: "square",
          oscillator2Detune: 7,
          oscillator2Octave: 0,
          oscillator2Amplitude: 1.0,
          noiseAmplitude: 0.0,
          lfoWaveform: "sine",
          lfoFrequency: 7.1,
          lfoAmplitude: 2,
          filterCutoff: 1500,
          filterResonance: 0,
          filterModulator: "envelope",
          filterLFOWaveform: "sine",
          filterLFOFrequency: 2.1,
          filterLFOAmplitude: 1,
          filterEnvelopeAttack: 0,
          filterEnvelopeDecay: 0.1,
          filterEnvelopeSustain: 0.09,
          filterEnvelopeRelease: 0,
          envelopeAttack: 0,
          envelopeDecay: 0,
          envelopeSustain: 1,
          envelopeRelease: 0,
        },
        {
          id: 2,
          type: "synth",
          name: "Arpeggio",
          oscillator1Waveform: "sawtooth",
          oscillator1Octave: 1,
          oscillator1Amplitude: 1.0,
          oscillator2Waveform: "square",
          oscillator2Detune: 7,
          oscillator2Octave: 1,
          oscillator2Amplitude: 1.0,
          noiseAmplitude: 0.0,
          lfoWaveform: "sine",
          lfoFrequency: 5,
          lfoAmplitude: 0,
          filterCutoff: 9950,
          filterResonance: 0,
          filterModulator: "lfo",
          filterLFOWaveform: "sine",
          filterLFOFrequency: 5,
          filterLFOAmplitude: 0,
          filterEnvelopeAttack: 0,
          filterEnvelopeDecay: 0,
          filterEnvelopeSustain: 1,
          filterEnvelopeRelease: 0,
          envelopeAttack: 0,
          envelopeDecay: 0.09,
          envelopeSustain: 0.16,
          envelopeRelease: 0.99,
        },
        {
          id: 3,
          type: "synth",
          name: "Squeal",
          oscillator1Waveform: "square",
          oscillator1Octave: 0,
          oscillator1Amplitude: 1.0,
          oscillator2Waveform: "sawtooth",
          oscillator2Detune: 6,
          oscillator2Octave: 0,
          oscillator2Amplitude: 1.0,
          noiseAmplitude: 0.0,
          lfoWaveform: "sine",
          lfoFrequency: 6,
          lfoAmplitude: 29,
          filterCutoff: 2800,
          filterResonance: 0,
          filterModulator: "envelope",
          filterLFOWaveform: "sine",
          filterLFOFrequency: 5,
          filterLFOAmplitude: 0.96,
          filterEnvelopeAttack: 0.48,
          filterEnvelopeDecay: 0.17,
          filterEnvelopeSustain: 0.17,
          filterEnvelopeRelease: 0,
          envelopeAttack: 0.13,
          envelopeDecay: 0,
          envelopeSustain: 1,
          envelopeRelease: 0,
        },
        {
          id: 4,
          type: "sample",
          name: "Bass Drum",
          sample: "Instrument 4",
          filename: "bass.wav",
          loop: false,
          filterCutoff: 9950,
          filterResonance: 0,
          filterModulator: "lfo",
          filterLFOWaveform: "sine",
          filterLFOFrequency: 5,
          filterLFOAmplitude: 0,
          filterEnvelopeAttack: 0,
          filterEnvelopeDecay: 0,
          filterEnvelopeSustain: 1,
          filterEnvelopeRelease: 0,
          envelopeAttack: 0,
          envelopeDecay: 0,
          envelopeSustain: 1,
          envelopeRelease: 0,
        },
        {
          id: 5,
          type: "sample",
          name: "Snare Drum",
          sample: "Instrument 5",
          filename: "snare.wav",
          loop: false,
          filterCutoff: 9950,
          filterResonance: 0,
          filterModulator: "lfo",
          filterLFOWaveform: "sine",
          filterLFOFrequency: 5,
          filterLFOAmplitude: 0,
          filterEnvelopeAttack: 0,
          filterEnvelopeDecay: 0,
          filterEnvelopeSustain: 1,
          filterEnvelopeRelease: 0,
          envelopeAttack: 0,
          envelopeDecay: 0,
          envelopeSustain: 1,
          envelopeRelease: 0,
        },
        {
          id:6,
          type: "sample",
          name: "Hi-Hat",
          sample: "Instrument 6",
          filename: "hihat.wav",
          loop: false,
          filterCutoff: 9950,
          filterResonance: 0,
          filterModulator: "lfo",
          filterLFOWaveform: "sine",
          filterLFOFrequency: 5,
          filterLFOAmplitude: 0,
          filterEnvelopeAttack: 0,
          filterEnvelopeDecay: 0,
          filterEnvelopeSustain: 1,
          filterEnvelopeRelease: 0,
          envelopeAttack: 0,
          envelopeDecay: 0,
          envelopeSustain: 1,
          envelopeRelease: 0,
        },
      ],
      patterns: [
        {
          id: 1,
          name: "Bass Synth 1",
          trackID: 1,
          rows: [
            {
              notes: [{name: "G1"},
                      {name: "A2"},
                      {name: "A1"},
                      {name: ""},
                      {name: "A1"},
                      {name: ""},
                      {name: ""},
                      {name: "A1"},
                      {name: ""},
                      {name: "A1"},
                      {name: "A1"},
                      {name: ""},
                      {name: "C1"},
                      {name: "A1"},
                      {name: "G1"},
                      {name: "-"},],
            },
          ],
        },
        {
          id: 2,
          name: "Bass Synth 2",
          trackID: 1,
          rows: [
            {
              notes: [{name: "G1"},
                      {name: "A2"},
                      {name: "A1"},
                      {name: ""},
                      {name: "A1"},
                      {name: ""},
                      {name: ""},
                      {name: "A1"},
                      {name: ""},
                      {name: "A1"},
                      {name: "C1"},
                      {name: ""},
                      {name: "C1"},
                      {name: "A1"},
                      {name: "G0"},
                      {name: "-"},],
            },
          ],
        },
        {
          id: 3,
          name: "Bass Synth 3",
          trackID: 1,
          rows: [
            {
              notes: [{name: "A1"},
                      {name: "A1"},
                      {name: ""},
                      {name: "A1"},
                      {name: "A1"},
                      {name: ""},
                      {name: "A1"},
                      {name: "A1"},
                      {name: "-"},
                      {name: "-"},
                      {name: "-"},
                      {name: "-"},
                      {name: "C1"},
                      {name: "-"},
                      {name: "G1"},
                      {name: "-"},],
            },
          ],
        },
        {
          id: 4,
          name: "Bass Synth 4",
          trackID: 1,
          rows: [
            {
              notes: [{name: "A1"},
                      {name: "A1"},
                      {name: ""},
                      {name: "A1"},
                      {name: "A1"},
                      {name: ""},
                      {name: "A1"},
                      {name: "A1"},
                      {name: "-"},
                      {name: "-"},
                      {name: "C1"},
                      {name: "-"},
                      {name: "C1"},
                      {name: "A1"},
                      {name: "G0"},
                      {name: "-"},],
            },
          ],
        },
        {
          id: 5,
          name: "Arpeggio 1",
          trackID: 2,
          rows: [
            {
              notes: [{name: "A3"},
                      {name: "E3"},
                      {name: "A4"},
                      {name: "A3"},
                      {name: "E3"},
                      {name: "A4"},
                      {name: "A3"},
                      {name: "E3"},
                      {name: "C3"},
                      {name: "A3"},
                      {name: "A4"},
                      {name: "E3"},
                      {name: "A3"},
                      {name: "A2"},
                      {name: "A1"},
                      {name: "A0"},],
            },
          ],
        },
        {
          id: 6,
          name: "Arpeggio 2",
          trackID: 2,
          rows: [
            {
              notes: [{name: "C3"},
                      {name: "E3"},
                      {name: "C4"},
                      {name: "C3"},
                      {name: "E3"},
                      {name: "C4"},
                      {name: "C3"},
                      {name: "E3"},
                      {name: "C3"},
                      {name: "C2"},
                      {name: "C4"},
                      {name: "E3"},
                      {name: "C3"},
                      {name: "C2"},
                      {name: "C1"},
                      {name: "C0"},],
            },
          ],
        },
        {
          id: 7,
          name: "Squeal 1",
          trackID: 3,
          rows: [
            {
              notes: [{name: "C4"},
                      {name: "-"},
                      {name: "-"},
                      {name: "-"},
                      {name: "B4"},
                      {name: "-"},
                      {name: "-"},
                      {name: "-"},
                      {name: "G3"},
                      {name: "-"},
                      {name: "-"},
                      {name: "-"},
                      {name: "E3"},
                      {name: "-"},
                      {name: "-"},
                      {name: "-"},],
            },
          ],
        },
        {
          id: 8,
          name: "Bass Drum 1",
          trackID: 4,
          rows: [
            {
              notes: [{name: "A4"},
                      {name: "-"},
                      {name: "-"},
                      {name: "-"},
                      {name: "A4"},
                      {name: "-"},
                      {name: "-"},
                      {name: "-"},
                      {name: "A4"},
                      {name: "-"},
                      {name: "-"},
                      {name: "-"},
                      {name: "A4"},
                      {name: "-"},
                      {name: "-"},
                      {name: "-"},],
            },
          ],
        },
        {
          id: 9,
          name: "Bass Drum 2",
          trackID: 4,
          rows: [
            {
              notes: [{name: "A4"},
                      {name: "-"},
                      {name: "-"},
                      {name: "-"},
                      {name: "A4"},
                      {name: "-"},
                      {name: "-"},
                      {name: "-"},
                      {name: "A4"},
                      {name: "A4"},
                      {name: "-"},
                      {name: "-"},
                      {name: "A4"},
                      {name: "-"},
                      {name: "-"},
                      {name: "-"},],
            },
          ],
        },
        {
          id: 10,
          name: "Snare Drum 1",
          trackID: 5,
          rows: [
            {
              notes: [{name: ""},
                      {name: ""},
                      {name: ""},
                      {name: ""},
                      {name: "A4"},
                      {name: "-"},
                      {name: "-"},
                      {name: "-"},
                      {name: ""},
                      {name: ""},
                      {name: ""},
                      {name: ""},
                      {name: "A4"},
                      {name: "-"},
                      {name: "-"},
                      {name: "-"},],
            },
          ],
        },
        {
          id: 11,
          name: "Hi-Hat 1",
          trackID: 6,
          rows: [
            {
              notes: [{name: "A4"},
                      {name: "A4"},
                      {name: "A4"},
                      {name: "-"},
                      {name: "A4"},
                      {name: "-"},
                      {name: "A3"},
                      {name: "F3"},
                      {name: "A4"},
                      {name: ""},
                      {name: "Eb4"},
                      {name: "A4"},
                      {name: "A4"},
                      {name: "A4"},
                      {name: "-"},
                      {name: ""},],
            },
          ],
        },
        {
          id: 12,
          name: "Hi-Hat 2",
          trackID: 6,
          rows: [
            {
              notes: [{name: "A4"},
                      {name: "A4"},
                      {name: "A4"},
                      {name: "A5"},
                      {name: "A4"},
                      {name: "A4"},
                      {name: "A1"},
                      {name: "A4"},
                      {name: "A4"},
                      {name: "A3"},
                      {name: "A4"},
                      {name: "A5"},
                      {name: "A4"},
                      {name: "A4"},
                      {name: "A2"},
                      {name: "A1"},],
            },
          ],
        },
      ],
      tracks: [
        {
          id: 1,
          name: "Bass Synth",
          instrumentID: 1,
          muted: false,
          volume: 0.8,
          patterns: [
            { patternID: 1, },
            { patternID: 2, },
            { patternID: 1, },
            { patternID: 2, },
            { patternID: 3, },
            { patternID: 4, },
            { patternID: 3, },
            { patternID: 4, },
          ],
        },
        {
          id: 2,
          name: "Arpeggio",
          instrumentID: 2,
          muted: false,
          volume: 0.5,
          patterns: [
            { patternID: -1, },
            { patternID: -1, },
            { patternID: -1, },
            { patternID: -1, },
            { patternID: 5, },
            { patternID: -1, },
            { patternID: 6, },
            { patternID: -1, },
          ],
        },
        {
          id: 3,
          name: "Squeal",
          instrumentID: 3,
          muted: false,
          volume: 0.6,
          patterns: [
            { patternID: -1, },
            { patternID: -1, },
            { patternID: -1, },
            { patternID: -1, },
            { patternID: -1, },
            { patternID: -1, },
            { patternID: -1, },
            { patternID: 7, },
          ],
        },
        {
          id: 4,
          name: "Bass Drum",
          instrumentID: 4,
          muted: false,
          volume: 1.0,
          patterns: [
            { patternID: 8, },
            { patternID: 8, },
            { patternID: 8, },
            { patternID: 8, },
            { patternID: 9, },
            { patternID: 9, },
            { patternID: 9, },
            { patternID: 9, },
          ],
        },
        {
          id: 5,
          name: "Snare Drum",
          instrumentID: 5,
          muted: false,
          volume: 0.8,
          patterns: [
            { patternID: -1, },
            { patternID: -1, },
            { patternID: -1, },
            { patternID: -1, },
            { patternID: 10, },
            { patternID: 10, },
            { patternID: 10, },
            { patternID: 10, },
          ],
        },
        {
          id: 6,
          name: "Hi-Hat",
          instrumentID: 6,
          muted: false,
          volume: 0.8,
          patterns: [
            { patternID: 11, },
            { patternID: 11, },
            { patternID: 11, },
            { patternID: 11, },
            { patternID: 12, },
            { patternID: 12, },
            { patternID: 12, },
            { patternID: 12, },
          ],
        },
      ],
      selectedTrackID: 1,
      selectedPatternID: 1,
      downloadFileName: "js-130",
      keyboardActive: false,
      activeKeyboardNotes: [],
      activeNoteContexts: [],
    };

    this.itemByID = this.itemByID.bind(this);
    this.indexByID = this.indexByID.bind(this);

    // Transport
    let stopCallback = function() { };
    this.timeoutID = undefined;
    this.songPlayer = new JSSynth.SongPlayer();
    this.offlineSongPlayer = new JSSynth.SongPlayer();
    this.transport = new JSSynth.Transport(this.songPlayer, stopCallback);
    this.transport.setTempo(this.state.transport.tempo);
    this.transport.setAmplitude(this.state.transport.amplitude);

    this.togglePlaying = this.togglePlaying.bind(this);
    this.updateAmplitude = this.updateAmplitude.bind(this);
    this.updateTempo = this.updateTempo.bind(this);
    this.setDownloadFileName = this.setDownloadFileName.bind(this);
    this.export = this.export.bind(this);
    this.syncTransportNotes();

    // Sequencer
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
    this.setPatternName = this.setPatternName.bind(this);
    this.setSelectedPattern = this.setSelectedPattern.bind(this);
    this.updateInstrument = this.updateInstrument.bind(this);
    this.setBufferFromFile = this.setBufferFromFile.bind(this);
    this.addPattern = this.addPattern.bind(this);
    this.duplicatePattern = this.duplicatePattern.bind(this);
    this.removePattern = this.removePattern.bind(this);
    this.addPatternRow = this.addPatternRow.bind(this);
    this.removePatternRow = this.removePatternRow.bind(this);
    this.setNoteValue = this.setNoteValue.bind(this);

    // Keyboard
    this.activateKeyboard = this.activateKeyboard.bind(this);
    this.deactivateKeyboard = this.deactivateKeyboard.bind(this);
    this.setKeyboardNotes = this.setKeyboardNotes.bind(this);

    let bufferConfigs = [
      { label: "Instrument 4", url: "bass.wav", },
      { label: "Instrument 5", url: "snare.wav", },
      { label: "Instrument 6", url: "hihat.wav", },
    ];
    this.transport.bufferCollection.addBuffersFromURLs(bufferConfigs, () => {
      this.setState({isLoaded: true});
      this.syncTransportNotes();
    });
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
      transport: {
        enabled: prevState.transport.enabled,
        playing: prevState.transport.playing,
        amplitude: prevState.transport.amplitude,
        tempo: newTempo,
        measure: prevState.transport.measure,
        step: prevState.transport.step,
      }
    }));
    this.transport.setTempo(newTempo);
  };

  updateAmplitude(e) {
    const newAmplitude = parseFloat(e.target.value);

    this.setState((prevState, props) => ({
      transport: {
        enabled: prevState.transport.enabled,
        playing: prevState.transport.playing,
        amplitude: newAmplitude,
        tempo: prevState.transport.tempo,
        measure: prevState.transport.measure,
        step: prevState.transport.step,
      }
    }));
    this.transport.setAmplitude(newAmplitude);
  };

  syncCurrentStep() {
    let newStep = this.transport.currentStep();
    let newMeasure = Math.floor((newStep / 16) % 8);

    this.setState((prevState, props) => ({
      transport: {
        enabled: prevState.transport.enabled,
        playing: prevState.transport.playing,
        amplitude: prevState.transport.amplitude,
        tempo: prevState.transport.tempo,
        measure: newMeasure,
        step: newStep,
      }
    }));
  };

  togglePlaying(e) {
    this.transport.toggle();

    if (!this.state.transport.playing) {
      this.timeoutID = setInterval(() => this.syncCurrentStep(), 15);

      this.setState((prevState, props) => ({
        transport: {
          enabled: prevState.transport.enabled,
          playing: !(prevState.transport.playing),
          amplitude: prevState.transport.amplitude,
          tempo: prevState.transport.tempo,
          measure: prevState.transport.measure,
          step: prevState.transport.step,
        }
      }));
    }
    else {
      clearInterval(this.timeoutID);

      this.setState((prevState, props) => ({
        transport: {
          enabled: prevState.transport.enabled,
          playing: !(prevState.transport.playing),
          amplitude: prevState.transport.amplitude,
          tempo: prevState.transport.tempo,
          measure: undefined,
          step: undefined,
        }
      }));
    }
  };

  syncTransportNotes() {
    let serializedNotes = Serializer.serialize(this.state.tracks, this.state.instruments, this.state.patterns, this.transport.bufferCollection);
    this.songPlayer.replaceNotes(serializedNotes);
    this.offlineSongPlayer.replaceNotes(serializedNotes);
  };

  setTrackName(id, newTrackName) {
    let tracks = this.state.tracks;
    let newTrackList = tracks.concat([]);
    let i;
    for (i = 0; i < newTrackList.length; i++) {
      if (newTrackList[i].id == id) {
        newTrackList[i].name = newTrackName;
      }
    }

    this.setState({
      tracks: newTrackList
    });
  };

  setTrackVolume(id, newTrackVolume) {
    let tracks = this.state.tracks;
    let newTrackList = tracks.concat([]);
    let i;
    for (i = 0; i < newTrackList.length; i++) {
      if (newTrackList[i].id == id) {
        newTrackList[i].volume = newTrackVolume;
      }
    }

    this.setState({
      tracks: newTrackList
    });
    this.syncTransportNotes();
  };

  toggleTrackMute(id, newMutedState) {
    let tracks = this.state.tracks;
    let newTrackList = tracks.concat([]);
    let i;
    for (i = 0; i < newTrackList.length; i++) {
      if (newTrackList[i].id == id) {
        newTrackList[i].muted = newMutedState;
      }
    }

    this.setState({
      tracks: newTrackList
    });
    this.syncTransportNotes();
  };

  setTrackPattern(trackID, measure, patternID) {
    this.trackByID(trackID).patterns[measure].patternID = patternID;
    this.forceUpdate();

    this.syncTransportNotes();
  };

  addGenericTrack(newInstrument) {
    let newTrack = {
      id: this.idGenerator.next(),
      name: 'New Track',
      instrumentID: newInstrument.id,
      muted: false,
      volume: 0.8,
      patterns: [
        { patternID: -1, },
        { patternID: -1, },
        { patternID: -1, },
        { patternID: -1, },
        { patternID: -1, },
        { patternID: -1, },
        { patternID: -1, },
        { patternID: -1, },
      ],
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

    this.setState((prevState, props) => ({
      instruments: prevState.instruments.concat([newInstrument]),
      patterns: prevState.patterns.concat([newPattern]),
      tracks: prevState.tracks.concat([newTrack])
    }),
    function() {
      this.setSelectedTrack(newTrack.id);
    });
  };

  addSynthTrack() {
    let newInstrumentID = this.idGenerator.next();
    let newInstrument = {
      id:                    newInstrumentID,
      type:                  'synth',
      name:                  'Instrument ' + newInstrumentID,
      oscillator1Waveform:   'sawtooth',
      oscillator1Octave:     0,
      oscillator1Amplitude:  1.0,
      oscillator2Waveform:   'square',
      oscillator2Detune:     0,
      oscillator2Octave:     0,
      oscillator2Amplitude:  1.0,
      noiseAmplitude:        0.0,
      lfoWaveform:           'sine',
      lfoFrequency:          5,
      lfoAmplitude:          0,
      filterCutoff:          9950,
      filterResonance:       0,
      filterModulator:       'lfo',
      filterLFOWaveform:     'sine',
      filterLFOFrequency:    5,
      filterLFOAmplitude:    0,
      filterEnvelopeAttack:  0.0,
      filterEnvelopeDecay:   0.0,
      filterEnvelopeSustain: 1.0,
      filterEnvelopeRelease: 0.0,
      envelopeAttack:        0.0,
      envelopeDecay:         0.0,
      envelopeSustain:       1.0,
      envelopeRelease:       0.0,
    };

    this.addGenericTrack(newInstrument);
  };

  addSamplerTrack(file) {
    let newInstrumentID = this.idGenerator.next();
    let label = 'Instrument ' + newInstrumentID;

    this.transport.bufferCollection.addBufferFromFile(label, file, () => {
      let newInstrument = {
        id:                    newInstrumentID,
        type:                  'sample',
        name:                  label,
        sample:                label,
        filename:              file.name,
        loop:                  false,
        filterCutoff:          9950,
        filterResonance:       0,
        filterModulator:       'lfo',
        filterLFOWaveform:     'sine',
        filterLFOFrequency:    5,
        filterLFOAmplitude:    0,
        filterEnvelopeAttack:  0.0,
        filterEnvelopeDecay:   0.0,
        filterEnvelopeSustain: 1.0,
        filterEnvelopeRelease: 0.0,
        envelopeAttack:     0.00,
        envelopeDecay:      0.0,
        envelopeSustain:    1.0,
        envelopeRelease:    0.0,
      };

      this.addGenericTrack(newInstrument);
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
      this.transport.bufferCollection.removeBuffer(removedInstrument.sample);
    }

    this.setState({
      selectedTrackID: newSelectedTrackID,
      selectedPatternID: newSelectedPatternID,
      instruments: newInstruments,
      patterns: newPatterns,
      tracks: newTracks,
    }, function() {
      this.syncTransportNotes();
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
    let i;
    let pattern = this.patternByID(id);
    let patternIndex = this.patternIndexByID(id);
    let newPatterns = this.state.patterns.concat([]);
    let track = this.trackByID(pattern.trackID);
    let trackIndex = this.trackIndexByID(track.id);
    let newTracks = this.state.tracks.concat([]);
    let newTrack = Object.assign({}, track);

    let newSelectedPatternID = this.state.selectedPatternID;

    newPatterns.splice(patternIndex, 1);

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
      this.syncTransportNotes();
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
      this.syncTransportNotes();
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
    this.setState({ selectedPatternID: newSelectedPatternID });
  };

  setPatternName(patternID, newName) {
    this.patternByID(patternID).name = newName;
    this.forceUpdate();
  };

  setNoteValue(noteValue, patternID, rowIndex, noteIndex) {
    let i;
    let pattern = this.patternByID(patternID);

    pattern.rows[rowIndex].notes[noteIndex].name = noteValue;

    if (noteValue === "-") {
      i = noteIndex - 1;
      while (i >= 0 && pattern.rows[rowIndex].notes[i].name === "") {
        pattern.rows[rowIndex].notes[i].name = "-";
        i -= 1;
      }
    }
    else if (noteValue === "") {
      i = noteIndex + 1;
      while (i < pattern.rows[rowIndex].notes.length && pattern.rows[rowIndex].notes[i].name === "-") {
        pattern.rows[rowIndex].notes[i].name = "";
        i += 1;
      }
    }

    this.forceUpdate();
    this.syncTransportNotes();
  };

  updateInstrument(id, field, value) {
    this.instrumentByID(id)[field] = value;
    this.forceUpdate();

    this.syncTransportNotes();
  };

  setBufferFromFile(instrumentID, file) {
    let instrument = this.instrumentByID(instrumentID);
    let label = instrument.sample;

    this.transport.bufferCollection.addBufferFromFile(label, file, () => {
      this.syncTransportNotes();
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
    let newNotes = [];
    let newNoteContexts = [];
    let indicesToRemove = [];
    let instrumentID = this.trackByID(this.state.selectedTrackID).instrumentID;
    let instrument = Serializer.serializeInstrument(this.instrumentByID(instrumentID), this.transport.bufferCollection)

    let newActiveKeyboardNotes = this.state.activeKeyboardNotes.concat([]);
    let newActiveNoteContexts = this.state.activeNoteContexts.concat([]);

    // First, stop notes no longer in the active set
    for (i = 0; i < this.state.activeKeyboardNotes.length; i++) {
      if (!notes.includes(this.state.activeKeyboardNotes[i])) {
        noteContext = this.state.activeNoteContexts[i];
        this.transport.stopNote(instrument, noteContext);
        indicesToRemove.push(i);
      }
    }
    for (i = 0; i < indicesToRemove.length; i++) {
      newActiveKeyboardNotes.splice(indicesToRemove[i], 1);
      newActiveNoteContexts.splice(indicesToRemove[i], 1);
    }

    // Next, start notes newly added to the active set
    for (i = 0; i < notes.length; i++) {
      if (!this.state.activeKeyboardNotes.includes(notes[i])) {
        note = JSSynth.Note(notes[i].split("-")[0], notes[i].split("-")[1], 1);
        noteContext = this.transport.playImmediateNote(instrument, note);

        newActiveKeyboardNotes.push(notes[i]);
        newActiveNoteContexts.push(noteContext);
      }
    }

    // Finally, update state
    this.setState((prevState, props) => ({
      activeKeyboardNotes: newActiveKeyboardNotes,
      activeNoteContexts: newActiveNoteContexts,
    }));
  };

  export() {
    let exportCompleteCallback = function(blob) {
      let url = window.URL.createObjectURL(blob);

      let hiddenDownloadLink = document.getElementById("hidden-download-link");
      hiddenDownloadLink.href = url;
      hiddenDownloadLink.click();

      window.URL.revokeObjectURL(blob);
    };

    let offlineTransport = new JSSynth.OfflineTransport(this.offlineSongPlayer, this.state.transport.tempo, this.state.transport.amplitude, exportCompleteCallback);
    offlineTransport.tick();
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
        <span className="mt1">Loading...</span>
      </div>
      }
      {isLoaded === true &&
      <div>
        <div id="header" className="flex flex-align-center pt1 pb1 pl-half pl1-l pr-half pr1-l border-box full-width">
          <div id="logo-container">
            <h1 className="logo h2 bold mt0 mb0">JS-130</h1>
            <span className="lightText">Web Synthesizer</span>
          </div>
          <Transport enabled={this.state.transport.enabled}
                     playing={this.state.transport.playing}
                     amplitude={this.state.transport.amplitude}
                     tempo={this.state.transport.tempo}
                     togglePlaying={this.togglePlaying}
                     updateAmplitude={this.updateAmplitude}
                     updateTempo={this.updateTempo} />
          <DownloadButton downloadFileName={this.state.downloadFileName} setDownloadFileName={this.setDownloadFileName} export={this.export} />
        </div>
        <Sequencer tracks={this.state.tracks}
                   trackPatternOptions={trackPatternOptions}
                   currentMeasure={this.state.transport.measure}
                   currentStep={this.state.transport.step}
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
                     instrument={instrument}
                     patterns={patterns}
                     setSelectedTrack={this.setSelectedTrack}
                     updateInstrument={this.updateInstrument}
                     setBufferFromFile={this.setBufferFromFile}
                     setSelectedPattern={this.setSelectedPattern}
                     setPatternName={this.setPatternName}
                     addPattern={this.addPattern}
                     duplicatePattern={this.duplicatePattern}
                     removePattern={this.removePattern}
                     addPatternRow={this.addPatternRow}
                     removePatternRow={this.removePatternRow}
                     setNoteValue={this.setNoteValue} />
        <Keyboard active={this.state.keyboardActive}
                  activeNotes={this.state.activeKeyboardNotes}
                  activate={this.activateKeyboard}
                  deactivate={this.deactivateKeyboard}
                  setNotes={this.setKeyboardNotes} />
        <div className="flex flex-column flex-uniform-size flex-justify-end mt2">
          <p className="center mt0 mb1">Made by <a href="http://www.joelstrait.com">Joel Strait</a>, &copy; 2014-18</p>
        </div>
      </div>
      }
    </div>;
  };
};

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
