"use strict";

import React from 'react';

class WaveFormSelector extends React.Component {
  constructor(props) {
    super(props);

    this.setWaveFormValue = this.setWaveFormValue.bind(this);
  };

  setWaveFormValue(e) {
    this.props.setWaveFormValue(e.target.value);
  };

  render() {
    return <span className="control">
      <label className="control-label indented">Waveform:</label>
      <span className="flex waveformOptionsContainer">
        <span className="radioContainer">
          <input id={this.props.idPrefix + "Sine"} value="sine" type="radio" checked={this.props.waveFormValue === "sine"} onChange={this.setWaveFormValue} />
          &nbsp;<label htmlFor={this.props.idPrefix + "Sine"} className="radioLabel">Sine</label>
        </span>
        <span className="radioContainer">
          <input id={this.props.idPrefix + "Square"} value="square" type="radio" checked={this.props.waveFormValue === "square"} onChange={this.setWaveFormValue} />
          &nbsp;<label htmlFor={this.props.idPrefix + "Square"} className="radioLabel">Square</label>
        </span>
        <span className="radioContainer">
          <input id={this.props.idPrefix + "Sawtooth"} value="sawtooth" type="radio" checked={this.props.waveFormValue === "sawtooth"} onChange={this.setWaveFormValue} />
          &nbsp;<label htmlFor={this.props.idPrefix + "Sawtooth"} className="radioLabel">Saw</label>
        </span>
        <span className="radioContainer">
          <input id={this.props.idPrefix + "Triangle"} value="triangle" type="radio" checked={this.props.waveFormValue === "triangle"} onChange={this.setWaveFormValue} />
          &nbsp;<label htmlFor={this.props.idPrefix + "Triangle"} className="radioLabel">Triangle</label>
        </span>
      </span>
    </span>;
  };
};

class InstrumentEditor extends React.Component {
  constructor(props) {
    super(props);

    this.setWaveForm1 = this.setWaveForm1.bind(this);
    this.setWaveForm2 = this.setWaveForm2.bind(this);
    this.setWaveForm1Octave = this.setWaveForm1Octave.bind(this);
    this.setWaveForm2Octave = this.setWaveForm2Octave.bind(this);
    this.setWaveForm2Detune = this.setWaveForm2Detune.bind(this);
    this.setFilterCutoff = this.setFilterCutoff.bind(this);
    this.setFilterResonance = this.setFilterResonance.bind(this);
    this.setLFOAmplitude = this.setLFOAmplitude.bind(this);
    this.setLFOFrequency = this.setLFOFrequency.bind(this);
    this.setLFOWaveForm = this.setLFOWaveForm.bind(this);
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

  setWaveForm1(newValue) {
    this.props.updateInstrument(this.props.instrument.id, "waveform1", newValue);
  };

  setWaveForm2(newValue) {
    this.props.updateInstrument(this.props.instrument.id, "waveform2", newValue);
  };

  setWaveForm1Octave(e) {
    this.props.updateInstrument(this.props.instrument.id, "waveform1Octave", parseInt(e.target.value, 10));
  };

  setWaveForm2Octave(e) {
    this.props.updateInstrument(this.props.instrument.id, "waveform2Octave", parseInt(e.target.value, 10));
  };

  setWaveForm2Detune(e) {
    this.props.updateInstrument(this.props.instrument.id, "waveform2Detune", parseInt(e.target.value, 10));
  };

  setFilterCutoff(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterCutoff", parseInt(e.target.value, 10));
  };

  setFilterResonance(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterResonance", parseInt(e.target.value, 10));
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

  setFilterModulator(e) {
    this.props.updateInstrument(this.props.instrument.id, "filterModulator", e.target.value);
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
    return <div className="flex overflow-scroll-x pb1 instrument-panel-container">
      <div className="pr1 br instrument-panel">
        <h2 className="h3 section-header">Sound Generator</h2>
        <span className="block mt1 lightText">Base:</span>
        <WaveFormSelector waveFormValue={this.props.instrument.waveform1} idPrefix="waveform" setWaveFormValue={this.setWaveForm1} />
        <span className="control">
          <label className="control-label indented">Octave:</label>
          <span className="annotated-input">
            <input type="range" min="-2" max="2" step="1" value={this.props.instrument.waveform1Octave} onChange={this.setWaveForm1Octave} />
            <span>{(this.props.instrument.waveform1Octave > 0) ? "+" : ""}{this.props.instrument.waveform1Octave}</span>
          </span>
        </span>
        <span className="block mt1 lightText">Secondary:</span>
        <WaveFormSelector waveFormValue={this.props.instrument.waveform2} idPrefix="waveform2" setWaveFormValue={this.setWaveForm2} />
        <span className="control">
          <label className="control-label indented">Octave:</label>
          <span className="annotated-input">
            <input type="range" min="-2" max="2" step="1" value={this.props.instrument.waveform2Octave} onChange={this.setWaveForm2Octave} />
            <span>{(this.props.instrument.waveform2Octave > 0) ? "+" : ""}{this.props.instrument.waveform2Octave}</span>
          </span>
        </span>
        <span className="control">
          <label className="control-label indented">Detune:</label>
          <span className="annotated-input">
            <input type="range" min="-100" max="100" step="1" value={this.props.instrument.waveform2Detune} onChange={this.setWaveForm2Detune} />
            <span>{this.props.instrument.waveform2Detune}c</span>
          </span>
        </span>
      </div>
      <div className="pl1 pr1 br border-box instrument-panel">
        <h2 className="h3 section-header">Filter</h2>
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
          <span className="flex waveformOptionsContainer">
            <span className="radioContainer">
              <input id="filterModulatorLFO" value="lfo" type="radio" checked={this.props.instrument.filterModulator === "lfo"} onChange={this.setFilterModulator} />
              &nbsp;<label htmlFor="filterModulatorLFO" className="radioLabel">Wobble</label>
            </span>
            <span className="radioContainer">
              <input id="filterModulatorEnvelope" value="envelope" type="radio" checked={this.props.instrument.filterModulator === "envelope"} onChange={this.setFilterModulator} />
              &nbsp;<label htmlFor="filterModulatorEnvelope" className="radioLabel">Envelope</label>
            </span>
          </span>
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
          <WaveFormSelector waveFormValue={this.props.instrument.filterLFOWaveform} idPrefix="filterLFOWaveform" setWaveFormValue={this.setFilterLFOWaveForm} />
        </span>
        <span className={(this.props.instrument.filterModulator === "lfo" ? "display-none" : "" )}>
          <span className="block mt1 lightText">Cutoff Envelope:</span>
          <span className="control">
            <label className="control-label indented">Attack Speed:</label>
            <span className="annotated-input">
              <input type="range" min="0.0" max="0.3" step="0.01" value={this.props.instrument.filterEnvelopeAttack} onChange={this.setFilterEnvelopeAttack} />
              <span>{this.props.instrument.filterEnvelopeAttack * 1000} ms</span>
            </span>
          </span>
          <span className="control">
            <label className="control-label indented">Decay Speed:</label>
            <span className="annotated-input">
              <input type="range" min="0.0" max="0.3" step="0.01" value={this.props.instrument.filterEnvelopeDecay} onChange={this.setFilterEnvelopeDecay} />
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
              <input type="range" min="0.0" max="0.3" step="0.01" value={this.props.instrument.filterEnvelopeRelease} onChange={this.setFilterEnvelopeRelease} />
              <span>{this.props.instrument.filterEnvelopeRelease * 1000} ms</span>
            </span>
          </span>
        </span>
      </div>

      <div className="pl1 border-box instrument-panel">
        <h2 className="h3 section-header">Pitch Wobble</h2>
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
        <WaveFormSelector waveFormValue={this.props.instrument.lfoWaveform} idPrefix="lfoWaveform" setWaveFormValue={this.setLFOWaveForm} />

        <h2 className="h3 section-header">Loudness Envelope</h2>
        <span className="control">
          <label className="control-label">Attack Speed:</label>
          <span className="annotated-input">
            <input type="range" min="0.0" max="0.3" step="0.01" value={this.props.instrument.envelopeAttack} onChange={this.setEnvelopeAttack} />
            <span>{this.props.instrument.envelopeAttack * 1000} ms</span>
          </span>
        </span>
        <span className="control">
          <label className="control-label">Decay Speed:</label>
          <span className="annotated-input">
            <input type="range" min="0.0" max="0.3" step="0.01" value={this.props.instrument.envelopeDecay} onChange={this.setEnvelopeDecay} />
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
            <input type="range" min="0.0" max="0.3" step="0.01" value={this.props.instrument.envelopeRelease} onChange={this.setEnvelopeRelease} />
            <span>{this.props.instrument.envelopeRelease * 1000} ms</span>
          </span>
        </span>
      </div>
    </div>;
  };
};

export { InstrumentEditor };
