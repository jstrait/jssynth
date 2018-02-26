"use strict";

import React from 'react';

class Key extends React.Component {
  constructor(props) {
    super(props);

    this.pressNote = this.pressNote.bind(this);
    this.releaseNote = this.releaseNote.bind(this);
    this.mouseOut = this.mouseOut.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
  };

  pressNote(e) {
    this.props.pressNote(this.props.noteName, this.props.octave);
  };

  releaseNote(e) {
    this.props.releaseNote(this.props.noteName, this.props.octave);
  };

  mouseOut(e) {
    this.props.releaseNote(this.props.noteName, this.props.octave);
  };

  mouseMove(e) {
    if (this.props.active && !this.props.activeNotes.includes(this.props.noteName + this.props.octave)) {
      this.props.pressNote(this.props.noteName, this.props.octave);
    }
  };

  render() {
    let noteLabel = this.props.noteName + this.props.octave;
    let cssClass = this.props.noteName.toLowerCase();
    let isWhiteKey = ["A", "B", "C", "D", "E", "F", "G"].includes(this.props.noteName);
    let isBlackKey = ["A#", "C#", "D#", "F#", "G#"].includes(this.props.noteName);
    let keyColorClass = (isWhiteKey) ? "keyboard-white-key" : "keyboard-black-key";
    let pressedClass = this.props.activeNotes.includes(noteLabel) ? "pressed" : "";

    return <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} onMouseOut={this.mouseOut} onMouseMove={this.mouseMove} className={"inline-block keyboard-key " + keyColorClass + " " + pressedClass + " " + cssClass} data-note={this.props.noteName + "-" + this.props.octave}><span className="keyboard-key-label">{noteLabel}</span></span>
  };
};

class Keyboard extends React.Component {
  constructor(props) {
    super(props);

    this.mouseDown = this.mouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
  };

  mouseDown(e) {
    this.props.activate();
  };

  mouseUp(e) {
    this.props.deactivate();
  };

  render() {
    return <div className="keyboard-outer-container flex" onMouseDown={this.mouseDown} onMouseUp={this.mouseUp}>
      <div className="keyboard-scroll-button flex flex-align-center flex-justify-center full-height">&larr;</div>
      <div className="keyboard-container center">
        <div className="keyboard block border-box">
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="F" octave="1" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="F#" octave="1" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="G" octave="1" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="G#" octave="1" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="A" octave="2" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="A#" octave="2" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="B" octave="2" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="C" octave="2" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="C#" octave="2" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="D" octave="2" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="D#" octave="2" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="E" octave="2" />

          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="F" octave="2" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="F#" octave="2" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="G" octave="2" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="G#" octave="2" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="A" octave="3" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="A#" octave="3" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="B" octave="3" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="C" octave="3" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="C#" octave="3" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="D" octave="3" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="D#" octave="3" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="E" octave="3" />

          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="F" octave="3" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="F#" octave="3" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="G" octave="3" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="G#" octave="3" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="A" octave="4" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="A#" octave="4" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="B" octave="4" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="C" octave="4" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="C#" octave="4" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="D" octave="4" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="D#" octave="4" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="E" octave="4" />

          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="F" octave="4" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="F#" octave="4" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="G" octave="4" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="G#" octave="4" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="A" octave="5" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="A#" octave="5" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="B" octave="5" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="C" octave="5" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="C#" octave="5" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="D" octave="5" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="D#" octave="5" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="E" octave="5" />

          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="F" octave="5" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="F#" octave="5" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="G" octave="5" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="G#" octave="5" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="A" octave="6" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="A#" octave="6" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="B" octave="6" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="C" octave="6" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="C#" octave="6" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="D" octave="6" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="D#" octave="6" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="E" octave="6" />
          <Key active={this.props.active} activeNotes={this.props.activeNotes} pressNote={this.props.pressNote} releaseNote={this.props.releaseNote} noteName="F" octave="6" />
        </div>
      </div>
      <div className="keyboard-scroll-button flex flex-align-center flex-justify-center full-height">&rarr;</div>
    </div>;
  };
};

export { Keyboard };
