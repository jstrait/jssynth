"use strict";

import React from "react";

const STEP_WIDTH_IN_PIXELS = 9;
const TRACK_HEIGHT_IN_PIXELS = 72;
const STEPS_PER_MEASURE = 16;
const MEASURE_WIDTH_IN_PIXELS = STEP_WIDTH_IN_PIXELS * STEPS_PER_MEASURE;

const TIMELINE_DRAG_NONE = 1;
const TIMELINE_DRAG_MOVE_PATTERN = 2;
const TIMELINE_DRAG_RESIZE_PATTERN = 3;
const TIMELINE_DRAG_LOOP_PATTERN = 4;

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
        <span className="overflow-hidden no-whitespace-wrap overflow-ellipsis">{this.props.name}</span>
        <button className="button-hollow button-small" onClick={this.setSelectedTrack}>Edit</button>
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
    let baseTimelineWidth = this.props.measureCount * MEASURE_WIDTH_IN_PIXELS;

    return <div className="relative">
      <ul className="flex m0 pl0 no-whitespace-wrap height-2">
        <li className="sequencer-body-left-padding list-style-none border-box"></li>
        {Array(this.props.measureCount).fill(undefined).map((_, measureIndex) =>
        <li key={measureIndex} className="sequencer-cell sequencer-cell-header flex-uniform-size list-style-none border-box br bb"><span className="block h4 lh-flush full-width" style={{marginLeft: "4.5px"}}>{measureIndex + 1}</span></li>
        )}
        <li className="sequencer-body-right-padding list-style-none"></li>
      </ul>
      <div className="sequencer-step-timeline">
        <input type="range" className="sequencer-playback-header" style={{width: "calc(" + baseTimelineWidth + "px + (1.5rem - " + STEP_WIDTH_IN_PIXELS + "px))", marginLeft: "calc(0.25rem - 0.5px)"}} min="0" max={(this.props.measureCount * STEPS_PER_MEASURE) - 1} step="1" value={this.props.currentStep} onChange={this.setCurrentStep} onTouchStart={this.onPlaybackHeadTouchStart} onTouchEnd={this.onPlaybackHeadTouchEnd} />
      </div>
    </div>;
  };
};

class TimelineGrid extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dragType: TIMELINE_DRAG_NONE,
      dragPatternOriginalStartStep: undefined,
      dragStartStep: undefined,
      resizeStartStep: undefined,
      minPlaybackStepCount: undefined,
    };

    this.startDrag = this.startDrag.bind(this);
    this.startResize = this.startResize.bind(this);
    this.startLoopChange = this.startLoopChange.bind(this);
    this.endDrag = this.endDrag.bind(this);
    this.stepUnderCursor = this.stepUnderCursor.bind(this);
    this.trackUnderCursor = this.trackUnderCursor.bind(this);
    this.setPopupMenuPosition = this.setPopupMenuPosition.bind(this);
    this.dragMove = this.dragMove.bind(this);
    this.dragResize = this.dragResize.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseDrag = this.onMouseDrag.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
  };

  startDrag(patternStartStep, clientX) {
    let containerBoundingRect = this.containerEl.getBoundingClientRect();
    let stepUnderCursor = this.stepUnderCursor(containerBoundingRect, clientX);

    this.setState({
      dragType: TIMELINE_DRAG_MOVE_PATTERN,
      dragPatternOriginalStartStep: patternStartStep,
      dragStartStep: stepUnderCursor,
      resizeStartStep: undefined,
      minPlaybackStepCount: undefined,
    });
  };

  startResize(startStep) {
    this.setState({
      dragType: TIMELINE_DRAG_RESIZE_PATTERN,
      dragPatternOriginalStartStep: undefined,
      dragStartStep: undefined,
      resizeStartStep: startStep,
      minPlaybackStepCount: undefined,
    });
  };

  startLoopChange(startStep, baseStepCount) {
    this.setState({
      dragType: TIMELINE_DRAG_LOOP_PATTERN,
      dragPatternOriginalStartStep: undefined,
      dragStartStep: undefined,
      resizeStartStep: startStep,
      minPlaybackStepCount: baseStepCount,
    });
  };

  endDrag() {
    this.setState({
      dragType: TIMELINE_DRAG_NONE,
    });
  };

  stepUnderCursor(containerBoundingRect, clientX) {
    let xOffset = clientX - containerBoundingRect.left;

    return Math.floor((xOffset / STEP_WIDTH_IN_PIXELS));
  };

  trackUnderCursor(containerBoundingRect, clientY) {
    let yOffset = clientY - containerBoundingRect.top;

    // Unlike xOffset, the container always has the same height regardless of the
    // height of the window, so we can use it for clamping.
    yOffset = Math.max(0, yOffset);
    yOffset = Math.min(yOffset, containerBoundingRect.height - 1);

    let newTrackIndex = Math.floor(yOffset / TRACK_HEIGHT_IN_PIXELS);
    return Math.max(0, newTrackIndex);
  };

  setPopupMenuPosition(clientX, clientY) {
    let containerBoundingRect = this.containerEl.getBoundingClientRect();
    let stepIndex = this.stepUnderCursor(containerBoundingRect, clientX);
    let trackIndex = this.trackUnderCursor(containerBoundingRect, clientY);

    if (stepIndex >= 0 && stepIndex < (this.props.measureCount * STEPS_PER_MEASURE)) {
      this.props.setPopupMenuPosition(stepIndex, trackIndex);
      this.props.setIsPopupMenuActive(!this.props.isPopupMenuActive);
    }
    else {
      this.props.setIsPopupMenuActive(false);
    }
  };

  dragMove(clientX, clientY) {
    let containerBoundingRect = this.containerEl.getBoundingClientRect();
    let stepUnderCursor = this.stepUnderCursor(containerBoundingRect, clientX);

    let dragStartMeasure = Math.floor(this.state.dragStartStep / STEPS_PER_MEASURE);
    let measureUnderCursor = Math.floor(stepUnderCursor / STEPS_PER_MEASURE);
    let newStartStep = this.state.dragPatternOriginalStartStep + ((measureUnderCursor - dragStartMeasure) * STEPS_PER_MEASURE);

    newStartStep = Math.max(0, newStartStep);
    newStartStep = Math.min(newStartStep, (this.props.measureCount - 1) * STEPS_PER_MEASURE);

    let newTrackIndex = this.trackUnderCursor(containerBoundingRect, clientY);

    this.props.movePattern(this.props.highlightedPatternID, newTrackIndex, newStartStep);
    if (this.props.isPopupMenuActive === true) {
      this.props.setIsPopupMenuActive(false);
    }
  };

  dragResize(clientX) {
    let containerBoundingRect = this.containerEl.getBoundingClientRect();
    let stepUnderCursor = this.stepUnderCursor(containerBoundingRect, clientX);
    let newStepCount = Math.ceil((stepUnderCursor - this.state.resizeStartStep + 1) / STEPS_PER_MEASURE) * STEPS_PER_MEASURE;

    newStepCount = Math.max(newStepCount, STEPS_PER_MEASURE);
    newStepCount = Math.min(newStepCount, (this.props.measureCount * STEPS_PER_MEASURE) - this.state.resizeStartStep);

    this.props.resizePattern(this.props.highlightedPatternID, newStepCount);
    if (this.props.isPopupMenuActive === true) {
      this.props.setIsPopupMenuActive(false);
    }
  };

  dragLoopChange(clientX) {
    let containerBoundingRect = this.containerEl.getBoundingClientRect();
    let stepUnderCursor = this.stepUnderCursor(containerBoundingRect, clientX);
    let newPlaybackStepCount = Math.ceil((stepUnderCursor - this.state.resizeStartStep + 1) / STEPS_PER_MEASURE) * STEPS_PER_MEASURE;

    newPlaybackStepCount = Math.max(newPlaybackStepCount, this.state.minPlaybackStepCount);
    newPlaybackStepCount = Math.min(newPlaybackStepCount, (this.props.measureCount * STEPS_PER_MEASURE) - this.state.resizeStartStep);

    this.props.changePatternPlaybackStepCount(this.props.highlightedPatternID, newPlaybackStepCount);
    if (this.props.isPopupMenuActive === true) {
      this.props.setIsPopupMenuActive(false);
    }
  };

  onMouseDown(e) {
    this.setPopupMenuPosition(e.clientX, e.clientY);
  };

  onMouseDrag(e) {
    if (this.state.dragType === TIMELINE_DRAG_MOVE_PATTERN) {
      this.dragMove(e.clientX, e.clientY);
    }
    else if (this.state.dragType === TIMELINE_DRAG_RESIZE_PATTERN) {
      this.dragResize(e.clientX);
    }
    else if (this.state.dragType === TIMELINE_DRAG_LOOP_PATTERN) {
      this.dragLoopChange(e.clientX);
    }
  };

  onMouseUp(e) {
    this.endDrag();
  };

  onMouseEnter(e) {
    if (e.buttons === 0) {
      this.endDrag();
    }
  };

  onTouchMove(e) {
    if (this.state.dragType === TIMELINE_DRAG_MOVE_PATTERN) {
      this.dragMove(e.touches[0].clientX, e.touches[0].clientY);

      // Prevent container or page from scrolling while dragging pattern
      e.preventDefault();
    }
    else if (this.state.dragType === TIMELINE_DRAG_RESIZE_PATTERN) {
      this.dragResize(e.touches[0].clientX);

      // Prevent container or page from scrolling while dragging pattern
      e.preventDefault();
    }
    else if (this.state.dragType === TIMELINE_DRAG_LOOP_PATTERN) {
      this.dragLoopChange(e.touches[0].clientX);

      // Prevent container or page from scrolling while dragging pattern
      e.preventDefault();
    }
  };

  onTouchEnd(e) {
    this.endDrag();
  };

  componentDidMount() {
    // This event handler is added manually to the actual DOM element, instead of using the
    // normal React way of attaching events because React seems to have a bug that prevents
    // preventDefault() from working correctly in a "touchmove" handler (as of v16.12.0).
    // The preventDefault() is needed to prevent the container element from scrolling while
    // a touch drag is active on iOS.
    // See https://medium.com/@ericclemmons/react-event-preventdefault-78c28c950e46 and
    // https://github.com/facebook/react/issues/9809.
    this.containerEl.addEventListener("touchmove", this.onTouchMove, false);
  };

  componentWillUnmount() {
    const eventRemover = this.containerEl.removeEventListener || this.containerEl.detachEvent;
    eventRemover("touchmove", this.onTouchMove);
  };

  render() {
    let i;
    let trackIndices = {};
    let patternsByTrackIndex = [];
    let pattern;

    for (i = 0; i < this.props.tracks.length; i++) {
      trackIndices[this.props.tracks[i].id] = i;
    }

    for (i = 0; i < this.props.patterns.length; i++) {
      pattern = this.props.patterns[i];
      patternsByTrackIndex.push({trackIndex: trackIndices[pattern.trackID], pattern: pattern});
    }

    return <div className="flex full-height no-whitespace-wrap">
      <span className="sequencer-body-left-padding border-box bg-lighter-gray"></span>
      <span ref={el => {this.containerEl = el;}}
            className="sequencer-body relative border-box"
            style={{minWidth: (this.props.measureCount * MEASURE_WIDTH_IN_PIXELS) + "px"}}
            onMouseDown={this.onMouseDown}
            onMouseMove={(this.state.dragType !== TIMELINE_DRAG_NONE) ? this.onMouseDrag : undefined}
            onMouseUp={this.onMouseUp}
            onMouseEnter={this.onMouseEnter}
            onTouchEnd={this.onTouchEnd}>
      {patternsByTrackIndex.map((patternView) =>
        <TimelinePattern key={patternView.pattern.id}
                         trackIndex={patternView.trackIndex}
                         patternID={patternView.pattern.id}
                         patternName={patternView.pattern.name}
                         startStep={patternView.pattern.startStep}
                         baseStepCount={patternView.pattern.stepCount}
                         fullStepCount={patternView.pattern.playbackStepCount}
                         isSelected={this.props.highlightedPatternID === patternView.pattern.id}
                         isPopupMenuActive={this.props.isPopupMenuActive}
                         startDrag={this.startDrag}
                         startResize={this.startResize}
                         startLoopChange={this.startLoopChange}
                         setHighlightedPattern={this.props.setHighlightedPattern}
                         setIsPopupMenuActive={this.props.setIsPopupMenuActive}
                         setPopupMenuPosition={this.setPopupMenuPosition} />
      )}
      </span>
      <span className="sequencer-body-right-padding border-box bg-lighter-gray"></span>
    </div>;
  };
};

class TimelinePattern extends React.PureComponent {
  constructor(props) {
    super(props);

    this.highlight = this.highlight.bind(this);
    this.togglePopupMenu = this.togglePopupMenu.bind(this);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onStartResize = this.onStartResize.bind(this);
    this.onStartLoopChange = this.onStartLoopChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
  };

  highlight() {
    this.el.focus();
    this.props.setHighlightedPattern(this.props.patternID);
  };

  togglePopupMenu(clientX, clientY) {
    this.props.setPopupMenuPosition(clientX, clientY);

    if (this.props.isSelected === true) {
      this.props.setIsPopupMenuActive(!this.props.isPopupMenuActive);
    }
    else {
      this.props.setIsPopupMenuActive(false);
    }
  };

  onMouseDown(e) {
    this.highlight();
    this.togglePopupMenu(e.clientX, e.clientY);

    this.props.startDrag(this.props.startStep, e.clientX);

    // Prevent click on parent pattern grid container
    e.stopPropagation();
  };

  onTouchStart(e) {
    this.highlight();
    this.togglePopupMenu(e.touches[0].clientX, e.touches[0].clientY);
    this.props.startDrag(this.props.startStep, e.touches[0].clientX);
  };

  onStartResize(e) {
    this.highlight();
    if (this.props.isPopupMenuActive === true) {
      this.props.setIsPopupMenuActive(false);
    }

    this.props.startResize(this.props.startStep);

    // Prevent a drag start occuring on parent
    e.stopPropagation();
  };

  onStartLoopChange(e) {
    this.highlight();
    if (this.props.isPopupMenuActive === true) {
      this.props.setIsPopupMenuActive(false);
    }

    this.props.startLoopChange(this.props.startStep, this.props.baseStepCount);

    // Prevent a drag start occuring on parent
    e.stopPropagation();
  };

  onBlur(e) {
    this.props.setHighlightedPattern(undefined);
    if (this.props.isPopupMenuActive === true) {
      this.props.setIsPopupMenuActive(false);
    }
  };

  render() {
    const FULL_SUB_PATTERN_COUNT = Math.floor(this.props.fullStepCount / this.props.baseStepCount);
    const SUB_PATTERN_LENGTHS = Array(FULL_SUB_PATTERN_COUNT).fill(this.props.baseStepCount);
    if (this.props.fullStepCount / this.props.baseStepCount !== FULL_SUB_PATTERN_COUNT) {
      SUB_PATTERN_LENGTHS.push(this.props.fullStepCount % this.props.baseStepCount);
    }

    return <span ref={(el) => { this.el = el; }}
                 tabIndex="-1"
                 className="absolute block left full-height overflow-hidden outline-none"
                 style={{left: (this.props.startStep * STEP_WIDTH_IN_PIXELS) + "px",
                         top: (this.props.trackIndex * TRACK_HEIGHT_IN_PIXELS) + "px",
                         width: (this.props.fullStepCount * STEP_WIDTH_IN_PIXELS) + "px",
                         height: TRACK_HEIGHT_IN_PIXELS + "px"}}
                 onMouseDown={this.onMouseDown}
                 onTouchStart={this.onTouchStart}
                 onBlur={this.onBlur}>
      {SUB_PATTERN_LENGTHS.map((_, index) =>
      <TimelinePatternSegment
        key={index}
        isSelected={this.props.isSelected}
        startStep={this.props.baseStepCount * index}
        stepCount={SUB_PATTERN_LENGTHS[index]}
        isFirstSegment={index === 0}
        isLastSegment={index === (SUB_PATTERN_LENGTHS.length - 1)}
        isResizeable={this.props.baseStepCount === this.props.fullStepCount}
        onStartLoopChange={this.onStartLoopChange}
        onStartResize={this.onStartResize}
      />
      )}
      <span className={"timeline-pattern-name" + ((this.props.isSelected === true) ? " timeline-pattern-name-selected" : "")}>{this.props.patternName}</span>
    </span>;
  };
};

class TimelinePatternSegment extends React.PureComponent {
  constructor(props) {
    super(props);
  };

  render() {
    let leftPixel = this.props.startStep * STEP_WIDTH_IN_PIXELS;
    let widthInPixels = (this.props.stepCount * STEP_WIDTH_IN_PIXELS) - 1;

    if (this.props.isFirstSegment !== true) {
      leftPixel -= 1;
      widthInPixels += 1;
    }
    if (this.props.isLastSegment !== true) {
      widthInPixels += 1;
    }

    return <React.Fragment>
      <span className={"overflow-hidden timeline-pattern" + ((this.props.isSelected === true) ? " timeline-pattern-selected" : "")}
            style={{left: leftPixel + "px", width: widthInPixels + "px"}}>
        {this.props.isLastSegment === true &&
        <TimelinePatternSidebar
          isResizeable={this.props.isResizeable === true}
          onStartLoopChange={this.props.onStartLoopChange}
          onStartResize={this.props.onStartResize}
        />
        }
      </span>
      {this.props.isFirstSegment !== true &&
        <span className={"absolute timeline-pattern-divider" + ((this.props.isSelected === true) ? " timeline-pattern-divider-selected" : "")}
              style={{left: leftPixel + "px"}}></span>}
    </React.Fragment>;
  };
};

class TimelinePatternSidebar extends React.PureComponent {
  constructor(props) {
    super(props);

    this.noOp = this.noOp.bind(this);
  };

  noOp(e) {
    // Prevent a drag start/popup menu occuring on parent
    e.stopPropagation();
  };

  render() {
    const onResize = (this.props.isResizeable === true) ? this.props.onStartResize : this.noOp;

    return <span className="flex flex-column width-1 full-height right bg-gray">
      <span className="flex-uniform-size h4 center cursor-default" onMouseDown={this.props.onStartLoopChange} onTouchStart={this.props.onStartLoopChange}>&#8635;</span>
      <span className={"flex-uniform-size h4 center cursor-default" + ((this.props.isResizeable === true) ? "" : " lightText")} onMouseDown={onResize} onTouchStart={onResize}>&harr;</span>
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
      return <span className="flex flex-column flex-align-end pr1">
        <span>
          <label>Measures:</label>&nbsp;
          <input type="text" className={"width-1" + (this.state.isValidValue ? "" : " note-box-invalid")} maxLength="2" defaultValue={this.props.measureCount} onChange={this.validateValue} ref={input => {this.measureCountInput = input;}} />
        </span>
        <span>
          <button className="button-link" onClick={this.disableEditMode}>cancel</button>&nbsp;
          <button className="button-small button-hollow" disabled={!this.state.isValidValue} onClick={this.setMeasureCount}>Save</button>
        </span>
      </span>;
    }
    else {
      return <span className="flex flex-column flex-align-end pr1">
        <label>Measures: {this.props.measureCount}</label>
        <button className="block button-link" onClick={this.enableEditMode}>change</button>
      </span>;
    }
  };
};

class PopupMenu extends React.Component {
  constructor(props) {
    super(props);
  };

  componentDidMount() {
    // Positioning the popup menu must happen after the component is rendered, so that we can
    // get the element width. This is not possible with vanilla CSS, because the popup menu can
    // have an arbitrary width, due to the menu having arbitrary inner content.

    let stepAlignedTargetX = this.props.targetX + ((STEP_WIDTH_IN_PIXELS / 2) + 1);

    // `.getBoundingClientRect()` is used because it returns a fractional value, whereas
    // `.clientWidth` rounds to an integer. If the inner content width is fractional,
    // rounding the width to an integer can result in the popup menu being placed too
    // close the window's right edge, causing the popup menu content to wrap.
    let containerWidth = this.containerEl.getBoundingClientRect().width;
    let containerLeft = stepAlignedTargetX - (containerWidth / 2);

    // Clamp position to window's left/right edges
    containerLeft = Math.max(containerLeft, 0);
    containerLeft = Math.min(containerLeft, window.innerWidth - containerWidth);

    this.containerEl.style.left = `${containerLeft}px`;
    this.arrowOutlineEl.style.left = `calc(${stepAlignedTargetX - this.containerEl.offsetLeft}px - 1.0rem)`;
    this.arrowFillEl.style.left = `calc(${stepAlignedTargetX - this.containerEl.offsetLeft}px - 0.85rem)`;
  };

  render() {
    return <span ref={el => {this.containerEl = el;}}
            className="absolute height-3"
            style={{top: `calc(${this.props.targetY}px - 1.5rem)`}}
            onMouseDown={this.props.onMouseDown}>
      <span className="timeline-pattern-menu">{this.props.content}</span>
      <span className="relative block" style={{height: "1.0rem", marginTop: "-2px"}}>
        <span ref={el => {this.arrowOutlineEl = el;}} className="timeline-pattern-menu-arrow-outline"></span>
        <span ref={el => {this.arrowFillEl = el;}} className="timeline-pattern-menu-arrow-fill"></span>
      </span>
    </span>;
  };
};

class Sequencer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: true,
      isTimelineElementActive: false,
      highlightedPatternID: undefined,
      popupMenuStepIndex: undefined,
      popupMenuTrackIndex: undefined,
      popupMenuTargetX: undefined,
      popupMenuTargetY: undefined,
      isPopupMenuActive: false,
    };

    this.toggleExpansion = this.toggleExpansion.bind(this);
    this.setIsTimelineElementActive = this.setIsTimelineElementActive.bind(this);
    this.setHighlightedPattern = this.setHighlightedPattern.bind(this);
    this.setIsPopupMenuActive = this.setIsPopupMenuActive.bind(this);
    this.setPopupMenuPosition = this.setPopupMenuPosition.bind(this);
    this.addPattern = this.addPattern.bind(this);
    this.copyPattern = this.copyPattern.bind(this);
    this.duplicateCopiedPattern = this.duplicateCopiedPattern.bind(this);
    this.editPattern = this.editPattern.bind(this);
    this.removePattern = this.removePattern.bind(this);
    this.showFileChooser = this.showFileChooser.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.onPopupMenuMouseDown = this.onPopupMenuMouseDown.bind(this);
    this.onScroll = this.onScroll.bind(this);
  };


  toggleExpansion() {
    this.setState((prevState, props) => ({
      expanded: !prevState.expanded,
      isPopupMenuActive: false,
    }));
  };

  setIsTimelineElementActive(newIsTimelineElementActive) {
    this.setState({isTimelineElementActive: newIsTimelineElementActive});
  };

  setHighlightedPattern(patternID) {
    this.setState({
      highlightedPatternID: patternID,
    });
  };

  setIsPopupMenuActive(newIsPopupMenuActive) {
    this.setState({
      isPopupMenuActive: newIsPopupMenuActive,
    });
  };

  setPopupMenuPosition(stepIndex, trackIndex) {
    let newPopupMenuTargetX = this.timelineContainerEl.offsetLeft - this.timelineContainerEl.scrollLeft + (stepIndex * STEP_WIDTH_IN_PIXELS) + 15;
    let newPopupMenuTargetY = this.timelineContainerEl.offsetTop + (trackIndex * TRACK_HEIGHT_IN_PIXELS);

    this.setState({
      popupMenuStepIndex: stepIndex,
      popupMenuTrackIndex: trackIndex,
      popupMenuTargetX: newPopupMenuTargetX,
      popupMenuTargetY: newPopupMenuTargetY,
    });
  };

  addPattern(e) {
    let startStep = Math.floor(this.state.popupMenuStepIndex / STEPS_PER_MEASURE) * STEPS_PER_MEASURE;
    let trackID = this.props.tracks[this.state.popupMenuTrackIndex].id;

    this.props.addPattern(trackID, startStep);

    this.setState({
      isPopupMenuActive: false,
    });
  };

  copyPattern(e) {
    this.props.setCopiedPattern(this.state.highlightedPatternID);

    this.setState({
      isPopupMenuActive: false,
    });
  };

  duplicateCopiedPattern(e) {
    let startStep = Math.floor(this.state.popupMenuStepIndex / STEPS_PER_MEASURE) * STEPS_PER_MEASURE;
    let trackID = this.props.tracks[this.state.popupMenuTrackIndex].id;

    if (this.props.copiedPattern === undefined) {
      return;
    }

    this.props.duplicatePattern(trackID, this.props.copiedPattern, startStep);

    this.setState({
      isPopupMenuActive: false,
    });
  };

  editPattern(e) {
    this.props.setSelectedPattern(this.state.highlightedPatternID);
  };

  removePattern(e) {
    this.props.removePattern(this.state.highlightedPatternID);

    this.setState({
      highlightedPatternID: undefined,
      isPopupMenuActive: false,
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

    // Since file uploads are triggered by the "onchange" event, you won't be able to add
    // two consecutive tracks using the same sound file unless the file input is manually
    // reset after each upload.
    this.fileInput.value = "";
  };

  onPopupMenuMouseDown(e) {
    // Prevent the pattern box from losing focus
    e.preventDefault();
  };

  onScroll(e) {
    if (this.state.isPopupMenuActive === true) {
      this.setState({
        isPopupMenuActive: false,
      });
    }
  };

  render() {
    let popupMenuContent = undefined;
    if (this.state.isPopupMenuActive === true) {
      if (this.state.highlightedPatternID === undefined) {
        popupMenuContent = <React.Fragment>
                             <button className="button-small button-hollow" onClick={this.addPattern}>Add</button>&nbsp;
                             <button className="button-small button-hollow" onClick={this.duplicateCopiedPattern} disabled={this.props.copiedPattern === undefined}>Paste</button>
                           </React.Fragment>;
      }
      else {
        popupMenuContent = <React.Fragment>
                             <button className="button-small button-hollow" onClick={this.copyPattern}>Copy</button>&nbsp;
                             <button className="button-small button-hollow" onClick={this.editPattern}>Edit</button>&nbsp;
                             <button className="button-small button-hollow" onClick={this.removePattern}>Remove</button>
                           </React.Fragment>;
      }
    }

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
             className={"relative flex flex-uniform-size flex-column m0 pl0 no-user-select border-box" + (this.state.isTimelineElementActive ? " overflow-hidden-x" : " overflow-scroll-x")} onScroll={this.onScroll}>
          <TimelineHeader measureCount={this.props.measureCount}
                          currentStep={this.props.currentStep}
                          setCurrentStep={this.props.setCurrentStep}
                          setIsTimelineElementActive={this.setIsTimelineElementActive} />
          <TimelineGrid tracks={this.props.tracks}
                        patterns={this.props.patterns}
                        measureCount={this.props.measureCount}
                        highlightedPatternID={this.state.highlightedPatternID}
                        isPopupMenuActive={this.state.isPopupMenuActive}
                        setHighlightedPattern={this.setHighlightedPattern}
                        setIsPopupMenuActive={this.setIsPopupMenuActive}
                        setPopupMenuPosition={this.setPopupMenuPosition}
                        movePattern={this.props.movePattern}
                        resizePattern={this.props.resizePattern}
                        changePatternPlaybackStepCount={this.props.changePatternPlaybackStepCount} />
          <span className="sequencer-playback-line" style={{left: `calc(${this.props.currentStep * STEP_WIDTH_IN_PIXELS}px + 1.0rem - 3px)`}}></span>
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
      {this.state.isPopupMenuActive === true &&
      <PopupMenu targetX={this.state.popupMenuTargetX}
                 targetY={this.state.popupMenuTargetY}
                 onMouseDown={this.onPopupMenuMouseDown}
                 content={popupMenuContent} />
      }
    </div>;
  };
};

export { Sequencer };
