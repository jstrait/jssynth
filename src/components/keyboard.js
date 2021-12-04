"use strict";

import React from "react";

const NOTE_NAMES = ["A", "B", "C", "D", "E", "F", "G"];

class Key extends React.PureComponent {
  constructor(props) {
    super(props);
  };

  render() {
    let noteString = this.props.noteName + this.props.octave;
    let isWhiteKey = NOTE_NAMES.includes(this.props.noteName);
    let keyColorClass = (isWhiteKey) ? "keyboard-white-key" : "keyboard-black-key";
    let pressedClass = this.props.isActive ? "pressed" : "";

    let rootNoteIndicator;
    if (this.props.rootNote === noteString) {
      rootNoteIndicator = <span className="keyboard-key-root-indicator">Root</span>;
    }

    return <span className={"inline-block keyboard-key " + keyColorClass + " " + pressedClass} data-note={noteString}>
      <span className="keyboard-key-label">{rootNoteIndicator}{this.props.label}</span>
    </span>;
  };
};

class Keyboard extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      scrollLeftTimeoutID: undefined,
      scrollRightTimeoutID: undefined,
    };

    this.touchHandler = this.touchHandler.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onGestureStart = this.onGestureStart.bind(this);
    this.onScroll = this.onScroll.bind(this);

    this.touches = {};
  };

  touchHandler(touches) {
    const SCROLL_AMOUNT = 10;
    let key;
    let isLeftScrollActive = false;
    let isRightScrollActive = false;
    let newScrollLeftTimeoutID = this.state.scrollLeftTimeoutID;
    let newScrollRightTimeoutID = this.state.scrollRightTimeoutID;
    let activeNotes = [];

    for (key in touches) {
      let elementUnderCursor = document.elementFromPoint(touches[key].x, touches[key].y);

      if (elementUnderCursor !== null) {
        if (elementUnderCursor.classList.contains("js-keyboard-scroll-left")) {
          isLeftScrollActive = true;
          if (this.state.scrollLeftTimeoutID === undefined) {
            newScrollLeftTimeoutID = setInterval(() => this.onScroll(-SCROLL_AMOUNT), 15);
          }
        }
        else if (elementUnderCursor.classList.contains("js-keyboard-scroll-right")) {
          isRightScrollActive = true;
          if (this.state.scrollRightTimeoutID === undefined) {
            newScrollRightTimeoutID = setInterval(() => this.onScroll(SCROLL_AMOUNT), 15);
          }
        }
        else if (elementUnderCursor.classList.contains("keyboard-key")) {
          activeNotes.push(elementUnderCursor.dataset.note);
        }
      }
    }

    if (!isLeftScrollActive && this.state.scrollLeftTimeoutID !== undefined) {
      clearInterval(this.state.scrollLeftTimeoutID);
      newScrollLeftTimeoutID = undefined;
    }
    if (!isRightScrollActive && this.state.scrollRightTimeoutID !== undefined) {
      clearInterval(this.state.scrollRightTimeoutID);
      newScrollRightTimeoutID = undefined;
    }

    if (newScrollLeftTimeoutID !== this.state.scrollLeftTimeoutID || newScrollRightTimeoutID !== this.state.scrollRightTimeoutID) {
      this.setState({
        scrollLeftTimeoutID: newScrollLeftTimeoutID,
        scrollRightTimeoutID: newScrollRightTimeoutID,
      });
    }

    this.props.setNotes(activeNotes);
  };

  onMouseDown(e) {
    const RIGHT_MOUSE_BUTTON = 2;

    if (e.button === RIGHT_MOUSE_BUTTON) {
      return;
    }

    this.props.activate();
    this.touches[-1] = { x: e.clientX, y: e.clientY };
    this.touchHandler(this.touches);
  };

  onMouseUp(e) {
    this.props.deactivate();
    delete this.touches[-1];
    this.touchHandler(this.touches);
  };

  onMouseMove(e) {
    if (this.props.isActive) {
      this.touches[-1] = { x: e.clientX, y: e.clientY };
      this.touchHandler(this.touches);
    }
  };

  onMouseOut(e) {
    if (this.props.isActive) {
      this.touches[-1] = { x: e.clientX, y: e.clientY };
      this.touchHandler(this.touches);
    }
  };

  onMouseOver(e) {
    let noMouseButtonsPressed = false;

    if (e.buttons !== undefined && e.buttons === 0) {
      noMouseButtonsPressed = true;
    }
    // Safari, as of v11, doesn't support `buttons`, but it does support the non-standard `which`
    else if (e.nativeEvent.which !== undefined && e.nativeEvent.which === 0) {
      noMouseButtonsPressed = true;
    }

    if (noMouseButtonsPressed === true) {
      // Only deactivate if current active, to avoid performing a
      // no-op state change and re-rendering of unrelated components.
      if (this.props.isActive) {
        this.props.deactivate();
      }
    }
  };

  onTouchStart(e) {
    let i;
    let touch;
    let newTouches = e.changedTouches;

    // Fix for Safari to prevent text on the rest of the page from being selected during a
    // long press on iOS, or when the mouse is moved out of the timeline grid during the drag.
    document.body.classList.add("user-select-none");

    this.props.activate();

    for (i = 0; i < newTouches.length; i++) {
      touch = newTouches.item(i);
      this.touches[touch.identifier] = { x: touch.clientX, y: touch.clientY };
    }

    this.touchHandler(this.touches);
  };

  onTouchEnd(e) {
    let i;
    let removedTouches = e.changedTouches;

    for (i = 0; i < removedTouches.length; i++) {
      delete this.touches[removedTouches.item(i).identifier];
    }

    this.touchHandler(this.touches);
    if (Object.keys(this.touches).length === 0) {
      document.body.classList.remove("user-select-none");
      this.props.deactivate();
    }

    // Prevent page zoom from double tap
    e.preventDefault();
  };

  onTouchMove(e) {
    let i;
    let touch;
    let newTouches = e.changedTouches;

    for (i = 0; i < newTouches.length; i++) {
      touch = newTouches.item(i);
      this.touches[touch.identifier] = { x: touch.clientX, y: touch.clientY };
    }

    this.touchHandler(this.touches);

    // Prevent page from scrolling vertically or zooming in while dragging on keyboard
    e.preventDefault();
  };

  onGestureStart(e) {
    e.preventDefault();
  };

  onScroll(delta) {
    this.keyboardContainer.scrollLeft += delta;
  };

  componentDidMount() {
    this.keyboardContainer.scrollLeft = (this.keyboardContainer.scrollWidth / 2) - (this.keyboardContainer.clientWidth / 2);

    // This event handler is added manually to the actual DOM element, instead of using the
    // normal React way of attaching events because React seems to have a bug that prevents
    // preventDefault() from working correctly in a "touchmove" handler (as of v17.0.2).
    // The preventDefault() is needed to prevent the "pinch zoom into page" gesture from
    // activating when using the keyboard on iOS.
    // See https://medium.com/@ericclemmons/react-event-preventdefault-78c28c950e46 and
    // https://github.com/facebook/react/issues/9809.
    this.keyboardOuterContainer.addEventListener("touchmove", this.onTouchMove, false);

    // This prevents the "three finger page zoom" gesture on iOS while using the piano keyboard,
    // because it makes it very difficult to play chords without accidentally changing the page zoom.
    // React doesn't support the "gesturestart" event, so adding it manually.
    this.keyboardOuterContainer.addEventListener("gesturestart", this.onGestureStart, false);
  };

  componentWillUnmount() {
    this.keyboardOuterContainer.removeEventListener("touchmove", this.onTouchMove);
    this.keyboardOuterContainer.removeEventListener("gesturestart", this.onGestureStart);
  };

  render() {
    let rootNote = this.props.rootNoteName + this.props.rootNoteOctave;

    return <div
             ref={(el) => { this.keyboardOuterContainer = el; }}
             className="keyboard-outer-container flex user-select-none"
             onMouseDown={this.onMouseDown}
             onMouseUp={this.onMouseUp}
             onMouseMove={this.onMouseMove}
             onMouseOut={this.onMouseOut}
             onMouseOver={this.onMouseOver}
             onTouchStart={this.onTouchStart}
             onTouchEnd={this.onTouchEnd}
           >
      <div className={"keyboard-scroll-button js-keyboard-scroll-left flex flex-align-center flex-justify-center full-height" + (this.state.scrollLeftTimeoutID !== undefined ? " pressed" : "")}>&larr;</div>
      <div className="keyboard-container" ref={(div) => { this.keyboardContainer = div; }}>
        <div className="keyboard block border-box">
          <Key isActive={this.props.activeNotes.includes("C0")} noteName="C" octave="0" rootNote={rootNote} label="C0" />
          <Key isActive={this.props.activeNotes.includes("C#0")} noteName="C#" octave="0" rootNote={rootNote} label="C♯0 D♭0" />
          <Key isActive={this.props.activeNotes.includes("D0")} noteName="D" octave="0" rootNote={rootNote} label="D0" />
          <Key isActive={this.props.activeNotes.includes("D#0")} noteName="D#" octave="0" rootNote={rootNote} label="D♯0 E♭0" />
          <Key isActive={this.props.activeNotes.includes("E0")} noteName="E" octave="0" rootNote={rootNote} label="E0" />
          <Key isActive={this.props.activeNotes.includes("F0")} noteName="F" octave="0" rootNote={rootNote} label="F0" />
          <Key isActive={this.props.activeNotes.includes("F#0")} noteName="F#" octave="0" rootNote={rootNote} label="F♯0 G♭0" />
          <Key isActive={this.props.activeNotes.includes("G0")} noteName="G" octave="0" rootNote={rootNote} label="G0" />
          <Key isActive={this.props.activeNotes.includes("G#0")} noteName="G#" octave="0" rootNote={rootNote} label="G♯0 A♭0" />
          <Key isActive={this.props.activeNotes.includes("A0")} noteName="A" octave="0" rootNote={rootNote} label="A0" />
          <Key isActive={this.props.activeNotes.includes("A#0")} noteName="A#" octave="0" rootNote={rootNote} label="A♯0 B♭0" />
          <Key isActive={this.props.activeNotes.includes("B0")} noteName="B" octave="0" rootNote={rootNote} label="B0" />

          <Key isActive={this.props.activeNotes.includes("C1")} noteName="C" octave="1" rootNote={rootNote} label="C1" />
          <Key isActive={this.props.activeNotes.includes("C#1")} noteName="C#" octave="1" rootNote={rootNote} label="C♯1 D♭1" />
          <Key isActive={this.props.activeNotes.includes("D1")} noteName="D" octave="1" rootNote={rootNote} label="D1" />
          <Key isActive={this.props.activeNotes.includes("D#1")} noteName="D#" octave="1" rootNote={rootNote} label="D♯1 E♭1" />
          <Key isActive={this.props.activeNotes.includes("E1")} noteName="E" octave="1" rootNote={rootNote} label="E1" />
          <Key isActive={this.props.activeNotes.includes("F1")} noteName="F" octave="1" rootNote={rootNote} label="F1" />
          <Key isActive={this.props.activeNotes.includes("F#1")} noteName="F#" octave="1" rootNote={rootNote} label="F♯1 G♭1" />
          <Key isActive={this.props.activeNotes.includes("G1")} noteName="G" octave="1" rootNote={rootNote} label="G1" />
          <Key isActive={this.props.activeNotes.includes("G#1")} noteName="G#" octave="1" rootNote={rootNote} label="G♯1 A♭1" />
          <Key isActive={this.props.activeNotes.includes("A1")} noteName="A" octave="1" rootNote={rootNote} label="A1" />
          <Key isActive={this.props.activeNotes.includes("A#1")} noteName="A#" octave="1" rootNote={rootNote} label="A♯1 B♭1" />
          <Key isActive={this.props.activeNotes.includes("B1")} noteName="B" octave="1" rootNote={rootNote} label="B1" />

          <Key isActive={this.props.activeNotes.includes("C2")} noteName="C" octave="2" rootNote={rootNote} label="C2" />
          <Key isActive={this.props.activeNotes.includes("C#2")} noteName="C#" octave="2" rootNote={rootNote} label="C♯2 D♭2" />
          <Key isActive={this.props.activeNotes.includes("D2")} noteName="D" octave="2" rootNote={rootNote} label="D2" />
          <Key isActive={this.props.activeNotes.includes("D#2")} noteName="D#" octave="2" rootNote={rootNote} label="D♯2 E♭2" />
          <Key isActive={this.props.activeNotes.includes("E2")} noteName="E" octave="2" rootNote={rootNote} label="E2" />
          <Key isActive={this.props.activeNotes.includes("F2")} noteName="F" octave="2" rootNote={rootNote} label="F2" />
          <Key isActive={this.props.activeNotes.includes("F#2")} noteName="F#" octave="2" rootNote={rootNote} label="F♯2 G♭2" />
          <Key isActive={this.props.activeNotes.includes("G2")} noteName="G" octave="2" rootNote={rootNote} label="G2" />
          <Key isActive={this.props.activeNotes.includes("G#2")} noteName="G#" octave="2" rootNote={rootNote} label="G♯2 A♭2" />
          <Key isActive={this.props.activeNotes.includes("A2")} noteName="A" octave="2" rootNote={rootNote} label="A2" />
          <Key isActive={this.props.activeNotes.includes("A#2")} noteName="A#" octave="2" rootNote={rootNote} label="A♯2 B♭2" />
          <Key isActive={this.props.activeNotes.includes("B2")} noteName="B" octave="2" rootNote={rootNote} label="B2" />

          <Key isActive={this.props.activeNotes.includes("C3")} noteName="C" octave="3" rootNote={rootNote} label="C3" />
          <Key isActive={this.props.activeNotes.includes("C#3")} noteName="C#" octave="3" rootNote={rootNote} label="C♯3 D♭3" />
          <Key isActive={this.props.activeNotes.includes("D3")} noteName="D" octave="3" rootNote={rootNote} label="D3" />
          <Key isActive={this.props.activeNotes.includes("D#3")} noteName="D#" octave="3" rootNote={rootNote} label="D♯3 E♭3" />
          <Key isActive={this.props.activeNotes.includes("E3")} noteName="E" octave="3" rootNote={rootNote} label="E3" />
          <Key isActive={this.props.activeNotes.includes("F3")} noteName="F" octave="3" rootNote={rootNote} label="F3" />
          <Key isActive={this.props.activeNotes.includes("F#3")} noteName="F#" octave="3" rootNote={rootNote} label="F♯3 G♭3" />
          <Key isActive={this.props.activeNotes.includes("G3")} noteName="G" octave="3" rootNote={rootNote} label="G3" />
          <Key isActive={this.props.activeNotes.includes("G#3")} noteName="G#" octave="3" rootNote={rootNote} label="G♯3 A♭3" />
          <Key isActive={this.props.activeNotes.includes("A3")} noteName="A" octave="3" rootNote={rootNote} label="A3" />
          <Key isActive={this.props.activeNotes.includes("A#3")} noteName="A#" octave="3" rootNote={rootNote} label="A♯3 B♭3" />
          <Key isActive={this.props.activeNotes.includes("B3")} noteName="B" octave="3" rootNote={rootNote} label="B3" />

          <Key isActive={this.props.activeNotes.includes("C4")} noteName="C" octave="4" rootNote={rootNote} label="C4" />
          <Key isActive={this.props.activeNotes.includes("C#4")} noteName="C#" octave="4" rootNote={rootNote} label="C♯4 D♭4" />
          <Key isActive={this.props.activeNotes.includes("D4")} noteName="D" octave="4" rootNote={rootNote} label="D4" />
          <Key isActive={this.props.activeNotes.includes("D#4")} noteName="D#" octave="4" rootNote={rootNote} label="D♯4 E♭4" />
          <Key isActive={this.props.activeNotes.includes("E4")} noteName="E" octave="4" rootNote={rootNote} label="E4" />
          <Key isActive={this.props.activeNotes.includes("F4")} noteName="F" octave="4" rootNote={rootNote} label="F4" />
          <Key isActive={this.props.activeNotes.includes("F#4")} noteName="F#" octave="4" rootNote={rootNote} label="F♯4 G♭4" />
          <Key isActive={this.props.activeNotes.includes("G4")} noteName="G" octave="4" rootNote={rootNote} label="G4" />
          <Key isActive={this.props.activeNotes.includes("G#4")} noteName="G#" octave="4" rootNote={rootNote} label="G♯4 A♭4" />
          <Key isActive={this.props.activeNotes.includes("A4")} noteName="A" octave="4" rootNote={rootNote} label="A4" />
          <Key isActive={this.props.activeNotes.includes("A#4")} noteName="A#" octave="4" rootNote={rootNote} label="A♯4 B♭4" />
          <Key isActive={this.props.activeNotes.includes("B4")} noteName="B" octave="4" rootNote={rootNote} label="B4" />

          <Key isActive={this.props.activeNotes.includes("C5")} noteName="C" octave="5" rootNote={rootNote} label="C5" />
          <Key isActive={this.props.activeNotes.includes("C#5")} noteName="C#" octave="5" rootNote={rootNote} label="C♯5 D♭5" />
          <Key isActive={this.props.activeNotes.includes("D5")} noteName="D" octave="5" rootNote={rootNote} label="D5" />
          <Key isActive={this.props.activeNotes.includes("D#5")} noteName="D#" octave="5" rootNote={rootNote} label="D♯5 E♭5" />
          <Key isActive={this.props.activeNotes.includes("E5")} noteName="E" octave="5" rootNote={rootNote} label="E5" />
          <Key isActive={this.props.activeNotes.includes("F5")} noteName="F" octave="5" rootNote={rootNote} label="F5" />
          <Key isActive={this.props.activeNotes.includes("F#5")} noteName="F#" octave="5" rootNote={rootNote} label="F♯5 G♭5" />
          <Key isActive={this.props.activeNotes.includes("G5")} noteName="G" octave="5" rootNote={rootNote} label="G5" />
          <Key isActive={this.props.activeNotes.includes("G#5")} noteName="G#" octave="5" rootNote={rootNote} label="G♯5 A♭5" />
          <Key isActive={this.props.activeNotes.includes("A5")} noteName="A" octave="5" rootNote={rootNote} label="A5" />
          <Key isActive={this.props.activeNotes.includes("A#5")} noteName="A#" octave="5" rootNote={rootNote} label="A♯5 B♭5" />
          <Key isActive={this.props.activeNotes.includes("B5")} noteName="B" octave="5" rootNote={rootNote} label="B5" />

          <Key isActive={this.props.activeNotes.includes("C6")} noteName="C" octave="6" rootNote={rootNote} label="C6" />
          <Key isActive={this.props.activeNotes.includes("C#6")} noteName="C#" octave="6" rootNote={rootNote} label="C♯6 D♭6" />
          <Key isActive={this.props.activeNotes.includes("D6")} noteName="D" octave="6" rootNote={rootNote} label="D6" />
          <Key isActive={this.props.activeNotes.includes("D#6")} noteName="D#" octave="6" rootNote={rootNote} label="D♯6 E♭6" />
          <Key isActive={this.props.activeNotes.includes("E6")} noteName="E" octave="6" rootNote={rootNote} label="E6" />
          <Key isActive={this.props.activeNotes.includes("F6")} noteName="F" octave="6" rootNote={rootNote} label="F6" />
          <Key isActive={this.props.activeNotes.includes("F#6")} noteName="F#" octave="6" rootNote={rootNote} label="F♯6 G♭6" />
          <Key isActive={this.props.activeNotes.includes("G6")} noteName="G" octave="6" rootNote={rootNote} label="G6" />
          <Key isActive={this.props.activeNotes.includes("G#6")} noteName="G#" octave="6" rootNote={rootNote} label="G♯6 A♭6" />
          <Key isActive={this.props.activeNotes.includes("A6")} noteName="A" octave="6" rootNote={rootNote} label="A6" />
          <Key isActive={this.props.activeNotes.includes("A#6")} noteName="A#" octave="6" rootNote={rootNote} label="A♯6 B♭6" />
          <Key isActive={this.props.activeNotes.includes("B6")} noteName="B" octave="6" rootNote={rootNote} label="B6" />

          <Key isActive={this.props.activeNotes.includes("C7")} noteName="C" octave="7" rootNote={rootNote} label="C7" />
          <Key isActive={this.props.activeNotes.includes("C#7")} noteName="C#" octave="7" rootNote={rootNote} label="C♯7 D♭7" />
          <Key isActive={this.props.activeNotes.includes("D7")} noteName="D" octave="7" rootNote={rootNote} label="D7" />
          <Key isActive={this.props.activeNotes.includes("D#7")} noteName="D#" octave="7" rootNote={rootNote} label="D♯7 E♭7" />
          <Key isActive={this.props.activeNotes.includes("E7")} noteName="E" octave="7" rootNote={rootNote} label="E7" />
          <Key isActive={this.props.activeNotes.includes("F7")} noteName="F" octave="7" rootNote={rootNote} label="F7" />
          <Key isActive={this.props.activeNotes.includes("F#7")} noteName="F#" octave="7" rootNote={rootNote} label="F♯7 G♭7" />
          <Key isActive={this.props.activeNotes.includes("G7")} noteName="G" octave="7" rootNote={rootNote} label="G7" />
          <Key isActive={this.props.activeNotes.includes("G#7")} noteName="G#" octave="7" rootNote={rootNote} label="G♯7 A♭7" />
          <Key isActive={this.props.activeNotes.includes("A7")} noteName="A" octave="7" rootNote={rootNote} label="A7" />
          <Key isActive={this.props.activeNotes.includes("A#7")} noteName="A#" octave="7" rootNote={rootNote} label="A♯7 B♭7" />
          <Key isActive={this.props.activeNotes.includes("B7")} noteName="B" octave="7" rootNote={rootNote} label="B7" />
        </div>
      </div>
      <div className={"keyboard-scroll-button js-keyboard-scroll-right flex flex-align-center flex-justify-center full-height" + (this.state.scrollRightTimeoutID !== undefined ? " pressed" : "")}>&rarr;</div>
    </div>;
  };
};

export { Keyboard };
