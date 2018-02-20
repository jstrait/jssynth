"use strict";

import React from 'react';

class TempoSlider extends React.Component {
  constructor(props) {
    super(props);
  };

  render() {
    return <span className="control">
      <label className="control-label align-right">Tempo&nbsp;&nbsp;</label>
      <span className="annotated-input">
        <input type="range" min="30" max="255" value={this.props.tempo} onChange={this.props.onChange} />
        <span>{this.props.tempo}</span>
      </span>
    </span>;
  };
};

class AmplitudeSlider extends React.Component {
  constructor(props) {
    super(props);
  };

  render() {
    return <span className="control">
      <label className="control-label align-right">Volume&nbsp;&nbsp;</label>
      <span className="annotated-input">
        <input type="range" min="0.0" max="1.0" step="0.01" value={this.props.amplitude} onChange={this.props.onChange} />
        <span>{(this.props.amplitude * 100).toFixed(0)}%</span>
      </span>
    </span>;
  };
};

class PlayButton extends React.Component {
  constructor(props) {
    super(props);
  };

  render() {
    return <button className={"mr1 round button-full button-hollow" + (this.props.playing ? " button-enabled" : "")} onClick={this.props.onClick}>►</button>;
  };
};

class TransportError extends React.Component {
  constructor(props) {
    super(props);
  };

  render() {
    return <div className="transport-error ml2 mr2">
      <span className="block bold red"><span className="round white bg-red inline-block center mr-half width-1 lh3">!</span>Playback not support in your browser</span>
      <span className="block">Try a recent version of Chrome, Safari, or Firefox.</span>
    </div>;
  };
};

class Transport extends React.Component {
  constructor(props) {
    super(props);
  };

  render() {
    let transportContent;

    if (this.props.enabled) {
      transportContent = <div className="transport-inner flex flex-align-center">
        <PlayButton playing={this.props.playing} onClick={this.props.togglePlaying} />
        <span className="transport-controls inline-block">
          <TempoSlider tempo={this.props.tempo} onChange={this.props.updateTempo} />
          <AmplitudeSlider amplitude={this.props.amplitude} onChange={this.props.updateAmplitude} />
        </span>
      </div>;
    }
    else {
      transportContent = <TransportError />
    }

    return <div id="transport" className="flex flex-uniform-size flex-align-center">
      {transportContent}
    </div>;
  };
};

export { Transport };
