"use strict";

import React from 'react';

class TrackHeader extends React.PureComponent {
  constructor(props) {
    super(props);

    this.setTrackName = this.setTrackName.bind(this);
    this.setTrackVolume = this.setTrackVolume.bind(this);
    this.toggleTrackMute = this.toggleTrackMute.bind(this);
  };

  setTrackName(e) {
    this.props.setTrackName(this.props.trackID, e.target.value);
  };

  setTrackVolume(e) {
    this.props.setTrackVolume(this.props.trackID, parseFloat(e.target.value));
  };

  toggleTrackMute(e) {
    this.props.toggleTrackMute(this.props.trackID, !this.props.muted);
  };

  render() {
    const shortTrackName = function(fullTrackName) {
      return fullTrackName.substring(0, 4);
    };

    return <li className="flex flex-column flex-uniform-size flex-justify-center bg-light-gray list-style-none pl1 pr1 border-box bb br">
      <span className="short-name">{shortTrackName(this.props.name)}</span>
      <input className="underlinedInput full-width bg-light-gray" type="text" value={this.props.name} onChange={this.setTrackName} />
      <span className="sequencer-volume-container flex flex-align-center">
        <button className={"button-hollow button-small" + (this.props.muted ? " button-enabled" : "")} onClick={this.toggleTrackMute}>Mute</button>
        <input className="full-width" style={{marginLeft: "4px"}} type="range" min="0.0" max="1.0" step="0.01" disabled={this.props.muted} value={this.props.volume} onChange={this.setTrackVolume} />
      </span>
    </li>;
  };
};

class TrackPatternListHeader extends React.PureComponent {
  constructor(props) {
    super(props);

    this.setCurrentStep = this.setCurrentStep.bind(this);
  };

  setCurrentStep(e) {
    this.props.setCurrentStep(parseInt(e.target.value, 10));
  };

  render() {
    let baseTimelineWidth = this.props.measureCount * 16 * 9;

    return <div className="relative" style={{height: "3.0rem"}}>
      <ul className="flex ml0 pl0 no-whitespace-wrap" style={{height: "3.0rem"}}>
        <li className="sequencer-row-padding list-style-none border-box bb br"></li>
        {Array(this.props.measureCount).fill(undefined).map((_, measureIndex) =>
        <li key={measureIndex} className="sequencer-cell sequencer-cell-header flex-uniform-size list-style-none border-box br bb"><span className="block center h4 full-width" style={{lineHeight: "21px"}}>{measureIndex + 1}</span></li>
        )}
        <li className="flex-uniform-size list-style-none bb"></li>
      </ul>
      <div className="sequencer-step-timeline">
        <input type="range" className="sequencer-playback-header" style={{width: "calc(" + baseTimelineWidth + "px + (1.5rem - 9px))", marginLeft: "calc(0.75rem + ((1.5rem - 9px) / -2))"}} min="0" max={(this.props.measureCount * 16) - 1} step="1" value={this.props.currentStep} onChange={this.setCurrentStep} />
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
      <li className="sequencer-row-padding list-style-none border-box bb br bg-lighter-gray"></li>
      {this.props.patterns.map((pattern, index) =>
      <li key={index} className="sequencer-cell flex-uniform-size full-height list-style-none center border-box bb br">
        <TrackMeasure measure={index} trackID={this.props.trackID} patternID={pattern.patternID} trackPatternOptions={this.props.trackPatternOptions} setTrackPattern={this.props.setTrackPattern} />
      </li>
      )}
      <li className="flex-uniform-size list-style-none bg-lighter-gray bb"></li>
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

  shouldComponentUpdate(nextProps, nextState) {
    const basicPropsChanged = this.props.trackID !== nextProps.trackID ||
                              this.props.patternID !== nextProps.patternID ||
                              this.props.measure !== nextProps.measure;
    let i;

    if (basicPropsChanged) {
      return true;
    }

    if (this.props.trackPatternOptions.length !== nextProps.trackPatternOptions.length) {
      return true;
    }

    for (i = 0; i < this.props.trackPatternOptions.length; i++) {
      if (this.props.trackPatternOptions[i].id !== nextProps.trackPatternOptions[i].id ||
          this.props.trackPatternOptions[i].name !== nextProps.trackPatternOptions[i].name) {
        return true;
      }
    }

    return false;
  };

  render() {
    return <span className="flex flex-align-center full-height pl-half pr-half border-box">
      <select className="full-width" value={this.props.patternID} onChange={this.setMeasurePattern}>
        <option key={0} value="-1"></option>
        {this.props.trackPatternOptions.map((trackPatternOption, index) =>
        <option key={index + 1} value={trackPatternOption.id}>{trackPatternOption.name}</option>
        )}
      </select>
    </span>;
  };
};

class TrackRemoveButton extends React.PureComponent {
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

class MeasureCount extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      editMode: false,
      isValidValue: true,
    };

    this.MIN_VALUE = 1;
    this.MAX_VALUE = 99;
    this.validateValue = this.validateValue.bind(this);
    this.setMeasureCount = this.setMeasureCount.bind(this);
    this.enableEditMode = this.enableEditMode.bind(this);
    this.disableEditMode = this.disableEditMode.bind(this);
  };

  validateValue(e) {
    let inputString = e.target.value;
    let isValidNumber = /^\d\d?$/.test(inputString);
    let parsedNumber = parseInt(inputString, 10);

    let isValidValue = isValidNumber &&
                       parsedNumber >= this.MIN_VALUE &&
                       parsedNumber <= this.MAX_VALUE;

    this.setState(() => ({ isValidValue: isValidValue }));
  };

  setMeasureCount(e) {
    this.props.setMeasureCount(parseInt(this.measureCountInput.value, 10));
    this.setState(() => ({ editMode: false }));
  };

  enableEditMode() {
    if (this.props.isEditable === false) {
      return;
    }

    this.setState(() => ({
      editMode: true,
      isValidValue: true,
    }));
  };

  disableEditMode() {
    this.setState(() => ({
      editMode: false,
    }));
  };

  render() {
    if (this.state.editMode === true) {
      return <span className="pr1 align-right">
        <label>Measures:</label>&nbsp;
        <input type="text" className={"width-1" + (this.state.isValidValue ? "" : " note-box-invalid")} maxLength="2" defaultValue={this.props.measureCount} onChange={this.validateValue} ref={input => {this.measureCountInput = input;}} />
        <span className="block">
          <a href="javascript:void(0);" className="h4" onClick={this.disableEditMode}>cancel</a>&nbsp;
          <button className="button-small button-hollow" disabled={!this.state.isValidValue} onClick={this.setMeasureCount}>Save</button>
        </span>
      </span>;
    }
    else {
      return <span className="pr1 align-right">
        <label>Measures: {this.props.measureCount}</label>
        <a href="javascript:void(0);" className={"block h4 lh-flush" + (this.props.isEditable ? "" : " disabled")} onClick={this.enableEditMode}>change</a>
      </span>;
    }
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
      <div className="flex flex-justify-space-between">
        <h2 className="mt0 mb1 pl1">Sequencer</h2>
        <MeasureCount isEditable={!this.props.isPlaying} measureCount={this.props.measureCount} setMeasureCount={this.props.setMeasureCount} />
      </div>
      <div className="flex">
        <ul className={"flex flex-column mt0 ml0 pl0 overflow-scroll-x border-box " + (this.state.expanded ? "expanded" : "contracted")}>
          <li className="list-style-none pl1 border-box bb" style={{height: "3.0rem"}}>
            <button className={"button-tiny button-hollow" + (this.state.expanded ? " button-enabled" : "")} onClick={this.toggleExpansion}>Edit</button>
          </li>
          {this.props.tracks.map((track) =>
            <TrackHeader key={track.id}
                         trackID={track.id}
                         name={track.name}
                         muted={track.muted}
                         volume={track.volume}
                         setTrackName={this.props.setTrackName}
                         setTrackVolume={this.props.setTrackVolume}
                         toggleTrackMute={this.props.toggleTrackMute} />
          )}
        </ul>
        <ul className="relative flex flex-uniform-size flex-column mt0 ml0 pl0 overflow-scroll-x border-box">
          <span className="sequencer-playback-line" style={{left: `calc(${this.props.currentStep * 9}px + 0.75rem)`}}></span>
          <li className="inline-block list-style-none full-width border-box">
            <TrackPatternListHeader isPlaying={this.props.isPlaying} measureCount={this.props.measureCount} currentStep={this.props.currentStep} setCurrentStep={this.props.setCurrentStep} />
          </li>
          {this.props.tracks.map((track) =>
          <li key={track.id} className="list-style-none full-width height-3 border-box">
            <TrackPatternList trackID={track.id} patterns={track.patterns} trackPatternOptions={this.props.trackPatternOptions[track.id]} setTrackPattern={this.props.setTrackPattern} />
          </li>
          )}
        </ul>
        <ul className={"flex flex-column mt0 ml0 pl0 overflow-scroll-x border-box" + (this.state.expanded ? "" : " display-none")}>
          <li className="list-style-none inline-block pr1 border-box bb" style={{height: "3.0rem"}}>&nbsp;</li>
          {this.props.tracks.map((track) =>
          <li key={track.id} className="flex flex-align-center flex-uniform-size bg-light-gray pl-half pr-half list-style-none border-box bb bl">
            <TrackRemoveButton trackID={track.id} removeTrack={this.props.removeTrack} />
          </li>
          )}
        </ul>
      </div>
      <div className="pl1">
        <button className="button-full button-hollow mr-half" onClick={this.props.addSynthTrack}>Add Synth Track</button>
        <button className="button-full button-hollow" onClick={this.showFileChooser}>Add Sampler Track</button>
        <input className="display-none" type="file" onChange={this.uploadFile} ref={input => {this.fileInput = input;}} />
      </div>
    </div>;
  };
};

export { Sequencer };
