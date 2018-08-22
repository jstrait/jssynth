"use strict";

import React from 'react';

class TrackHeader extends React.Component {
  constructor(props) {
    super(props);

    this.setTrackName = this.setTrackName.bind(this);
    this.setTrackVolume = this.setTrackVolume.bind(this);
    this.toggleTrackMute = this.toggleTrackMute.bind(this);
  };

  setTrackName(e) {
    this.props.setTrackName(this.props.track.id, e.target.value);
  };

  setTrackVolume(e) {
    this.props.setTrackVolume(this.props.track.id, parseFloat(e.target.value));
  };

  toggleTrackMute(e) {
    this.props.toggleTrackMute(this.props.track.id, !this.props.track.muted);
  };

  render() {
    const shortTrackName = function(fullTrackName) {
      return fullTrackName.substring(0, 4);
    };

    return <li className="flex flex-column flex-uniform-size flex-justify-center bg-light-gray list-style-none pl-half pl1-l pr-half pr1-l border-box bb br">
      <span className="short-name">{shortTrackName(this.props.track.name)}</span>
      <input className="underlinedInput full-width bg-light-gray" type="text" value={this.props.track.name} onChange={this.setTrackName} />
      <span className="sequencer-volume-container flex flex-align-center">
        <button className={"button-hollow button-small" + (this.props.track.muted ? " button-enabled" : "")} onClick={this.toggleTrackMute}>Mute</button>
        <input className="flex-uniform-size" style={{marginLeft: "4px", width: "1px"}} type="range" min="0.0" max="1.0" step="0.01" disabled={this.props.track.muted} value={this.props.track.volume} onChange={this.setTrackVolume} />
      </span>
    </li>;
  };
};

class TrackPatternListHeader extends React.Component {
  constructor(props) {
    super(props);
  };

  render() {
    return <div>
      <ul className="flex ml0 pl0 no-whitespace-wrap" style={{height: "21px"}}>
        {[1,2,3,4,5,6,7,8].map((measure, measureIndex) =>
        <li key={measureIndex} className="sequencer-cell flex-uniform-size list-style-none border-box br"><span className="block center h4 full-width" style={{lineHeight: "21px"}}>{measure}</span></li>
        )}
        <li class="flex-uniform-size list-style-none bb" style={{height: "30px"}}></li>
      </ul>
      <div class="bb sequencer-step-timeline" style={{width: (9 * 16 * 8) + "px"}}>
        <span class="sequencer-step-timeline-playback-head" style={{marginLeft: (this.props.currentStep * 9) + "px"}}></span>
      </div>
    </div>;
  };
};

class TrackPatternList extends React.Component {
  constructor(props) {
    super(props);
  };

  render() {
    return <ul className="flex full-height ml0 pl0 no-whitespace-wrap">
      {this.props.track.patterns.map((pattern, index) =>
      <li key={index} className={"sequencer-cell flex-uniform-size full-height list-style-none center border-box bb br" + (this.props.currentMeasure === index ? " sequencer-current-measure" : "")}>
        <TrackMeasure measure={index} trackID={this.props.track.id} pattern={pattern} trackPatternOptions={this.props.trackPatternOptions} setTrackPattern={this.props.setTrackPattern} />
      </li>
      )}
      <li class="flex-uniform-size list-style-none bg-lighter-gray bb"></li>
    </ul>;
  };
};

class TrackMeasure extends React.Component {
  constructor(props) {
    super(props);

    this.setMeasurePattern = this.setMeasurePattern.bind(this);
  };

  setMeasurePattern(e) {
    this.props.setTrackPattern(this.props.trackID, this.props.measure, parseInt(e.target.value, 10));
  };

  render() {
    return <span className="flex flex-align-center full-height pl-half pr-half border-box">
      <select className="full-width" value={this.props.pattern.patternID} onChange={this.setMeasurePattern}>
        <option key={0} value="-1"></option>
        {this.props.trackPatternOptions.map((trackPatternOption, index) =>
        <option key={index + 1} value={trackPatternOption.id}>{trackPatternOption.name}</option>
        )}
      </select>
    </span>;
  };
};

class TrackRemoveButton extends React.Component {
  constructor(props) {
    super(props);

    this.removeTrack = this.removeTrack.bind(this);
  };

  removeTrack(e) {
    this.props.removeTrack(this.props.trackID);
  };

  render() {
    return <button className="button-small button-hollow full-width round" onClick={this.removeTrack}>X</button>
  };
};

class Sequencer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: true,
    };

    this.toggleExpansion = this.toggleExpansion.bind(this);
    this.showFileChooser = this.showFileChooser.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
  };

  toggleExpansion() {
    this.setState((prevState, props) => ({
      expanded: !prevState.expanded,
    }));
  };

  showFileChooser(e) {
    this.fileInput.click();
  };

  uploadFile(e) {
    if (this.fileInput.value === "") {
      return;
    }

    this.props.addSamplerTrack(this.fileInput.files[0]);
  };

  render() {
    return <div className="pt1 pb1 border-box bt-thick">
      <h2 className="mt0 mb1 pl-half pl1-l">Sequencer</h2>
      <div className="flex">
        <ul className={"flex flex-column mt0 ml0 pl0 overflow-scroll-x border-box " + (this.state.expanded ? "expanded" : "contracted")}>
          <li className="list-style-none pl-half pl1-l border-box bb br" style={{height: "31px"}}>
            <button className={"button-tiny button-hollow" + (this.state.expanded ? " button-enabled" : "")} onClick={this.toggleExpansion}>Edit</button>
          </li>
          {this.props.tracks.map((track) =>
            <TrackHeader key={track.id}
                         track={track}
                         setTrackName={this.props.setTrackName}
                         setTrackVolume={this.props.setTrackVolume}
                         toggleTrackMute={this.props.toggleTrackMute} />
          )}
        </ul>
        <ul className="flex flex-uniform-size flex-column mt0 ml0 pl0 overflow-scroll-x border-box">
          <li className="inline-block list-style-none full-width border-box">
            <TrackPatternListHeader currentMeasure={this.props.currentMeasure} currentStep={this.props.currentStep} />
          </li>
          {this.props.tracks.map((track) =>
          <li key={track.id} className="list-style-none full-width height-3 border-box">
            <TrackPatternList currentMeasure={this.props.currentMeasure} track={track} trackPatternOptions={this.props.trackPatternOptions[track.id]} setTrackPattern={this.props.setTrackPattern} />
          </li>
          )}
        </ul>
        <ul className={"flex flex-column mt0 ml0 pl0 overflow-scroll-x border-box" + (this.state.expanded ? "" : " display-none")}>
          <li className="list-style-none inline-block pr1 border-box bb" style={{height: "31px"}}>&nbsp;</li>
          {this.props.tracks.map((track) =>
          <li key={track.id} className="flex flex-align-center flex-uniform-size bg-light-gray pl-half pr-half list-style-none border-box bb bl">
            <TrackRemoveButton trackID={track.id} removeTrack={this.props.removeTrack} />
          </li>
          )}
        </ul>
      </div>
      <div className="pl-half pl1-l">
        <button className="button-full button-hollow mr-half" onClick={this.props.addSynthTrack}>Add Synth Track</button>
        <button className="button-full button-hollow" onClick={this.showFileChooser}>Add Sampler Track</button>
        <input className="display-none" type="file" onChange={this.uploadFile} ref={input => {this.fileInput = input;}} />
      </div>
    </div>;
  };
};

export { Sequencer };
