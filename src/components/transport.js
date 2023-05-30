"use strict";

import React from "react";

class TempoSlider extends React.PureComponent {
  constructor(props) {
    super(props);
  };

  render() {
    return <span className="flex flex-align-center">
      <label className="width-3">Tempo</label>
      <input className="flex-uniform-size" type="range" min="30" max="255" value={this.props.tempo} onChange={this.props.onChange} />
      <span className="width-2">&nbsp;{this.props.tempo}</span>
    </span>;
  };
};

class AmplitudeSlider extends React.PureComponent {
  constructor(props) {
    super(props);
  };

  render() {
    return <span className="flex flex-align-center">
      <label className="width-3">Volume</label>
      <input className="flex-uniform-size" type="range" min="0.0" max="1.0" step="0.01" value={this.props.amplitude} onChange={this.props.onChange} />
      <span className="width-2">&nbsp;{(this.props.amplitude * 100).toFixed(0)}%</span>
    </span>;
  };
};

class Controls extends React.PureComponent {
  constructor(props) {
    super(props);
  };

  render() {
    return <span className="whitespace-wrap-none">
      <button className="button-standard button-standard-tab-list" onClick={this.props.onRewind}><span className="rewind-icon">Rewind</span></button>
      <button className={"mr-half mr1-l button-standard button-standard-tab-list" + (this.props.isPlaying ? " button-standard-toggled" : "")}  onClick={this.props.onTogglePlayback}><span className={"play-icon" + (this.props.isPlaying ? " play-icon-enabled" : "")}>Play</span></button>
    </span>;
  };
};

class Transport extends React.PureComponent {
  constructor(props) {
    super(props);
  };

  render() {
    return <div id="transport" className="flex flex-uniform-size flex-align-center">
      <div className="transport-inner flex flex-align-center">
        <Controls isPlaying={this.props.isPlaying} onRewind={this.props.rewindTransport} onTogglePlayback={this.props.togglePlaying} />
        <span className="transport-controls flex-uniform-size inline-block">
          <TempoSlider tempo={this.props.tempo} onChange={this.props.updateTempo} />
          <AmplitudeSlider amplitude={this.props.amplitude} onChange={this.props.updateAmplitude} />
        </span>
      </div>
    </div>;
  };
};

export { Transport };
