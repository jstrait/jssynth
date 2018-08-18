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
    this.setFilterCutoff = this.setFilterCutoff.bind(this);
    this.setFilterResonance = this.setFilterResonance.bind(this);
    this.setFilterModulator = this.setFilterModulator.bind(this);
    this.setFilterLFOAmplitude = this.setFilterLFOAmplitude.bind(this);
    this.setFilterLFOFrequency = this.setFilterLFOFrequency.bind(this);
    this.setFilterLFOWaveForm = this.setFilterLFOWaveForm.bind(this);
    this.setFilterEnvelopeAttack = this.setFilterEnvelopeAttack.bind(this);
    this.setFilterEnvelopeDecay = this.setFilterEnvelopeDecay.bind(this);
    this.setFilterEnvelopeSustain = this.setFilterEnvelopeSustain.bind(this);
    this.setFilterEnvelopeRelease = this.setFilterEnvelopeRelease.bind(this);
    this.setEnvelopeAttack = this.setEnvelopeAttack.bind(this);
    this.setEnvelopeDecay = this.setEnvelopeDecay.bind(this);
    this.setEnvelopeSustain = this.setEnvelopeSustain.bind(this);
    this.setEnvelopeRelease = this.setEnvelopeRelease.bind(this);
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

  setLoop(e) {
    this.props.updateInstrument(this.props.instrument.id, "loop", e.target.checked);
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

  setFilterEnvelopeAttack(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterEnvelopeAttack", parseFloat(e.target.value));
  };

  setFilterEnvelopeDecay(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterEnvelopeDecay", parseFloat(e.target.value));
  };

  setFilterEnvelopeSustain(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterEnvelopeSustain", parseFloat(e.target.value));
  };

  setFilterEnvelopeRelease(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterEnvelopeRelease", parseFloat(e.target.value));
  };

  setEnvelopeAttack(e) {
    this.props.updateInstrument(this.props.instrument.id, "envelopeAttack", parseFloat(e.target.value));
  };

  setEnvelopeDecay(e) {
    this.props.updateInstrument(this.props.instrument.id, "envelopeDecay", parseFloat(e.target.value));
  };

  setEnvelopeSustain(e) {
    this.props.updateInstrument(this.props.instrument.id, "envelopeSustain", parseFloat(e.target.value));
  };

  setEnvelopeRelease(e) {
    this.props.updateInstrument(this.props.instrument.id, "envelopeRelease", parseFloat(e.target.value));
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
            <label className="control-label">Loop:</label>
            <input type="checkbox" checked={this.props.instrument.loop === true} onChange={this.setLoop} />
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
              <label className="control-label indented">Attack Speed:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.filterEnvelopeAttack} onChange={this.setFilterEnvelopeAttack} />
                <span>{this.props.instrument.filterEnvelopeAttack * 1000} ms</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label indented">Decay Speed:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.filterEnvelopeDecay} onChange={this.setFilterEnvelopeDecay} />
                <span>{this.props.instrument.filterEnvelopeDecay * 1000} ms</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label indented">Sustain:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="1.0" step="0.01" value={this.props.instrument.filterEnvelopeSustain} onChange={this.setFilterEnvelopeSustain} />
                <span>{(this.props.instrument.filterEnvelopeSustain * 100).toFixed(0)}%</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label indented">Release Speed:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.filterEnvelopeRelease} onChange={this.setFilterEnvelopeRelease} />
                <span>{this.props.instrument.filterEnvelopeRelease * 1000} ms</span>
              </span>
            </span>
          </span>
        </div>
        <div className={"pl1 border-box instrument-panel block-l " + (this.state.selectedTab === "loudness_envelope" ? "" : " display-none")}>
          <h2 className="h3 section-header display-none block-l">Loudness Envelope</h2>
          <span className="control">
            <label className="control-label">Attack Speed:</label>
            <span className="annotated-input">
              <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.envelopeAttack} onChange={this.setEnvelopeAttack} />
              <span>{this.props.instrument.envelopeAttack * 1000} ms</span>
            </span>
          </span>
          <span className="control">
            <label className="control-label">Decay Speed:</label>
            <span className="annotated-input">
              <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.envelopeDecay} onChange={this.setEnvelopeDecay} />
              <span>{this.props.instrument.envelopeDecay * 1000} ms</span>
            </span>
          </span>
          <span className="control">
            <label className="control-label">Sustain Volume:</label>
            <span className="annotated-input">
              <input type="range" min="0.0" max="1.0" step="0.01" value={this.props.instrument.envelopeSustain} onChange={this.setEnvelopeSustain} />
              <span>{(this.props.instrument.envelopeSustain * 100).toFixed(0)}%</span>
            </span>
          </span>
          <span className="control">
            <label className="control-label">Release Speed:</label>
            <span className="annotated-input">
              <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.envelopeRelease} onChange={this.setEnvelopeRelease} />
              <span>{this.props.instrument.envelopeRelease * 1000} ms</span>
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
    this.setWaveForm1 = this.setWaveForm1.bind(this);
    this.setWaveForm2 = this.setWaveForm2.bind(this);
    this.setWaveForm1Octave = this.setWaveForm1Octave.bind(this);
    this.setWaveForm1Amplitude = this.setWaveForm1Amplitude.bind(this);
    this.setWaveForm2Octave = this.setWaveForm2Octave.bind(this);
    this.setWaveForm2Detune = this.setWaveForm2Detune.bind(this);
    this.setWaveForm2Amplitude = this.setWaveForm2Amplitude.bind(this);
    this.setLFOAmplitude = this.setLFOAmplitude.bind(this);
    this.setLFOFrequency = this.setLFOFrequency.bind(this);
    this.setLFOWaveForm = this.setLFOWaveForm.bind(this);
    this.setFilterCutoff = this.setFilterCutoff.bind(this);
    this.setFilterResonance = this.setFilterResonance.bind(this);
    this.setFilterModulator = this.setFilterModulator.bind(this);
    this.setFilterLFOAmplitude = this.setFilterLFOAmplitude.bind(this);
    this.setFilterLFOFrequency = this.setFilterLFOFrequency.bind(this);
    this.setFilterLFOWaveForm = this.setFilterLFOWaveForm.bind(this);
    this.setFilterEnvelopeAttack = this.setFilterEnvelopeAttack.bind(this);
    this.setFilterEnvelopeDecay = this.setFilterEnvelopeDecay.bind(this);
    this.setFilterEnvelopeSustain = this.setFilterEnvelopeSustain.bind(this);
    this.setFilterEnvelopeRelease = this.setFilterEnvelopeRelease.bind(this);
    this.setEnvelopeAttack = this.setEnvelopeAttack.bind(this);
    this.setEnvelopeDecay = this.setEnvelopeDecay.bind(this);
    this.setEnvelopeSustain = this.setEnvelopeSustain.bind(this);
    this.setEnvelopeRelease = this.setEnvelopeRelease.bind(this);
  };

  setSelectedTab(newSelectedTab) {
    this.setState({
      selectedTab: newSelectedTab,
    });
  };

  setWaveForm1(newValue) {
    this.props.updateInstrument(this.props.instrument.id, "waveform1", newValue);
  };

  setWaveForm2(newValue) {
    this.props.updateInstrument(this.props.instrument.id, "waveform2", newValue);
  };

  setWaveForm1Octave(newValue) {
    this.props.updateInstrument(this.props.instrument.id, "waveform1Octave", newValue);
  };

  setWaveForm1Amplitude(e) {
    this.props.updateInstrument(this.props.instrument.id, "waveform1Amplitude", parseFloat(e.target.value));
  };

  setWaveForm2Octave(newValue) {
    this.props.updateInstrument(this.props.instrument.id, "waveform2Octave", newValue);
  };

  setWaveForm2Detune(e) {
    this.props.updateInstrument(this.props.instrument.id, "waveform2Detune", parseInt(e.target.value, 10));
  };

  setWaveForm2Amplitude(e) {
    this.props.updateInstrument(this.props.instrument.id, "waveform2Amplitude", parseFloat(e.target.value));
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

  setFilterEnvelopeAttack(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterEnvelopeAttack", parseFloat(e.target.value));
  };

  setFilterEnvelopeDecay(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterEnvelopeDecay", parseFloat(e.target.value));
  };

  setFilterEnvelopeSustain(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterEnvelopeSustain", parseFloat(e.target.value));
  };

  setFilterEnvelopeRelease(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterEnvelopeRelease", parseFloat(e.target.value));
  };

  setEnvelopeAttack(e) {
    this.props.updateInstrument(this.props.instrument.id, "envelopeAttack", parseFloat(e.target.value));
  };

  setEnvelopeDecay(e) {
    this.props.updateInstrument(this.props.instrument.id, "envelopeDecay", parseFloat(e.target.value));
  };

  setEnvelopeSustain(e) {
    this.props.updateInstrument(this.props.instrument.id, "envelopeSustain", parseFloat(e.target.value));
  };

  setEnvelopeRelease(e) {
    this.props.updateInstrument(this.props.instrument.id, "envelopeRelease", parseFloat(e.target.value));
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
            <TabStrip items={this.WAVEFORM_OPTIONS} selectedValue={this.props.instrument.waveform1} setSelectedValue={this.setWaveForm1} />
          </span>
          <span className="control">
            <label className="control-label indented">Octave:</label>
            <TabStrip items={this.OCTAVE_OPTIONS} selectedValue={this.props.instrument.waveform1Octave} setSelectedValue={this.setWaveForm1Octave} />
          </span>
          <span className="control">
            <label className="control-label indented">Volume:</label>
            <span className="annotated-input">
              <input type="range" min="0" max="1" step="0.01" value={this.props.instrument.waveform1Amplitude} onChange={this.setWaveForm1Amplitude} />
              <span>{(this.props.instrument.waveform1Amplitude * 100).toFixed(0)}%</span>
            </span>
          </span>
          <span className="block lightText">Secondary:</span>
          <span className="control">
            <label className="control-label indented">Waveform:</label>
            <TabStrip items={this.WAVEFORM_OPTIONS} selectedValue={this.props.instrument.waveform2} setSelectedValue={this.setWaveForm2} />
          </span>
          <span className="control">
            <label className="control-label indented">Octave:</label>
            <TabStrip items={this.OCTAVE_OPTIONS} selectedValue={this.props.instrument.waveform2Octave} setSelectedValue={this.setWaveForm2Octave} />
          </span>
          <span className="control">
            <label className="control-label indented">Detune:</label>
            <span className="annotated-input">
              <input type="range" min="-100" max="100" step="1" value={this.props.instrument.waveform2Detune} onChange={this.setWaveForm2Detune} />
              <span>{this.props.instrument.waveform2Detune}c</span>
            </span>
          </span>
          <span className="control">
            <label className="control-label indented">Volume:</label>
            <span className="annotated-input">
              <input type="range" min="0" max="1" step="0.01" value={this.props.instrument.waveform2Amplitude} onChange={this.setWaveForm2Amplitude} />
              <span>{(this.props.instrument.waveform2Amplitude * 100).toFixed(0)}%</span>
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
              <label className="control-label indented">Attack Speed:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.filterEnvelopeAttack} onChange={this.setFilterEnvelopeAttack} />
                <span>{this.props.instrument.filterEnvelopeAttack * 1000} ms</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label indented">Decay Speed:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.filterEnvelopeDecay} onChange={this.setFilterEnvelopeDecay} />
                <span>{this.props.instrument.filterEnvelopeDecay * 1000} ms</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label indented">Sustain:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="1.0" step="0.01" value={this.props.instrument.filterEnvelopeSustain} onChange={this.setFilterEnvelopeSustain} />
                <span>{(this.props.instrument.filterEnvelopeSustain * 100).toFixed(0)}%</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label indented">Release Speed:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.filterEnvelopeRelease} onChange={this.setFilterEnvelopeRelease} />
                <span>{this.props.instrument.filterEnvelopeRelease * 1000} ms</span>
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
                <input type="range" min="0" max="100" step="1" value={this.props.instrument.lfoAmplitude} onChange={this.setLFOAmplitude} />
                <span>{this.props.instrument.lfoAmplitude}Hz</span>
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
                <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.envelopeAttack} onChange={this.setEnvelopeAttack} />
                <span>{this.props.instrument.envelopeAttack * 1000} ms</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label">Decay Speed:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.envelopeDecay} onChange={this.setEnvelopeDecay} />
                <span>{this.props.instrument.envelopeDecay * 1000} ms</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label">Sustain Volume:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="1.0" step="0.01" value={this.props.instrument.envelopeSustain} onChange={this.setEnvelopeSustain} />
                <span>{(this.props.instrument.envelopeSustain * 100).toFixed(0)}%</span>
              </span>
            </span>
            <span className="control">
              <label className="control-label">Release Speed:</label>
              <span className="annotated-input">
                <input type="range" min="0.0" max="0.99" step="0.01" value={this.props.instrument.envelopeRelease} onChange={this.setEnvelopeRelease} />
                <span>{this.props.instrument.envelopeRelease * 1000} ms</span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>;
  };
};

export { SynthInstrumentEditor, SampleInstrumentEditor };
