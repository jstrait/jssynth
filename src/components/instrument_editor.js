"use strict";

import React from "react";

class TabStrip extends React.PureComponent {
  constructor(props) {
    super(props);
  };

  render() {
    return <ul className="tab-strip flex m0 pl0 border-box b-all">
      {this.props.items.map((item) =>
        <TabStripItem key={item.value} label={item.label} value={item.value} isSelected={this.props.selectedValue === item.value} setSelectedValue={this.props.setSelectedValue} />
      )}
    </ul>;
  };
};

class TabStripItem extends React.PureComponent {
  constructor(props) {
    super(props);

    this.setSelectedValue = this.setSelectedValue.bind(this);
  };

  setSelectedValue(e) {
    this.props.setSelectedValue(this.props.value);
  };

  render() {
    return <li className={"tab-strip-item list-style-none flex-uniform-size h4 lh-3 pointer border-box center" + (this.props.isSelected ? " white bg-black" : "")} onClick={this.setSelectedValue}>{this.props.label}</li>;
  };
};

class InstrumentPaneTab extends React.PureComponent {
  constructor(props) {
    super(props);

    this.setSelectedTab = this.setSelectedTab.bind(this);
  };

  setSelectedTab(e) {
    this.props.setSelectedTab(this.props.value);
  };

  render() {
    return <li style={{"flexShrink": 0}} className={"list-style-none pointer mr1 border-box " + (this.props.isSelected ? "pane-tab-selected" : "pane-tab-unselected")} onClick={this.setSelectedTab}>{this.props.label}</li>;
  };
};


class SampleInstrumentEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedTab: "base_sound",
    };

    this.SAMPLE_LOOP_OPTIONS = [
      {label: "Play Once", value: false},
      {label: "Loop", value: true},
    ];

    this.WAVEFORM_OPTIONS = [
      {label: "Sine", value: "sine"},
      {label: "Square", value: "square"},
      {label: "Saw", value: "sawtooth"},
      {label: "Triangle", value: "triangle"},
    ];

    this.close = this.close.bind(this);
    this.setSelectedTab = this.setSelectedTab.bind(this);
    this.showFileChooser = this.showFileChooser.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.setTrackName = this.setTrackName.bind(this);
    this.setLoop = this.setLoop.bind(this);
    this.setRootNoteName = this.setRootNoteName.bind(this);
    this.setRootNoteOctave = this.setRootNoteOctave.bind(this);
    this.setFilterCutoff = this.setFilterCutoff.bind(this);
    this.setFilterResonance = this.setFilterResonance.bind(this);
    this.setFilterLFOAmplitude = this.setFilterLFOAmplitude.bind(this);
    this.setFilterLFOFrequency = this.setFilterLFOFrequency.bind(this);
    this.setFilterLFOWaveForm = this.setFilterLFOWaveForm.bind(this);
    this.setFilterEnvelopeAmount = this.setFilterEnvelopeAmount.bind(this);
    this.setFilterEnvelopeAttackTime = this.setFilterEnvelopeAttackTime.bind(this);
    this.setFilterEnvelopeDecayTime = this.setFilterEnvelopeDecayTime.bind(this);
    this.setFilterEnvelopeSustainPercentage = this.setFilterEnvelopeSustainPercentage.bind(this);
    this.setFilterEnvelopeReleaseTime = this.setFilterEnvelopeReleaseTime.bind(this);
    this.setEnvelopeAttackTime = this.setEnvelopeAttackTime.bind(this);
    this.setEnvelopeDecayTime = this.setEnvelopeDecayTime.bind(this);
    this.setEnvelopeSustainPercentage = this.setEnvelopeSustainPercentage.bind(this);
    this.setEnvelopeReleaseTime = this.setEnvelopeReleaseTime.bind(this);
    this.setDelayTime = this.setDelayTime.bind(this);
    this.setDelayFeedback = this.setDelayFeedback.bind(this);
    this.setReverbWetPercentage = this.setReverbWetPercentage.bind(this);
  };

  close(e) {
    this.props.setSelectedTrack(undefined);
  };

  setSelectedTab(newSelectedTab) {
    this.setState({
      selectedTab: newSelectedTab,
    });
  };

  setTrackName(e) {
    this.props.setTrackName(this.props.trackID, e.target.value);
  };

  showFileChooser(e) {
    this.fileInput.click();
  };

  uploadFile(e) {
    if (this.fileInput.value === "") {
      return;
    }

    this.props.setBufferFromFile(this.props.instrument.id, this.fileInput.files[0]);
  };

  setLoop(newValue) {
    this.props.updateInstrument(this.props.instrument.id, "loop", newValue);
  };

  setRootNoteName(e) {
    this.props.updateInstrument(this.props.instrument.id, "rootNoteName", e.target.value);
  };

  setRootNoteOctave(e) {
    this.props.updateInstrument(this.props.instrument.id, "rootNoteOctave", parseInt(e.target.value, 10));
  };

  setFilterCutoff(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterCutoff", parseInt(e.target.value, 10));
  };

  setFilterResonance(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterResonance", parseInt(e.target.value, 10));
  };

  setFilterLFOAmplitude(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterLFOAmplitude", parseFloat(e.target.value));
  };

  setFilterLFOFrequency(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterLFOFrequency", parseFloat(e.target.value));
  };

  setFilterLFOWaveForm(newValue) {
    this.props.updateInstrument(this.props.instrument.id, "filterLFOWaveform", newValue);
  };

  setFilterEnvelopeAmount(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterEnvelopeAmount", parseFloat(e.target.value));
  };

  setFilterEnvelopeAttackTime(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterEnvelopeAttackTime", parseFloat(e.target.value));
  };

  setFilterEnvelopeDecayTime(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterEnvelopeDecayTime", parseFloat(e.target.value));
  };

  setFilterEnvelopeSustainPercentage(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterEnvelopeSustainPercentage", parseFloat(e.target.value));
  };

  setFilterEnvelopeReleaseTime(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterEnvelopeReleaseTime", parseFloat(e.target.value));
  };

  setEnvelopeAttackTime(e) {
    this.props.updateInstrument(this.props.instrument.id, "envelopeAttackTime", parseFloat(e.target.value));
  };

  setEnvelopeDecayTime(e) {
    this.props.updateInstrument(this.props.instrument.id, "envelopeDecayTime", parseFloat(e.target.value));
  };

  setEnvelopeSustainPercentage(e) {
    this.props.updateInstrument(this.props.instrument.id, "envelopeSustainPercentage", parseFloat(e.target.value));
  };

  setEnvelopeReleaseTime(e) {
    this.props.updateInstrument(this.props.instrument.id, "envelopeReleaseTime", parseFloat(e.target.value));
  };

  setDelayTime(e) {
    this.props.updateInstrument(this.props.instrument.id, "delayTime", parseFloat(e.target.value));
  };

  setDelayFeedback(e) {
    this.props.updateInstrument(this.props.instrument.id, "delayFeedback", parseFloat(e.target.value));
  };

  setReverbWetPercentage(e) {
    this.props.updateInstrument(this.props.instrument.id, "reverbWetPercentage", parseFloat(e.target.value));
  };

  render() {
    return <div>
      <button className="button-link" onClick={this.close}>&larr; Sequencer</button>
      <h2 className="mt0 mb1"><input type="text" value={this.props.trackName} onChange={this.setTrackName} /></h2>
      <ul className="flex pl0 mt0 mb1 overflow-scroll-x full-width display-none-l">
        <InstrumentPaneTab label="Base Sound" value="base_sound" isSelected={this.state.selectedTab === "base_sound"} setSelectedTab={this.setSelectedTab} />
        <InstrumentPaneTab label="Filter" value="filter" isSelected={this.state.selectedTab === "filter"} setSelectedTab={this.setSelectedTab} />
        <InstrumentPaneTab label="Loudness Envelope" value="loudness_envelope" isSelected={this.state.selectedTab === "loudness_envelope"} setSelectedTab={this.setSelectedTab} />
        <InstrumentPaneTab label="Effects" value="effects" isSelected={this.state.selectedTab === "effects"} setSelectedTab={this.setSelectedTab} />
      </ul>
      <div className="flex overflow-scroll-x instrument-panel-container">
        <div className={"pr1 br instrument-panel block-l " + (this.state.selectedTab === "base_sound" ? "" : " display-none")}>
          <h2 className="h3 section-header display-none block-l">Sound File</h2>
          <label className="inline-block control-label">Sound file:</label>
          <span>{this.props.instrument.filename}</span>&nbsp;
          <button className="button-link" onClick={this.showFileChooser}>change</button>
          <input className="display-none" type="file" onChange={this.uploadFile} ref={input => {this.fileInput = input;}} />
          <span className="control">
            <label className="control-label">Root Note:</label>
            <span>
              <select value={this.props.instrument.rootNoteName} onChange={this.setRootNoteName}>
                <option value="A">A</option>
                <option value="A#">A♯</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="C#">C♯</option>
                <option value="D">D</option>
                <option value="D#">D♯</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="F#">F♯</option>
                <option value="G">G</option>
                <option value="G#">G♯</option>
              </select>
              <select value={this.props.instrument.rootNoteOctave} onChange={this.setRootNoteOctave}>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
              </select>
            </span>
          </span>
          <span className="control">
            <label className="control-label">Playback:</label>
            <TabStrip items={this.SAMPLE_LOOP_OPTIONS} selectedValue={this.props.instrument.loop} setSelectedValue={this.setLoop} />
          </span>
        </div>
        <div className={"pl1 pr1 br border-box instrument-panel block-l " + (this.state.selectedTab === "filter" ? "" : " display-none")}>
          <h2 className="h3 section-header display-none block-l">Filter</h2>
          <span className="control">
            <label className="control-label">Cutoff:</label>
            <input type="range" min="50" max="9950" step="50" value={this.props.instrument.filterCutoff} onChange={this.setFilterCutoff} />
            <span className="control-value">{this.props.instrument.filterCutoff}Hz</span>
          </span>
          <span className="control">
            <label className="control-label">Resonance:</label>
            <input type="range" min="0" max="20" step="1.0" value={this.props.instrument.filterResonance} onChange={this.setFilterResonance} />
            <span className="control-value">{this.props.instrument.filterResonance}</span>
          </span>
          <span>
            <span className="block lightText">Cutoff Envelope:</span>
            <span className="control">
              <label className="control-label indented">Amount:</label>
              <input type="range" min="0" max="9950" step="50" value={this.props.instrument.filterEnvelopeAmount} onChange={this.setFilterEnvelopeAmount} />
              <span className="control-value">{this.props.instrument.filterEnvelopeAmount}Hz</span>
            </span>
            <span className="control">
              <label className="control-label indented">Attack Speed:</label>
              <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.filterEnvelopeAttackTime} onChange={this.setFilterEnvelopeAttackTime} />
              <span className="control-value">{this.props.instrument.filterEnvelopeAttackTime * 1000} ms</span>
            </span>
            <span className="control">
              <label className="control-label indented">Decay Speed:</label>
              <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.filterEnvelopeDecayTime} onChange={this.setFilterEnvelopeDecayTime} />
              <span className="control-value">{this.props.instrument.filterEnvelopeDecayTime * 1000} ms</span>
            </span>
            <span className="control">
              <label className="control-label indented">Sustain:</label>
              <input type="range" min="0.0" max="1.0" step="0.01" value={this.props.instrument.filterEnvelopeSustainPercentage} onChange={this.setFilterEnvelopeSustainPercentage} />
              <span className="control-value">{(this.props.instrument.filterEnvelopeSustainPercentage * 100).toFixed(0)}%</span>
            </span>
            <span className="control">
              <label className="control-label indented">Release Speed:</label>
              <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.filterEnvelopeReleaseTime} onChange={this.setFilterEnvelopeReleaseTime} />
              <span className="control-value">{this.props.instrument.filterEnvelopeReleaseTime * 1000} ms</span>
            </span>
          </span>
          <span>
            <span className="block lightText">Cutoff Wobble:</span>
            <span className="control">
              <label className="control-label indented">Amount:</label>
              <input type="range" min="0" max="1200" step="1" value={this.props.instrument.filterLFOAmplitude} onChange={this.setFilterLFOAmplitude} />
              <span className="control-value">{this.props.instrument.filterLFOAmplitude}c</span>
            </span>
            <span className="control">
              <label className="control-label indented">Rate:</label>
              <input type="range" min="0.0" max="20.0" step="0.1" value={this.props.instrument.filterLFOFrequency} onChange={this.setFilterLFOFrequency} />
              <span className="control-value">{this.props.instrument.filterLFOFrequency}Hz</span>
            </span>
            <span className="control">
              <label className="control-label indented">Waveform:</label>
              <TabStrip items={this.WAVEFORM_OPTIONS} selectedValue={this.props.instrument.filterLFOWaveform} setSelectedValue={this.setFilterLFOWaveForm} />
            </span>
          </span>
        </div>
        <div className={"pl1 br border-box instrument-panel block-l " + (this.state.selectedTab === "loudness_envelope" ? "" : " display-none")}>
          <h2 className="h3 section-header display-none block-l">Loudness Envelope</h2>
          <span className="control">
            <label className="control-label">Attack Speed:</label>
            <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.envelopeAttackTime} onChange={this.setEnvelopeAttackTime} />
            <span className="control-value">{this.props.instrument.envelopeAttackTime * 1000} ms</span>
          </span>
          <span className="control">
            <label className="control-label">Decay Speed:</label>
            <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.envelopeDecayTime} onChange={this.setEnvelopeDecayTime} />
            <span className="control-value">{this.props.instrument.envelopeDecayTime * 1000} ms</span>
          </span>
          <span className="control">
            <label className="control-label">Sustain Volume:</label>
            <input type="range" min="0.0" max="1.0" step="0.01" value={this.props.instrument.envelopeSustainPercentage} onChange={this.setEnvelopeSustainPercentage} />
            <span className="control-value">{(this.props.instrument.envelopeSustainPercentage * 100).toFixed(0)}%</span>
          </span>
          <span className="control">
            <label className="control-label">Release Speed:</label>
            <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.envelopeReleaseTime} onChange={this.setEnvelopeReleaseTime} />
            <span className="control-value">{this.props.instrument.envelopeReleaseTime * 1000} ms</span>
          </span>
        </div>
        <div className={"pl1 border-box instrument-panel block-l" + (this.state.selectedTab === "effects" ? "" : " display-none")}>
          <h2 className="h3 section-header display-none block-l">Effects</h2>
          <span className="control">
            <label className="control-label">Delay Time:</label>
            <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.delayTime} onChange={this.setDelayTime} />
            <span className="control-value">{this.props.instrument.delayTime * 1000} ms</span>
          </span>
          <span className="control">
            <label className="control-label">Delay Feedback:</label>
            <input type="range" min="0.0" max="1.0" step="0.01" value={this.props.instrument.delayFeedback} onChange={this.setDelayFeedback} />
            <span className="control-value">{(this.props.instrument.delayFeedback * 100).toFixed(0)}%</span>
          </span>
          <span className="control">
            <label className="control-label">Reverb Amount:</label>
            <input type="range" min="0.0" max="1.0" step="0.01" value={this.props.instrument.reverbWetPercentage} onChange={this.setReverbWetPercentage} />
            <span className="control-value">{(this.props.instrument.reverbWetPercentage * 100).toFixed(0)}%</span>
          </span>
        </div>
      </div>
    </div>;
  };
};


class SynthInstrumentEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedTab: "base_sound",
    };

    this.WAVEFORM_OPTIONS = [
      {label: "Sine", value: "sine"},
      {label: "Square", value: "square"},
      {label: "Saw", value: "sawtooth"},
      {label: "Triangle", value: "triangle"},
    ];

    this.OCTAVE_OPTIONS = [
      {label: "-2", value: -2},
      {label: "-1", value: -1},
      {label: "0", value: 0},
      {label: "+1", value: 1},
      {label: "+2", value: 2},
    ];

    this.NOISE_OPTIONS = [
      {label: "White", value: "white"},
      {label: "Pink", value: "pink"},
    ];

    this.close = this.close.bind(this);
    this.setSelectedTab = this.setSelectedTab.bind(this);
    this.setTrackName = this.setTrackName.bind(this);
    this.setOscillator1Waveform = this.setOscillator1Waveform.bind(this);
    this.setOscillator1Octave = this.setOscillator1Octave.bind(this);
    this.setOscillator1Amplitude = this.setOscillator1Amplitude.bind(this);
    this.setOscillator2Waveform = this.setOscillator2Waveform.bind(this);
    this.setOscillator2Octave = this.setOscillator2Octave.bind(this);
    this.setOscillator2Detune = this.setOscillator2Detune.bind(this);
    this.setOscillator2Amplitude = this.setOscillator2Amplitude.bind(this);
    this.setNoiseAmplitude = this.setNoiseAmplitude.bind(this);
    this.setNoiseType = this.setNoiseType.bind(this);
    this.setLFOAmplitude = this.setLFOAmplitude.bind(this);
    this.setLFOFrequency = this.setLFOFrequency.bind(this);
    this.setLFOWaveForm = this.setLFOWaveForm.bind(this);
    this.setFilterCutoff = this.setFilterCutoff.bind(this);
    this.setFilterResonance = this.setFilterResonance.bind(this);
    this.setFilterLFOAmplitude = this.setFilterLFOAmplitude.bind(this);
    this.setFilterLFOFrequency = this.setFilterLFOFrequency.bind(this);
    this.setFilterLFOWaveForm = this.setFilterLFOWaveForm.bind(this);
    this.setFilterEnvelopeAmount = this.setFilterEnvelopeAmount.bind(this);
    this.setFilterEnvelopeAttackTime = this.setFilterEnvelopeAttackTime.bind(this);
    this.setFilterEnvelopeDecayTime = this.setFilterEnvelopeDecayTime.bind(this);
    this.setFilterEnvelopeSustainPercentage = this.setFilterEnvelopeSustainPercentage.bind(this);
    this.setFilterEnvelopeReleaseTime = this.setFilterEnvelopeReleaseTime.bind(this);
    this.setEnvelopeAttackTime = this.setEnvelopeAttackTime.bind(this);
    this.setEnvelopeDecayTime = this.setEnvelopeDecayTime.bind(this);
    this.setEnvelopeSustainPercentage = this.setEnvelopeSustainPercentage.bind(this);
    this.setEnvelopeReleaseTime = this.setEnvelopeReleaseTime.bind(this);
    this.setDelayTime = this.setDelayTime.bind(this);
    this.setDelayFeedback = this.setDelayFeedback.bind(this);
    this.setReverbWetPercentage = this.setReverbWetPercentage.bind(this);
  };

  close(e) {
    this.props.setSelectedTrack(undefined);
  };

  setSelectedTab(newSelectedTab) {
    this.setState({
      selectedTab: newSelectedTab,
    });
  };

  setTrackName(e) {
    this.props.setTrackName(this.props.trackID, e.target.value);
  };

  setOscillator1Waveform(newValue) {
    this.props.updateInstrument(this.props.instrument.id, "oscillator1Waveform", newValue);
  };

  setOscillator1Octave(newValue) {
    this.props.updateInstrument(this.props.instrument.id, "oscillator1Octave", newValue);
  };

  setOscillator1Amplitude(e) {
    this.props.updateInstrument(this.props.instrument.id, "oscillator1Amplitude", parseFloat(e.target.value));
  };

  setOscillator2Waveform(newValue) {
    this.props.updateInstrument(this.props.instrument.id, "oscillator2Waveform", newValue);
  };

  setOscillator2Octave(newValue) {
    this.props.updateInstrument(this.props.instrument.id, "oscillator2Octave", newValue);
  };

  setOscillator2Detune(e) {
    this.props.updateInstrument(this.props.instrument.id, "oscillator2Detune", parseInt(e.target.value, 10));
  };

  setOscillator2Amplitude(e) {
    this.props.updateInstrument(this.props.instrument.id, "oscillator2Amplitude", parseFloat(e.target.value));
  };

  setNoiseAmplitude(e) {
    this.props.updateInstrument(this.props.instrument.id, "noiseAmplitude", parseFloat(e.target.value));
  };

  setNoiseType(newValue) {
    this.props.updateInstrument(this.props.instrument.id, "noiseType", newValue);
  };

  setLFOAmplitude(e) {
    this.props.updateInstrument(this.props.instrument.id, "lfoAmplitude", parseInt(e.target.value, 10));
  };

  setLFOFrequency(e) {
    this.props.updateInstrument(this.props.instrument.id, "lfoFrequency", parseFloat(e.target.value));
  };

  setLFOWaveForm(newValue) {
    this.props.updateInstrument(this.props.instrument.id, "lfoWaveform", newValue);
  };

  setFilterCutoff(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterCutoff", parseInt(e.target.value, 10));
  };

  setFilterResonance(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterResonance", parseInt(e.target.value, 10));
  };

  setFilterModulator(newValue) {
    this.props.updateInstrument(this.props.instrument.id, "filterModulator", newValue);
  };

  setFilterLFOAmplitude(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterLFOAmplitude", parseFloat(e.target.value));
  };

  setFilterLFOFrequency(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterLFOFrequency", parseFloat(e.target.value));
  };

  setFilterLFOWaveForm(newValue) {
    this.props.updateInstrument(this.props.instrument.id, "filterLFOWaveform", newValue);
  };

  setFilterEnvelopeAmount(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterEnvelopeAmount", parseFloat(e.target.value));
  };

  setFilterEnvelopeAttackTime(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterEnvelopeAttackTime", parseFloat(e.target.value));
  };

  setFilterEnvelopeDecayTime(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterEnvelopeDecayTime", parseFloat(e.target.value));
  };

  setFilterEnvelopeSustainPercentage(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterEnvelopeSustainPercentage", parseFloat(e.target.value));
  };

  setFilterEnvelopeReleaseTime(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterEnvelopeReleaseTime", parseFloat(e.target.value));
  };

  setEnvelopeAttackTime(e) {
    this.props.updateInstrument(this.props.instrument.id, "envelopeAttackTime", parseFloat(e.target.value));
  };

  setEnvelopeDecayTime(e) {
    this.props.updateInstrument(this.props.instrument.id, "envelopeDecayTime", parseFloat(e.target.value));
  };

  setEnvelopeSustainPercentage(e) {
    this.props.updateInstrument(this.props.instrument.id, "envelopeSustainPercentage", parseFloat(e.target.value));
  };

  setEnvelopeReleaseTime(e) {
    this.props.updateInstrument(this.props.instrument.id, "envelopeReleaseTime", parseFloat(e.target.value));
  };

  setDelayTime(e) {
    this.props.updateInstrument(this.props.instrument.id, "delayTime", parseFloat(e.target.value));
  };

  setDelayFeedback(e) {
    this.props.updateInstrument(this.props.instrument.id, "delayFeedback", parseFloat(e.target.value));
  };

  setReverbWetPercentage(e) {
    this.props.updateInstrument(this.props.instrument.id, "reverbWetPercentage", parseFloat(e.target.value));
  };


  render() {
    return <div>
      <button className="button-link" onClick={this.close}>&larr; Sequencer</button>
      <h2 className="mt0 mb1"><input type="text" value={this.props.trackName} onChange={this.setTrackName} /></h2>
      <ul className="flex pl0 mt0 mb1 overflow-scroll-x full-width display-none-l">
        <InstrumentPaneTab label="Base Sound" value="base_sound" isSelected={this.state.selectedTab === "base_sound"} setSelectedTab={this.setSelectedTab} />
        <InstrumentPaneTab label="Filter" value="filter" isSelected={this.state.selectedTab === "filter"} setSelectedTab={this.setSelectedTab} />
        <InstrumentPaneTab label="Pitch Wobble" value="pitch_wobble" isSelected={this.state.selectedTab === "pitch_wobble"} setSelectedTab={this.setSelectedTab} />
        <InstrumentPaneTab label="Loudness Envelope" value="loudness_envelope" isSelected={this.state.selectedTab === "loudness_envelope"} setSelectedTab={this.setSelectedTab} />
        <InstrumentPaneTab label="Effects" value="effects" isSelected={this.state.selectedTab === "effects"} setSelectedTab={this.setSelectedTab} />
      </ul>
      <div className="flex overflow-scroll-x instrument-panel-container">
        <div className={"pr1 br instrument-panel block-l" + (this.state.selectedTab === "base_sound" ? "" : " display-none")}>
          <h2 className="h3 section-header display-none block-l">Sound Generator</h2>
          <span className="block lightText">Base:</span>
          <span className="control">
            <label className="control-label indented">Waveform:</label>
            <TabStrip items={this.WAVEFORM_OPTIONS} selectedValue={this.props.instrument.oscillator1Waveform} setSelectedValue={this.setOscillator1Waveform} />
          </span>
          <span className="control">
            <label className="control-label indented">Octave:</label>
            <TabStrip items={this.OCTAVE_OPTIONS} selectedValue={this.props.instrument.oscillator1Octave} setSelectedValue={this.setOscillator1Octave} />
          </span>
          <span className="control">
            <label className="control-label indented">Volume:</label>
            <input type="range" min="0" max="1" step="0.01" value={this.props.instrument.oscillator1Amplitude} onChange={this.setOscillator1Amplitude} />
            <span className="control-value">{(this.props.instrument.oscillator1Amplitude * 100).toFixed(0)}%</span>
          </span>
          <span className="block lightText">Secondary:</span>
          <span className="control">
            <label className="control-label indented">Waveform:</label>
            <TabStrip items={this.WAVEFORM_OPTIONS} selectedValue={this.props.instrument.oscillator2Waveform} setSelectedValue={this.setOscillator2Waveform} />
          </span>
          <span className="control">
            <label className="control-label indented">Octave:</label>
            <TabStrip items={this.OCTAVE_OPTIONS} selectedValue={this.props.instrument.oscillator2Octave} setSelectedValue={this.setOscillator2Octave} />
          </span>
          <span className="control">
            <label className="control-label indented">Detune:</label>
            <input type="range" min="-700" max="700" step="1" value={this.props.instrument.oscillator2Detune} onChange={this.setOscillator2Detune} />
            <span className="control-value">{this.props.instrument.oscillator2Detune}c</span>
          </span>
          <span className="control">
            <label className="control-label indented">Volume:</label>
            <input type="range" min="0" max="1" step="0.01" value={this.props.instrument.oscillator2Amplitude} onChange={this.setOscillator2Amplitude} />
            <span className="control-value">{(this.props.instrument.oscillator2Amplitude * 100).toFixed(0)}%</span>
          </span>
          <span className="block lightText">Noise:</span>
          <span className="control">
            <label className="control-label indented">Volume:</label>
            <input type="range" min="0" max="1" step="0.01" value={this.props.instrument.noiseAmplitude} onChange={this.setNoiseAmplitude} />
            <span className="control-value">{(this.props.instrument.noiseAmplitude * 100).toFixed(0)}%</span>
          </span>
          <span className="control">
            <label className="control-label indented">Type:</label>
            <TabStrip items={this.NOISE_OPTIONS} selectedValue={this.props.instrument.noiseType} setSelectedValue={this.setNoiseType} />
          </span>
        </div>

        <div className={"pl1 pr1 br border-box instrument-panel block-l" + (this.state.selectedTab === "filter" ? "" : " display-none")}>
          <h2 className="h3 section-header display-none block-l">Filter</h2>
          <span className="control">
            <label className="control-label">Cutoff:</label>
              <input type="range" min="50" max="9950" step="50" value={this.props.instrument.filterCutoff} onChange={this.setFilterCutoff} />
              <span className="control-value">{this.props.instrument.filterCutoff}Hz</span>
          </span>
          <span className="control">
            <label className="control-label">Resonance:</label>
            <input type="range" min="0" max="20" step="1.0" value={this.props.instrument.filterResonance} onChange={this.setFilterResonance} />
            <span className="control-value">{this.props.instrument.filterResonance}</span>
          </span>
          <span>
            <span className="block lightText">Cutoff Envelope:</span>
            <span className="control">
              <label className="control-label indented">Attack Target:</label>
              <input type="range" min="0" max="9950" step="50" value={this.props.instrument.filterEnvelopeAmount} onChange={this.setFilterEnvelopeAmount} />
              <span className="control-value">{this.props.instrument.filterEnvelopeAmount + this.props.instrument.filterCutoff}Hz</span>
            </span>
            <span className="control">
              <label className="control-label indented">Attack Speed:</label>
              <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.filterEnvelopeAttackTime} onChange={this.setFilterEnvelopeAttackTime} />
              <span className="control-value">{this.props.instrument.filterEnvelopeAttackTime * 1000} ms</span>
            </span>
            <span className="control">
              <label className="control-label indented">Decay Speed:</label>
              <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.filterEnvelopeDecayTime} onChange={this.setFilterEnvelopeDecayTime} />
              <span className="control-value">{this.props.instrument.filterEnvelopeDecayTime * 1000} ms</span>
            </span>
            <span className="control">
              <label className="control-label indented">Sustain:</label>
              <input type="range" min="0.0" max="1.0" step="0.01" value={this.props.instrument.filterEnvelopeSustainPercentage} onChange={this.setFilterEnvelopeSustainPercentage} />
              <span className="control-value">{(this.props.instrument.filterEnvelopeSustainPercentage * 100).toFixed(0)}%</span>
            </span>
            <span className="control">
              <label className="control-label indented">Release Speed:</label>
              <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.filterEnvelopeReleaseTime} onChange={this.setFilterEnvelopeReleaseTime} />
              <span className="control-value">{this.props.instrument.filterEnvelopeReleaseTime * 1000} ms</span>
            </span>
          </span>
          <span>
            <span className="block lightText">Cutoff Wobble:</span>
            <span className="control">
              <label className="control-label indented">Amount:</label>
              <input type="range" min="0" max="1200" step="1" value={this.props.instrument.filterLFOAmplitude} onChange={this.setFilterLFOAmplitude} />
              <span className="control-value">{this.props.instrument.filterLFOAmplitude}c</span>
            </span>
            <span className="control">
              <label className="control-label indented">Rate:</label>
              <input type="range" min="0.0" max="20.0" step="0.1" value={this.props.instrument.filterLFOFrequency} onChange={this.setFilterLFOFrequency} />
              <span className="control-value">{this.props.instrument.filterLFOFrequency}Hz</span>
            </span>
            <span className="control">
              <label className="control-label indented">Waveform:</label>
              <TabStrip items={this.WAVEFORM_OPTIONS} selectedValue={this.props.instrument.filterLFOWaveform} setSelectedValue={this.setFilterLFOWaveForm} />
            </span>
          </span>
        </div>

        <div className="pr1-l br-l">
          <div className={"pl1 border-box instrument-panel block-l" + (this.state.selectedTab === "pitch_wobble" ? "" : " display-none")}>
            <h2 className="h3 section-header display-none block-l">Pitch Wobble</h2>
            <span className="control">
              <label className="control-label">Amount:</label>
              <input type="range" min="0" max="1200" step="1" value={this.props.instrument.lfoAmplitude} onChange={this.setLFOAmplitude} />
              <span className="control-value">{this.props.instrument.lfoAmplitude}c</span>
            </span>
            <span className="control">
              <label className="control-label">Rate:</label>
              <input type="range" min="0.0" max="20.0" step="0.1" value={this.props.instrument.lfoFrequency} onChange={this.setLFOFrequency} />
              <span className="control-value">{this.props.instrument.lfoFrequency}Hz</span>
            </span>
            <span className="control">
              <label className="control-label">Waveform:</label>
              <TabStrip items={this.WAVEFORM_OPTIONS} selectedValue={this.props.instrument.lfoWaveform} setSelectedValue={this.setLFOWaveForm} />
            </span>
          </div>

          <div className={"pl1 border-box instrument-panel block-l" + (this.state.selectedTab === "loudness_envelope" ? "" : " display-none")}>
            <h2 className="h3 section-header display-none block-l">Loudness Envelope</h2>
            <span className="control">
              <label className="control-label">Attack Speed:</label>
              <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.envelopeAttackTime} onChange={this.setEnvelopeAttackTime} />
              <span className="control-value">{this.props.instrument.envelopeAttackTime * 1000} ms</span>
            </span>
            <span className="control">
              <label className="control-label">Decay Speed:</label>
              <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.envelopeDecayTime} onChange={this.setEnvelopeDecayTime} />
              <span className="control-value">{this.props.instrument.envelopeDecayTime * 1000} ms</span>
            </span>
            <span className="control">
              <label className="control-label">Sustain Volume:</label>
              <input type="range" min="0.0" max="1.0" step="0.01" value={this.props.instrument.envelopeSustainPercentage} onChange={this.setEnvelopeSustainPercentage} />
              <span className="control-value">{(this.props.instrument.envelopeSustainPercentage * 100).toFixed(0)}%</span>
            </span>
            <span className="control">
              <label className="control-label">Release Speed:</label>
              <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.envelopeReleaseTime} onChange={this.setEnvelopeReleaseTime} />
              <span className="control-value">{this.props.instrument.envelopeReleaseTime * 1000} ms</span>
            </span>
          </div>
        </div>

        <div className={"pl1 border-box instrument-panel block-l" + (this.state.selectedTab === "effects" ? "" : " display-none")}>
          <h2 className="h3 section-header display-none block-l">Effects</h2>
          <span className="control">
            <label className="control-label">Delay Time:</label>
            <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.delayTime} onChange={this.setDelayTime} />
            <span className="control-value">{this.props.instrument.delayTime * 1000} ms</span>
          </span>
          <span className="control">
            <label className="control-label">Delay Feedback:</label>
            <input type="range" min="0.0" max="1.0" step="0.01" value={this.props.instrument.delayFeedback} onChange={this.setDelayFeedback} />
            <span className="control-value">{(this.props.instrument.delayFeedback * 100).toFixed(0)}%</span>
          </span>
          <span className="control">
            <label className="control-label">Reverb Amount:</label>
            <input type="range" min="0.0" max="1.0" step="0.01" value={this.props.instrument.reverbWetPercentage} onChange={this.setReverbWetPercentage} />
            <span className="control-value">{(this.props.instrument.reverbWetPercentage * 100).toFixed(0)}%</span>
          </span>
        </div>
      </div>
    </div>;
  };
};

export { SynthInstrumentEditor, SampleInstrumentEditor };
