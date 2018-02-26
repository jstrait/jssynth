"use strict";

import React from 'react';

class Keyboard extends React.Component {
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
    return <div className="keyboard-outer-container flex">
      <div className="keyboard-scroll-button flex flex-align-center flex-justify-center full-height">&larr;</div>
      <div className="keyboard-container center">
        <div className="keyboard block border-box">
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key f" data-note="F-1"><span className="keyboard-key-label">F1</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key f-sharp" data-note="F#-1"><span className="keyboard-key-label">F&#9839;1</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key g" data-note="G-1"><span className="keyboard-key-label">G1</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key g-sharp" data-note="G#-1"><span className="keyboard-key-label">G&#9839;1</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key a" data-note="A-2"><span className="keyboard-key-label">A2</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key a-sharp" data-note="A#-2"><span className="keyboard-key-label">A&#9839;2</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key b" data-note="B-2"><span className="keyboard-key-label">B2</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key c" data-note="C-2"><span className="keyboard-key-label">C2</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key c-sharp" data-note="C#-2"><span className="keyboard-key-label">C&#9839;2</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key d" data-note="D-2"><span className="keyboard-key-label">D2</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key d-sharp" data-note="D#-2"><span className="keyboard-key-label">D&#9839;2</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key e" data-note="E-2"><span className="keyboard-key-label">E2</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key f" data-note="F-2"><span className="keyboard-key-label">F2</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key f-sharp" data-note="F#-2"><span className="keyboard-key-label">F&#9839;2</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key g" data-note="G-2"><span className="keyboard-key-label">G2</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key g-sharp" data-note="G#-2"><span className="keyboard-key-label">G&#9839;2</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key a" data-note="A-3"><span className="keyboard-key-label">A3</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key a-sharp" data-note="A#-3"><span className="keyboard-key-label">A&#9839;3</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key b" data-note="B-3"><span className="keyboard-key-label">B3</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key c" data-note="C-3"><span className="keyboard-key-label">C3</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key c-sharp" data-note="C#-3"><span className="keyboard-key-label">C&#9839;3</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key d" data-note="D-3"><span className="keyboard-key-label">D3</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key d-sharp" data-note="D#-3"><span className="keyboard-key-label">D&#9839;3</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key e" data-note="E-3"><span className="keyboard-key-label">E3</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key f" data-note="F-3"><span className="keyboard-key-label">F3</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key f-sharp" data-note="F#-3"><span className="keyboard-key-label">F&#9839;3</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key g" data-note="G-3"><span className="keyboard-key-label">G3</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key g-sharp" data-note="G#-3"><span className="keyboard-key-label">G&#9839;3</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key a" data-note="A-4"><span className="keyboard-key-label">A4</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key a-sharp" data-note="A#-4"><span className="keyboard-key-label">A&#9839;4</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key b" data-note="B-4"><span className="keyboard-key-label">B4</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key c" data-note="C-4"><span className="keyboard-key-label">C4</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key c-sharp" data-note="C#-4"><span className="keyboard-key-label">C&#9839;4</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key d" data-note="D-4"><span className="keyboard-key-label">D4</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key d-sharp" data-note="D#-4"><span className="keyboard-key-label">D&#9839;4</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key e" data-note="E-4"><span className="keyboard-key-label">E4</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key f" data-note="F-4"><span className="keyboard-key-label">F4</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key f-sharp" data-note="F#-4"><span className="keyboard-key-label">F&#9839;4</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key g" data-note="G-4"><span className="keyboard-key-label">G4</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key g-sharp" data-note="G#-4"><span className="keyboard-key-label">G&#9839;4</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key a" data-note="A-5"><span className="keyboard-key-label">A5</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key a-sharp" data-note="A#-5"><span className="keyboard-key-label">A&#9839;5</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key b" data-note="B-5"><span className="keyboard-key-label">B5</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key c" data-note="C-5"><span className="keyboard-key-label">C5</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key c-sharp" data-note="C#-5"><span className="keyboard-key-label">C&#9839;5</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key d" data-note="D-5"><span className="keyboard-key-label">D5</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key d-sharp" data-note="D#-5"><span className="keyboard-key-label">D&#9839;5</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key e" data-note="E-5"><span className="keyboard-key-label">E5</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key f" data-note="F-5"><span className="keyboard-key-label">F5</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key f-sharp" data-note="F#-5"><span className="keyboard-key-label">F&#9839;5</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key g" data-note="G-5"><span className="keyboard-key-label">G5</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key g-sharp" data-note="G#-5"><span className="keyboard-key-label">G&#9839;5</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key a" data-note="A-6"><span className="keyboard-key-label">A6</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key a-sharp" data-note="A#-6"><span className="keyboard-key-label">A&#9839;6</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key b" data-note="B-6"><span className="keyboard-key-label">B6</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key c" data-note="C-6"><span className="keyboard-key-label">C6</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key c-sharp" data-note="C#-6"><span className="keyboard-key-label">C&#9839;6</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key d" data-note="D-6"><span className="keyboard-key-label">D6</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-black-key d-sharp" data-note="D#-6"><span className="keyboard-key-label">D&#9839;6</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key e" data-note="E-6"><span className="keyboard-key-label">E6</span></span>
          <span onMouseDown={this.pressNote} onMouseUp={this.releaseNote} className="inline-block keyboard-key keyboard-white-key f" data-note="F-6"><span className="keyboard-key-label">F6</span></span>
        </div>
      </div>
      <div className="keyboard-scroll-button flex flex-align-center flex-justify-center full-height">&rarr;</div>
    </div>;
  };
};

export { Keyboard };
