"use strict";

import React from 'react';

class Key extends React.Component {
  constructor(props) {
    super(props);

    this.pressNote = this.pressNote.bind(this);
    this.releaseNote = this.releaseNote.bind(this);
  };

  pressNote(e) {
    console.log("Pressed note: " + e.target.dataset.note);
  };

  releaseNote(e) {
    console.log("Released note: " + e.target.dataset.note);
  };

  render() {
    let noteParts = this.props.noteName.split("-");
    let noteLabel = noteParts[0] + noteParts[1];
    let cssClass = noteParts[0].toLowerCase();
    let isWhiteKey = ["a", "b", "c", "d", "e", "f", "g"].includes(cssClass);
    let isBlackKey = ["a#", "c#", "d#", "f#", "g#"].includes(cssClass);
    let keyColorClass = (isWhiteKey) ? "keyboard-white-key" : "keyboard-black-key";

    return <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className={"inline-block keyboard-key " + keyColorClass + " " + cssClass} data-note={this.props.noteName}><span className="keyboard-key-label">{noteLabel}</span></span>
  };
};

class Keyboard extends React.Component {
  constructor(props) {
    super(props);
  };

  render() {
    return <div className="keyboard-outer-container flex">
      <div className="keyboard-scroll-button flex flex-align-center flex-justify-center full-height">&larr;</div>
      <div className="keyboard-container center">
        <div className="keyboard block border-box">
          <Key noteName={"F-1"} />
          <Key noteName={"F#-1"} />
          <Key noteName={"G-1"} />
          <Key noteName={"G#-1"} />
          <Key noteName={"A-2"} />
          <Key noteName={"A#-2"} />
          <Key noteName={"B-2"} />
          <Key noteName={"C-2"} />
          <Key noteName={"C#-2"} />
          <Key noteName={"D-2"} />
          <Key noteName={"D#-2"} />
          <Key noteName={"E-2"} />

          <Key noteName={"F-2"} />
          <Key noteName={"F#-2"} />
          <Key noteName={"G-2"} />
          <Key noteName={"G#-2"} />
          <Key noteName={"A-3"} />
          <Key noteName={"A#-3"} />
          <Key noteName={"B-3"} />
          <Key noteName={"C-3"} />
          <Key noteName={"C#-3"} />
          <Key noteName={"D-3"} />
          <Key noteName={"D#-3"} />
          <Key noteName={"E-3"} />

          <Key noteName={"F-3"} />
          <Key noteName={"F#-3"} />
          <Key noteName={"G-3"} />
          <Key noteName={"G#-3"} />
          <Key noteName={"A-4"} />
          <Key noteName={"A#-4"} />
          <Key noteName={"B-4"} />
          <Key noteName={"C-4"} />
          <Key noteName={"C#-4"} />
          <Key noteName={"D-4"} />
          <Key noteName={"D#-4"} />
          <Key noteName={"E-4"} />

          <Key noteName={"F-4"} />
          <Key noteName={"F#-4"} />
          <Key noteName={"G-4"} />
          <Key noteName={"G#-4"} />
          <Key noteName={"A-5"} />
          <Key noteName={"A#-5"} />
          <Key noteName={"B-5"} />
          <Key noteName={"C-5"} />
          <Key noteName={"C#-5"} />
          <Key noteName={"D-5"} />
          <Key noteName={"D#-5"} />
          <Key noteName={"E-5"} />

          <Key noteName={"F-5"} />
          <Key noteName={"F#-5"} />
          <Key noteName={"G-5"} />
          <Key noteName={"G#-5"} />
          <Key noteName={"A-6"} />
          <Key noteName={"A#-6"} />
          <Key noteName={"B-6"} />
          <Key noteName={"C-6"} />
          <Key noteName={"C#-6"} />
          <Key noteName={"D-6"} />
          <Key noteName={"D#-6"} />
          <Key noteName={"E-6"} />
          <Key noteName={"F-6"} />
        </div>
      </div>
      <div className="keyboard-scroll-button flex flex-align-center flex-justify-center full-height">&rarr;</div>
    </div>;
  };
};

export { Keyboard };
