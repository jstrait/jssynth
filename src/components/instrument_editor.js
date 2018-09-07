"use strict";

import React from 'react';

class TabStrip extends React.Component {
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

class TabStripItem extends React.Component {
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

class InstrumentPaneTab extends React.Component {
  constructor(props) {
    super(props);

    this.setSelectedTab = this.setSelectedTab.bind(this);
  };

  setSelectedTab(e) {
    this.props.setSelectedTab(this.props.value);
  };

  render() {
    return <li style={{"flexShrink": 0}} className={"list-style-none pointer mr1 border-box " + (this.props.isSelected ? "paneTabSelected" : "paneTabUnselected")} onClick={this.setSelectedTab}>{this.props.label}</li>;
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

    this.FILTER_MODULATION_OPTIONS = [
      {label: "Wobble", value: "lfo"},
      {label: "Envelope", value: "envelope"},
    ];

    this.setSelectedTab = this.setSelectedTab.bind(this);
    this.showFileChooser = this.showFileChooser.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.setLoop = this.setLoop.bind(this);
    this.setRootNoteName = this.setRootNoteName.bind(this);
    this.setRootNoteOctave = this.setRootNoteOctave.bind(this);
    this.setFilterCutoff = this.setFilterCutoff.bind(this);
    this.setFilterResonance = this.setFilterResonance.bind(this);
    this.setFilterModulator = this.setFilterModulator.bind(this);
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
  };

  setSelectedTab(newSelectedTab) {
    this.setState({
      selectedTab: newSelectedTab,
    });
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

  render() {
    return <div>
      <ul className="flex pl0 mt0 mb1 overflow-scroll-x full-width display-none-l">
        <InstrumentPaneTab label="Base Sound" value="base_sound" isSelected={this.state.selectedTab === "base_sound"} setSelectedTab={this.setSelectedTab} />
        <InstrumentPaneTab label="Filter" value="filter" isSelected={this.state.selectedTab === "filter"} setSelectedTab={this.setSelectedTab} />
        <InstrumentPaneTab label="Loudness Envelope" value="loudness_envelope" isSelected={this.state.selectedTab === "loudness_envelope"} setSelectedTab={this.setSelectedTab} />
      </ul>
      <div className="flex overflow-scroll-x instrument-panel-container">
        <div className={"pr1 br instrument-panel block-l " + (this.state.selectedTab === "base_sound" ? "" : " display-none")}>
          <h2 className="h3 section-header display-none block-l">Sound File</h2>
          <label className="inline-block control-label">Sound file:</label>
          <span>{this.props.instrument.filename}</span>&nbsp;
          <a href="javascript:void(0);" className="h4" onClick={this.showFileChooser}>change</a>
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
            <span className="annotated-input">
              <input type="range" min="50" max="9950" step="50" value={this.props.instrument.filterCutoff} onChange={this.setFilterCutoff} />
              <span>{this.props.instrument.filterCutoff}Hz</span>
            </span>
          </span>
          <span className="control">
            <label className="control-label">Resonance:</label>
            <span className="annotated-input">
              <input type="range" min="0" max="20" step="1.0" value={this.props.instrument.filterResonance} onChange={this.setFilterResonance} />
              <span>{this.props.instrument.filterResonance}</span>
            </span>
          </span>
          <span className="control">
            <label className="control-label">Modulation:</label>
            <TabStrip items={this.FILTER_MODULATION_OPTIONS} selectedValue={this.props.instrument.filterModulator} setSelectedValue={this.setFilterModulator} />
          </span>
          <span className={(this.props.instrument.filterModulator === "lfo" ? "" : "display-none" )}>
            <span className="block mt1 lightText">Cutoff Wobble:</span>
            <span className="control">
              <label className="control-label indented">Amount:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="1.0" step="0.01" value={this.props.instrument.filterLFOAmplitude} onChange={this.setFilterLFOAmplitude} />
                <span>{(this.props.instrument.filterLFOAmplitude * 100).toFixed(0)}%</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label indented">Rate:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="20.0" step="0.1" value={this.props.instrument.filterLFOFrequency} onChange={this.setFilterLFOFrequency} />
                <span>{this.props.instrument.filterLFOFrequency}Hz</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label indented">Waveform:</label>
              <TabStrip items={this.WAVEFORM_OPTIONS} selectedValue={this.props.instrument.filterLFOWaveform} setSelectedValue={this.setFilterLFOWaveForm} />
            </span>
          </span>
          <span className={(this.props.instrument.filterModulator === "lfo" ? "display-none" : "" )}>
            <span className="block mt1 lightText">Cutoff Envelope:</span>
            <span className="control">
              <label className="control-label indented">Amount:</label>
              <span className="annotated-input">
                <input type="range" min="0" max="9950" step="50" value={this.props.instrument.filterEnvelopeAmount} onChange={this.setFilterEnvelopeAmount} />
                <span>{this.props.instrument.filterEnvelopeAmount}Hz</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label indented">Attack Speed:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.filterEnvelopeAttackTime} onChange={this.setFilterEnvelopeAttackTime} />
                <span>{this.props.instrument.filterEnvelopeAttackTime * 1000} ms</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label indented">Decay Speed:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.filterEnvelopeDecayTime} onChange={this.setFilterEnvelopeDecayTime} />
                <span>{this.props.instrument.filterEnvelopeDecayTime * 1000} ms</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label indented">Sustain:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="1.0" step="0.01" value={this.props.instrument.filterEnvelopeSustainPercentage} onChange={this.setFilterEnvelopeSustainPercentage} />
                <span>{(this.props.instrument.filterEnvelopeSustainPercentage * 100).toFixed(0)}%</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label indented">Release Speed:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.filterEnvelopeReleaseTime} onChange={this.setFilterEnvelopeReleaseTime} />
                <span>{this.props.instrument.filterEnvelopeReleaseTime * 1000} ms</span>
              </span>
            </span>
          </span>
        </div>
        <div className={"pl1 border-box instrument-panel block-l " + (this.state.selectedTab === "loudness_envelope" ? "" : " display-none")}>
          <h2 className="h3 section-header display-none block-l">Loudness Envelope</h2>
          <span className="control">
            <label className="control-label">Attack Speed:</label>
            <span className="annotated-input">
              <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.envelopeAttackTime} onChange={this.setEnvelopeAttackTime} />
              <span>{this.props.instrument.envelopeAttackTime * 1000} ms</span>
            </span>
          </span>
          <span className="control">
            <label className="control-label">Decay Speed:</label>
            <span className="annotated-input">
              <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.envelopeDecayTime} onChange={this.setEnvelopeDecayTime} />
              <span>{this.props.instrument.envelopeDecayTime * 1000} ms</span>
            </span>
          </span>
          <span className="control">
            <label className="control-label">Sustain Volume:</label>
            <span className="annotated-input">
              <input type="range" min="0.0" max="1.0" step="0.01" value={this.props.instrument.envelopeSustainPercentage} onChange={this.setEnvelopeSustainPercentage} />
              <span>{(this.props.instrument.envelopeSustainPercentage * 100).toFixed(0)}%</span>
            </span>
          </span>
          <span className="control">
            <label className="control-label">Release Speed:</label>
            <span className="annotated-input">
              <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.envelopeReleaseTime} onChange={this.setEnvelopeReleaseTime} />
              <span>{this.props.instrument.envelopeReleaseTime * 1000} ms</span>
            </span>
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

    this.FILTER_MODULATION_OPTIONS = [
      {label: "Wobble", value: "lfo"},
      {label: "Envelope", value: "envelope"},
    ];

    this.setSelectedTab = this.setSelectedTab.bind(this);
    this.setOscillator1Waveform = this.setOscillator1Waveform.bind(this);
    this.setOscillator1Octave = this.setOscillator1Octave.bind(this);
    this.setOscillator1Amplitude = this.setOscillator1Amplitude.bind(this);
    this.setOscillator2Waveform = this.setOscillator2Waveform.bind(this);
    this.setOscillator2Octave = this.setOscillator2Octave.bind(this);
    this.setOscillator2Detune = this.setOscillator2Detune.bind(this);
    this.setOscillator2Amplitude = this.setOscillator2Amplitude.bind(this);
    this.setNoiseAmplitude = this.setNoiseAmplitude.bind(this);
    this.setLFOAmplitude = this.setLFOAmplitude.bind(this);
    this.setLFOFrequency = this.setLFOFrequency.bind(this);
    this.setLFOWaveForm = this.setLFOWaveForm.bind(this);
    this.setFilterCutoff = this.setFilterCutoff.bind(this);
    this.setFilterResonance = this.setFilterResonance.bind(this);
    this.setFilterModulator = this.setFilterModulator.bind(this);
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
  };

  setSelectedTab(newSelectedTab) {
    this.setState({
      selectedTab: newSelectedTab,
    });
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


  render() {
    return <div>
      <ul className="flex pl0 mt0 mb1 overflow-scroll-x full-width display-none-l">
        <InstrumentPaneTab label="Base Sound" value="base_sound" isSelected={this.state.selectedTab === "base_sound"} setSelectedTab={this.setSelectedTab} />
        <InstrumentPaneTab label="Filter" value="filter" isSelected={this.state.selectedTab === "filter"} setSelectedTab={this.setSelectedTab} />
        <InstrumentPaneTab label="Pitch Wobble" value="pitch_wobble" isSelected={this.state.selectedTab === "pitch_wobble"} setSelectedTab={this.setSelectedTab} />
        <InstrumentPaneTab label="Loudness Envelope" value="loudness_envelope" isSelected={this.state.selectedTab === "loudness_envelope"} setSelectedTab={this.setSelectedTab} />
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
            <span className="annotated-input">
              <input type="range" min="0" max="1" step="0.01" value={this.props.instrument.oscillator1Amplitude} onChange={this.setOscillator1Amplitude} />
              <span>{(this.props.instrument.oscillator1Amplitude * 100).toFixed(0)}%</span>
            </span>
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
            <span className="annotated-input">
              <input type="range" min="-700" max="700" step="1" value={this.props.instrument.oscillator2Detune} onChange={this.setOscillator2Detune} />
              <span>{this.props.instrument.oscillator2Detune}c</span>
            </span>
          </span>
          <span className="control">
            <label className="control-label indented">Volume:</label>
            <span className="annotated-input">
              <input type="range" min="0" max="1" step="0.01" value={this.props.instrument.oscillator2Amplitude} onChange={this.setOscillator2Amplitude} />
              <span>{(this.props.instrument.oscillator2Amplitude * 100).toFixed(0)}%</span>
            </span>
          </span>
          <span className="block lightText">Noise:</span>
          <span className="control">
            <label className="control-label indented">Volume:</label>
            <span className="annotated-input">
              <input type="range" min="0" max="1" step="0.01" value={this.props.instrument.noiseAmplitude} onChange={this.setNoiseAmplitude} />
              <span>{(this.props.instrument.noiseAmplitude * 100).toFixed(0)}%</span>
            </span>
          </span>
        </div>

        <div className={"pl1 pr1 br border-box instrument-panel block-l" + (this.state.selectedTab === "filter" ? "" : " display-none")}>
          <h2 className="h3 section-header display-none block-l">Filter</h2>
          <span className="control">
            <label className="control-label">Cutoff:</label>
            <span className="annotated-input">
              <input type="range" min="50" max="9950" step="50" value={this.props.instrument.filterCutoff} onChange={this.setFilterCutoff} />
              <span>{this.props.instrument.filterCutoff}Hz</span>
            </span>
          </span>
          <span className="control">
            <label className="control-label">Resonance:</label>
            <span className="annotated-input">
              <input type="range" min="0" max="20" step="1.0" value={this.props.instrument.filterResonance} onChange={this.setFilterResonance} />
              <span>{this.props.instrument.filterResonance}</span>
            </span>
          </span>
          <span className="control">
            <label className="control-label">Modulation:</label>
            <TabStrip items={this.FILTER_MODULATION_OPTIONS} selectedValue={this.props.instrument.filterModulator} setSelectedValue={this.setFilterModulator} />
          </span>
          <span className={(this.props.instrument.filterModulator === "lfo" ? "" : "display-none" )}>
            <span className="block mt1 lightText">Cutoff Wobble:</span>
            <span className="control">
              <label className="control-label indented">Amount:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="1.0" step="0.01" value={this.props.instrument.filterLFOAmplitude} onChange={this.setFilterLFOAmplitude} />
                <span>{(this.props.instrument.filterLFOAmplitude * 100).toFixed(0)}%</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label indented">Rate:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="20.0" step="0.1" value={this.props.instrument.filterLFOFrequency} onChange={this.setFilterLFOFrequency} />
                <span>{this.props.instrument.filterLFOFrequency}Hz</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label indented">Waveform:</label>
              <TabStrip items={this.WAVEFORM_OPTIONS} selectedValue={this.props.instrument.filterLFOWaveform} setSelectedValue={this.setFilterLFOWaveForm} />
            </span>
          </span>
          <span className={(this.props.instrument.filterModulator === "lfo" ? "display-none" : "" )}>
            <span className="block mt1 lightText">Cutoff Envelope:</span>
            <span className="control">
              <label className="control-label indented">Amount:</label>
              <span className="annotated-input">
                <input type="range" min="0" max="9950" step="50" value={this.props.instrument.filterEnvelopeAmount} onChange={this.setFilterEnvelopeAmount} />
                <span>{this.props.instrument.filterEnvelopeAmount}Hz</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label indented">Attack Speed:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.filterEnvelopeAttackTime} onChange={this.setFilterEnvelopeAttackTime} />
                <span>{this.props.instrument.filterEnvelopeAttackTime * 1000} ms</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label indented">Decay Speed:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.filterEnvelopeDecayTime} onChange={this.setFilterEnvelopeDecayTime} />
                <span>{this.props.instrument.filterEnvelopeDecayTime * 1000} ms</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label indented">Sustain:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="1.0" step="0.01" value={this.props.instrument.filterEnvelopeSustainPercentage} onChange={this.setFilterEnvelopeSustainPercentage} />
                <span>{(this.props.instrument.filterEnvelopeSustainPercentage * 100).toFixed(0)}%</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label indented">Release Speed:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.filterEnvelopeReleaseTime} onChange={this.setFilterEnvelopeReleaseTime} />
                <span>{this.props.instrument.filterEnvelopeReleaseTime * 1000} ms</span>
              </span>
            </span>
          </span>
        </div>

        <div>
          <div className={"pl1 border-box instrument-panel block-l" + (this.state.selectedTab === "pitch_wobble" ? "" : " display-none")}>
            <h2 className="h3 section-header display-none block-l">Pitch Wobble</h2>
            <span className="control">
              <label className="control-label">Amount:</label>
              <span className="annotated-input">
                <input type="range" min="0" max="1200" step="1" value={this.props.instrument.lfoAmplitude} onChange={this.setLFOAmplitude} />
                <span>{this.props.instrument.lfoAmplitude}c</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label">Rate:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="20.0" step="0.1" value={this.props.instrument.lfoFrequency} onChange={this.setLFOFrequency} />
                <span>{this.props.instrument.lfoFrequency}Hz</span>
              </span>
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
              <span className="annotated-input">
                <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.envelopeAttackTime} onChange={this.setEnvelopeAttackTime} />
                <span>{this.props.instrument.envelopeAttackTime * 1000} ms</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label">Decay Speed:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.envelopeDecayTime} onChange={this.setEnvelopeDecayTime} />
                <span>{this.props.instrument.envelopeDecayTime * 1000} ms</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label">Sustain Volume:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="1.0" step="0.01" value={this.props.instrument.envelopeSustainPercentage} onChange={this.setEnvelopeSustainPercentage} />
                <span>{(this.props.instrument.envelopeSustainPercentage * 100).toFixed(0)}%</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label">Release Speed:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.envelopeReleaseTime} onChange={this.setEnvelopeReleaseTime} />
                <span>{this.props.instrument.envelopeReleaseTime * 1000} ms</span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>;
  };
};

export { SynthInstrumentEditor, SampleInstrumentEditor };
