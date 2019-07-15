"use strict";

import React from 'react';

class TrackHeader extends React.PureComponent {
  constructor(props) {
    super(props);

    this.setSelectedTrack = this.setSelectedTrack.bind(this);
    this.setTrackVolume = this.setTrackVolume.bind(this);
    this.toggleTrackMute = this.toggleTrackMute.bind(this);
  };

  setSelectedTrack(e) {
    this.props.setSelectedTrack(this.props.trackID);
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

    return <li className="flex flex-column flex-justify-center bg-light-gray list-style-none pl1 pr-half height-3 border-box bb br">
      <span className="short-name">{shortTrackName(this.props.name)}</span>
      <span className="sequencer-name-container flex flex-justify-space-between">
        {this.props.name} <button className="button-hollow button-small" onClick={this.setSelectedTrack}>Edit</button>
      </span>
      <span className="sequencer-volume-container flex flex-align-center">
        <button className={"button-hollow button-small" + (this.props.muted ? " button-enabled" : "")} onClick={this.toggleTrackMute}>Mute</button>
        <input className="full-width" style={{marginLeft: "4px"}} type="range" min="0.0" max="1.0" step="0.01" disabled={this.props.muted} value={this.props.volume} onChange={this.setTrackVolume} />
      </span>
    </li>;
  };
};

class TimelineHeader extends React.PureComponent {
  constructor(props) {
    super(props);

    this.setCurrentStep = this.setCurrentStep.bind(this);
    this.onPlaybackHeadTouchStart = this.onPlaybackHeadTouchStart.bind(this);
    this.onPlaybackHeadTouchEnd = this.onPlaybackHeadTouchEnd.bind(this);
  };

  setCurrentStep(e) {
    this.props.setCurrentStep(parseInt(e.target.value, 10));
  };

  onPlaybackHeadTouchStart(e) {
    this.props.setIsTimelineElementActive(true);
  };

  onPlaybackHeadTouchEnd(e) {
    this.props.setIsTimelineElementActive(false);
  };

  render() {
    let baseTimelineWidth = this.props.measureCount * 16 * 9;

    return <div className="relative">
      <ul className="flex m0 pl0 no-whitespace-wrap height-2">
        <li className="sequencer-row-left-padding list-style-none border-box bb br"></li>
        {Array(this.props.measureCount).fill(undefined).map((_, measureIndex) =>
        <li key={measureIndex} className="sequencer-cell sequencer-cell-header flex-uniform-size list-style-none border-box br bb"><span className="block h4 lh-flush full-width" style={{marginLeft: "4.5px"}}>{measureIndex + 1}</span></li>
        )}
        <li className="sequencer-row-right-padding list-style-none bb"></li>
      </ul>
      <div className="sequencer-step-timeline">
        <input type="range" className="sequencer-playback-header" style={{width: "calc(" + baseTimelineWidth + "px + (1.5rem - 9px))", marginLeft: "calc(0.25rem - 0.5px)"}} min="0" max={(this.props.measureCount * 16) - 1} step="1" value={this.props.currentStep} onChange={this.setCurrentStep} onTouchStart={this.onPlaybackHeadTouchStart} onTouchEnd={this.onPlaybackHeadTouchEnd} />
      </div>
    </div>;
  };
};

class TimelineGrid extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDragInProgress: false,
    };

    this.startDrag = this.startDrag.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onDragMove = this.onDragMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
  };

  startDrag(clientX, startStep) {
    this.setState({
      isDragInProgress: true,
    });
  };

  endDrag() {
    this.setState({
      isDragInProgress: false,
    });
  };

  onMouseDown(e) {
    let yOffset
    let trackIndex;

    if (e.metaKey === true) {
      yOffset = e.clientY - this.containerEl.getBoundingClientRect().top;
      trackIndex = Math.floor(yOffset / 72);

      this.props.addPattern(this.props.tracks[trackIndex].id, e.clientX);
    }
  };

  onDragMove(e) {
    let containerBoundingRect = this.containerEl.getBoundingClientRect();
    let xOffset = e.clientX - containerBoundingRect.left - 16;
    let yOffset = e.clientY - containerBoundingRect.top;

    let stepUnderCursor = Math.floor(xOffset / 9);
    let newStartStep = Math.floor(stepUnderCursor / 16) * 16;

    let newTrackIndex = Math.floor(yOffset / 72);
    newTrackIndex = Math.max(0, newTrackIndex);

    if (this.props.startStep !== newStartStep) {
      this.props.movePattern(this.props.highlightedPatternID, newTrackIndex, newStartStep);
    }

    this.props.setIsPopupMenuActive(false);
  };

  onMouseUp(e) {
    this.endDrag();
  };

  onMouseOver(e) {
    if (e.buttons === 0) {
      this.endDrag();
    }
  };

  render() {
    return <ul ref={el => {this.containerEl = el;}}
               className="flex flex-column full-height m0 pl0 no-whitespace-wrap"
               onMouseDown={this.onMouseDown}
               onMouseMove={(this.state.isDragInProgress === true) ? this.onDragMove : undefined}
               onMouseUp={this.onMouseUp}
               onMouseOver={this.onMouseOver}>
      {this.props.tracks.map((track, trackIndex) =>
      <li key={trackIndex} className="list-style-none flex full-width height-3">
        <span className="sequencer-row-left-padding border-box bb br bg-lighter-gray"></span>
        <span className="sequencer-row border-box bb br" style={{minWidth: (this.props.measureCount * 16 * 9) + "px"}}>
          {this.props.patternsByTrackID[track.id].map((pattern, patternIndex) =>
          <TimelinePattern key={patternIndex}
                           patternID={pattern.id}
                           startStep={pattern.startStep}
                           stepCount={pattern.rows[0].notes.length}
                           isSelected={this.props.highlightedPatternID === pattern.id}
                           isPopupMenuActive={this.props.isPopupMenuActive}
                           hiddenInput={this.props.hiddenInput}
                           startDrag={this.startDrag}
                           setHighlightedPattern={this.props.setHighlightedPattern}
                           setIsPopupMenuActive={this.props.setIsPopupMenuActive} />
          )}
        </span>
        <span className="sequencer-row-right-padding border-box bb bg-lighter-gray"></span>
      </li>
      )}
    </ul>;
  };
};

class TimelinePattern extends React.Component {
  constructor(props) {
    super(props);

    this.highlight = this.highlight.bind(this);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
  };

  highlight() {
    this.props.setHighlightedPattern(this.props.patternID, this.patternBoxEl.offsetLeft, this.patternBoxEl.offsetTop);

    if (this.props.isSelected === true) {
      this.props.setIsPopupMenuActive(!this.props.isPopupMenuActive);
    }
    else {
      this.props.setIsPopupMenuActive(false);
    }
  };

  onMouseDown(e) {
    this.highlight();

    this.props.startDrag(e.clientX, this.props.startStep);

    // Prevent onBlur from firing on hidden input, which will prevent pattern
    // box being selected
    e.preventDefault();

    // Prevent click on parent pattern grid container
    e.stopPropagation();
  };

  onTouchStart(e) {
    this.highlight();
  };

  componentDidUpdate() {
    if (this.props.isSelected) {
      this.props.hiddenInput.focus();
    }
  };

  render() {
    return <span ref={el => {this.patternBoxEl = el;}} className="relative inline-block full-height" style={{left: (this.props.startStep * 9) + "px"}}>
      <span className={"timeline-pattern" + ((this.props.isSelected === true) ? " timeline-pattern-selected" : "")}
            style={{width: `calc((${this.props.stepCount} * 9px) - 1px)`}}
            onMouseDown={this.onMouseDown}
            onTouchStart={this.onTouchStart}>
        Pattern {this.props.patternID}
      </span>
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
    return <button className="button-small button-hollow full-width round" onClick={this.removeTrack}>X</button>;
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

    this.setState({ isValidValue: isValidValue });
  };

  setMeasureCount(e) {
    this.props.setMeasureCount(parseInt(this.measureCountInput.value, 10));
    this.setState({ editMode: false });
  };

  enableEditMode() {
    this.setState({
      editMode: true,
      isValidValue: true,
    });
  };

  disableEditMode() {
    this.setState({
      editMode: false,
    });
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
        <a href="javascript:void(0);" className="block h4 lh-flush" onClick={this.enableEditMode}>change</a>
      </span>;
    }
  };
};

class Sequencer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: true,
      isTimelineElementActive: false,
      highlightedPatternID: undefined,
      highlightedPatternLeft: undefined,
      highlightedPatternTop: undefined,
      isPopupMenuActive: false,
    };

    this.toggleExpansion = this.toggleExpansion.bind(this);
    this.setIsTimelineElementActive = this.setIsTimelineElementActive.bind(this);
    this.setHighlightedPattern = this.setHighlightedPattern.bind(this);
    this.setIsPopupMenuActive = this.setIsPopupMenuActive.bind(this);
    this.addPattern = this.addPattern.bind(this);
    this.editPattern = this.editPattern.bind(this);
    this.removePattern = this.removePattern.bind(this);
    this.showFileChooser = this.showFileChooser.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onPopupMenuMouseDown = this.onPopupMenuMouseDown.bind(this);
  };


  toggleExpansion() {
    this.setState((prevState, props) => ({
      expanded: !prevState.expanded,
    }));
  };

  setIsTimelineElementActive(newIsTimelineElementActive) {
    this.setState({isTimelineElementActive: newIsTimelineElementActive});
  };

  setHighlightedPattern(patternID, patternBoxOffsetLeft, patternBoxOffsetTop) {
    let newHighlightedPatternLeft = this.timelineContainerEl.offsetLeft - this.timelineContainerEl.scrollLeft + patternBoxOffsetLeft;
    let newHighlightedPatternTop = this.timelineContainerEl.offsetTop + patternBoxOffsetTop;

    this.setState({
      highlightedPatternID: patternID,
      highlightedPatternLeft: newHighlightedPatternLeft,
      highlightedPatternTop: newHighlightedPatternTop,
    });
  };

  setIsPopupMenuActive(newIsPopupMenuActive) {
    this.setState({
      isPopupMenuActive: newIsPopupMenuActive,
    });
  };

  addPattern(trackID, clientPixelX) {
    let containerPixelX = (this.timelineContainerEl.scrollLeft + clientPixelX) - this.timelineContainerEl.offsetLeft - 15;
    this.props.addPattern(trackID, Math.floor(containerPixelX / 9));
  };

  editPattern(e) {
    this.props.setSelectedPattern(this.state.highlightedPatternID);
  };

  removePattern(e) {
    this.props.removePattern(this.state.highlightedPatternID);

    this.setState({
      highlightedPatternID: undefined,
    });
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

  onBlur(e) {
    this.setState({
      highlightedPatternID: undefined,
      isPopupMenuActive: false,
    });
  };

  onPopupMenuMouseDown(e) {
    // Prevent onBlur from firing on hidden input, which will prevent pattern
    // box being selected
    e.preventDefault();
  };

  render() {
    return <div ref={(el) => { this.sequencerContainerEl = el; }} className="relative pt1 pb1 border-box bt-thick">
      <div className="flex flex-justify-space-between">
        <h2 className="mt0 mb1 pl1">Sequencer</h2>
        <MeasureCount measureCount={this.props.measureCount} setMeasureCount={this.props.setMeasureCount} />
      </div>
      <div className="flex mb1">
        <ul className={"flex flex-column m0 pt1 pl0 border-box " + (this.state.expanded ? "expanded" : "contracted")}>
          <li className="list-style-none height-1 pl1 border-box bb">
            <button className={"vertical-top button-tiny button-hollow" + (this.state.expanded ? " button-enabled" : "")} onClick={this.toggleExpansion}>Edit</button>
          </li>
          {this.props.tracks.map((track) =>
            <TrackHeader key={track.id}
                         trackID={track.id}
                         name={track.name}
                         muted={track.muted}
                         volume={track.volume}
                         setSelectedTrack={this.props.setSelectedTrack}
                         setTrackVolume={this.props.setTrackVolume}
                         toggleTrackMute={this.props.toggleTrackMute} />
          )}
        </ul>
        <div ref={(el) => { this.timelineContainerEl = el; }}
             className={"relative flex flex-uniform-size flex-column m0 pl0 no-user-select border-box" + (this.state.isTimelineElementActive ? " overflow-hidden-x" : " overflow-scroll-x")}>
          <TimelineHeader measureCount={this.props.measureCount}
                          currentStep={this.props.currentStep}
                          setCurrentStep={this.props.setCurrentStep}
                          setIsTimelineElementActive={this.setIsTimelineElementActive} />
          <TimelineGrid tracks={this.props.tracks}
                        patternsByTrackID={this.props.patternsByTrackID}
                        measureCount={this.props.measureCount}
                        highlightedPatternID={this.state.highlightedPatternID}
                        isPopupMenuActive={this.state.isPopupMenuActive}
                        hiddenInput={this.hiddenInput}
                        setHighlightedPattern={this.setHighlightedPattern}
                        setIsPopupMenuActive={this.setIsPopupMenuActive}
                        addPattern={this.addPattern}
                        movePattern={this.props.movePattern} />
          <span className="sequencer-playback-line" style={{left: `calc(${this.props.currentStep * 9}px + 1.0rem - 3px)`}}></span>
        </div>
        <ul className={"flex flex-column mt0 mb0 ml0 pl0 border-box" + (this.state.expanded ? "" : " display-none")}>
          <li className="list-style-none inline-block pr1 border-box bb height-2">&nbsp;</li>
          {this.props.tracks.map((track) =>
          <li key={track.id} className="flex flex-align-center bg-light-gray pl-half pr-half list-style-none height-3 border-box bb bl">
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
      <input ref={(el) => { this.hiddenInput = el; }}
             className="absolute hidden-input block"
             style={{left: this.state.highlightedPatternLeft, top: this.state.highlightedPatternTop}}
             type="text" readOnly={true}
             onBlur={this.onBlur} />
      {this.state.highlightedPatternID !== undefined && this.state.isPopupMenuActive === true &&
      <span className="absolute height-3"
            style={{left: this.state.highlightedPatternLeft, top: `calc(${this.state.highlightedPatternTop}px - 4.5rem)`}}
            onMouseDown={this.onPopupMenuMouseDown}>
        <span className="timeline-pattern-menu">
          <button className="button-small button-hollow" onClick={this.editPattern}>Edit</button>&nbsp;
          <button className="button-small button-hollow" onClick={this.removePattern}>Remove</button>
        </span>
        <span className="relative block" style={{height: "1.0rem", marginTop: "-2px"}}>
          <span className="timeline-pattern-menu-arrow-outline"></span>
          <span className="timeline-pattern-menu-arrow-fill"></span>
        </span>
      </span>
      }
    </div>;
  };
};

export { Sequencer };
