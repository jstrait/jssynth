"use strict";

import React from "react";

class PatternHeader extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      tipsAndTricksVisible: false,
    };

    this.setPatternName = this.setPatternName.bind(this);
    this.setTipsAndTricksVisible = this.setTipsAndTricksVisible.bind(this);
  };

  setPatternName(e) {
    this.props.setPatternName(this.props.patternID, e.target.value);
  };

  setTipsAndTricksVisible(e) {
    this.setState((prevState, props) => ({
      tipsAndTricksVisible: !prevState.tipsAndTricksVisible,
    }));
  };

  render() {
    return <React.Fragment>
      <div>
        <label className="bold">Name:</label>&nbsp;<input className="input-underlined" type="text" value={this.props.patternName} onChange={this.setPatternName} />
        <button className="button-link block inline-l ml-half-l" onClick={this.setTipsAndTricksVisible}>Tips and Tricks</button>
      </div>
      {(this.state.tipsAndTricksVisible === true) &&
      <ul className="mt0 mb0">
        <li>To enter a note, select a note box, and either play a note on the on-screen keyboard or type the note name.</li>
        <li>A note is a letter between A and G plus an octave between 0 and 7. For example: <b>A3</b>, <b>C♯4</b>, <b>E♭2</b></li>
        <li>Use &lsquo;#&rsquo; to enter a sharp, and &lsquo;@&rsquo; to enter a flat. Press twice to double sharp/flat, thrice to remove the sharp/flat.</li>
        <li>Use &mdash; to lengthen a note. For example, &lsquo;A4 &mdash; &mdash; &mdash;&rsquo; will last for 4 steps, while &lsquo;A4 &mdash;&rsquo; will last for two, and &lsquo;A4&rsquo; will last for one.</li>
        <li>Press <code>SPACE</code>, <code>DELETE</code>, or <code>BACKSPACE</code> to clear the current note.</li>
        <li>Use the left/right arrow keys to move between notes, and the up/down arrow keys to move between rows.</li>
      </ul>
      }
    </React.Fragment>;
  };
};

class NoteBox extends React.Component {
  constructor(props) {
    super(props);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.noteIsValid = this.noteIsValid.bind(this);
    this.formatNote = this.formatNote.bind(this);
  };

  onMouseDown(e) {
    this.props.setSelectedPatternNoteIndex(this.props.rowIndex, this.props.noteIndex);
    e.preventDefault();
  };

  onTouchStart(e) {
    this.props.setSelectedPatternNoteIndex(this.props.rowIndex, this.props.noteIndex);
  };

  noteIsValid(rawNoteString) {
    return /^$|^-$|^ $|(^[A-G](@|@@|#|##){0,1}[0-7]$)/.test(rawNoteString);
  };

  formatNote(rawNoteString) {
    let formattedNoteName = rawNoteString;

    formattedNoteName = formattedNoteName.toUpperCase();
    formattedNoteName = formattedNoteName.replace("##", "𝄪");
    formattedNoteName = formattedNoteName.replace("#", "♯");
    formattedNoteName = formattedNoteName.replace("@@", "𝄫");
    formattedNoteName = formattedNoteName.replace("@", "♭");
    formattedNoteName = formattedNoteName.replace("-", "—");

    return formattedNoteName;
  };

  render() {
    let formattedNoteName = this.formatNote(this.props.note.name);
    let noteIsSelected = this.props.selectedPatternRowIndex === this.props.rowIndex &&
                         this.props.selectedPatternNoteIndex === this.props.noteIndex;
    let noteIsValid = noteIsSelected || this.noteIsValid(this.props.note.name);

    return <span className={"note-box" + (noteIsValid ? "" : " note-box-invalid") + (noteIsSelected ? " note-box-focused" : "")} onMouseDown={this.onMouseDown} onTouchStart={this.onTouchStart}>{formattedNoteName}</span>
  };
};

class NoteInput extends React.Component {
  constructor(props) {
    super(props);

    this.setNoteValue = this.setNoteValue.bind(this);
    this.extractNoteParts = this.extractNoteParts.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  };

  setNoteValue(newNoteValue) {
    this.props.setNoteValue(newNoteValue, this.props.patternID, this.props.selectedPatternRowIndex, this.props.selectedPatternNoteIndex);
  };

  extractNoteParts(noteString) {
    let noteNameMatches = noteString.match(/^[A-G]/);
    let noteName = (noteNameMatches === null) ? "" : noteNameMatches[0];
    let octaveMatches = noteString.match(/\d$/);
    let octave = (octaveMatches === null) ? "" : octaveMatches[0];

    let modifier = noteString;
    if (noteName !== "") {
      modifier = noteString.slice(1);
    }
    if (octave !== "") {
      modifier = modifier.slice(0, modifier.length - 1);
    }

    return {noteName: noteName, modifier: modifier, octave: octave};
  };

  onBlur(e) {
    if (!this.props.keyboardActive) {
      this.props.setSelectedPatternNoteIndex(undefined, undefined);
    }
  };

  onKeyDown(e) {
    const SPACE = 32;
    const DELETE = 46;
    const BACKSPACE = 8;
    const ZERO = 48;
    const TWO = 50;
    const THREE = 51;
    const FOUR = 52;
    const SIX = 54;
    const NINE = 57;
    const A = 65;
    const G = 71;
    const DASH = 189;
    const DASH_FIREFOX = 173;  // Firefox has a different keycode from the "-" key than other browsers
    const LEFT_ARROW = 37;
    const RIGHT_ARROW = 39;
    const UP_ARROW = 38;
    const DOWN_ARROW = 40;

    let element = e.target;
    let noteParts;

    if (e.keyCode === SPACE || e.keyCode === DELETE || e.keyCode === BACKSPACE) {
      this.setNoteValue("");
    }
    else if (e.keyCode === TWO && e.shiftKey) {
      noteParts = this.extractNoteParts(this.props.note.name);

      if (noteParts.modifier === "" || noteParts.modifier === "@") {
        noteParts.modifier += "@";
      }
      else if (noteParts.modifier === "@@") {
        noteParts.modifier = "";
      }
      else {
        noteParts.modifier = "@";
      }

      this.setNoteValue(noteParts.noteName + noteParts.modifier + noteParts.octave);
    }
    else if (e.keyCode === THREE && e.shiftKey) {
      noteParts = this.extractNoteParts(this.props.note.name);

      if (noteParts.modifier === "" || noteParts.modifier === "#") {
        noteParts.modifier += "#";
      }
      else if (noteParts.modifier === "##") {
        noteParts.modifier = "";
      }
      else {
        noteParts.modifier = "#";
      }

      this.setNoteValue(noteParts.noteName + noteParts.modifier + noteParts.octave);
    }
    else if (e.keyCode === FOUR && e.shiftKey) {
      this.props.setSelectedPatternNoteIndex(this.props.selectedPatternRowIndex, this.props.noteCount - 1);
    }
     else if (e.keyCode === SIX && e.shiftKey) {
      this.props.setSelectedPatternNoteIndex(this.props.selectedPatternRowIndex, 0);
    }
    else if (e.keyCode >= ZERO && e.keyCode <= NINE && !e.shiftKey) {
      noteParts = this.extractNoteParts(this.props.note.name);

      if (noteParts.modifier === "-") {
        noteParts.modifier = "";
      }

      this.setNoteValue(noteParts.noteName + noteParts.modifier + String.fromCharCode(e.keyCode));
    }
    else if (e.keyCode >= A && e.keyCode <= G) {
      noteParts = this.extractNoteParts(this.props.note.name);

      if (noteParts.modifier === "-") {
        noteParts.modifier = "";
      }

      this.setNoteValue(String.fromCharCode(e.keyCode) + noteParts.modifier + noteParts.octave);
    }
    else if ((e.keyCode === DASH || e.keyCode === DASH_FIREFOX) && !e.shiftKey) {
      this.setNoteValue("-");
    }
    else if (e.keyCode === LEFT_ARROW) {
      if (this.props.selectedPatternNoteIndex > 0) {
        this.props.setSelectedPatternNoteIndex(this.props.selectedPatternRowIndex, this.props.selectedPatternNoteIndex - 1);
      }
    }
    else if (e.keyCode === RIGHT_ARROW) {
      if (this.props.selectedPatternNoteIndex < this.props.noteCount - 1) {
        this.props.setSelectedPatternNoteIndex(this.props.selectedPatternRowIndex, this.props.selectedPatternNoteIndex + 1);
      }
    }
    else if (e.keyCode === UP_ARROW) {
      if (this.props.selectedPatternRowIndex > 0) {
        this.props.setSelectedPatternNoteIndex(this.props.selectedPatternRowIndex - 1, this.props.selectedPatternNoteIndex);
      }
    }
    else if (e.keyCode === DOWN_ARROW) {
      if (this.props.selectedPatternRowIndex < this.props.rowCount - 1) {
        this.props.setSelectedPatternNoteIndex(this.props.selectedPatternRowIndex + 1, this.props.selectedPatternNoteIndex);
      }
    }

    e.preventDefault();
  };

  componentDidUpdate() {
    if (this.props.selectedPatternRowIndex !== undefined && this.props.selectedPatternNoteIndex !== undefined) {
      this.noteInput.focus();
    }
  };

  render() {
    return <input ref={(input) => { this.noteInput = input; }} className="hidden-input" type="text" readOnly={true} onKeyDown={this.onKeyDown} onBlur={this.onBlur} />
  };
};

class PatternRowRemoveButton extends React.PureComponent {
  constructor(props) {
    super(props);

    this.removePatternRow = this.removePatternRow.bind(this);
  }

  removePatternRow(e) {
    this.props.removePatternRow(this.props.patternID, this.props.rowIndex);
  };

  render() {
    return <button className="button-small button-hollow full-width round" onClick={this.removePatternRow}>X</button>;
  };
};

class PatternEditor extends React.Component {
  constructor(props) {
    super(props);

    this.close = this.close.bind(this);
    this.addPatternRow = this.addPatternRow.bind(this);
    this.removePatternRow = this.removePatternRow.bind(this);
    this.eraseNote = this.eraseNote.bind(this);
    this.setNoteAsDash = this.setNoteAsDash.bind(this);
  };

  close(e) {
    this.props.setSelectedPattern(undefined);
  };

  addPatternRow(e) {
    this.props.addPatternRow(this.props.pattern.id);
  };

  removePatternRow(e) {
    this.props.removePatternRow();
  };

  eraseNote(e) {
    if (this.props.selectedPatternRowIndex !== undefined && this.props.selectedPatternNoteIndex !== undefined) {
      this.props.setNoteValue("", this.props.pattern.id, this.props.selectedPatternRowIndex, this.props.selectedPatternNoteIndex);

      // Prevent the currently selected note input from losing focus,
      // which will prevent the note from being set properly.
      e.preventDefault();
    }
  };

  setNoteAsDash(e) {
    if (this.props.selectedPatternRowIndex !== undefined && this.props.selectedPatternNoteIndex !== undefined) {
      this.props.setNoteValue("-", this.props.pattern.id, this.props.selectedPatternRowIndex, this.props.selectedPatternNoteIndex);

      // Prevent the currently selected note input from losing focus,
      // which will prevent the note from being set properly.
      e.preventDefault();
    }
  };

  render() {
    const PATTERN_LENGTH = this.props.pattern.stepCount;

    let selectedNote;
    if (this.props.selectedPatternRowIndex !== undefined && this.props.selectedPatternNoteIndex !== undefined) {
      selectedNote = this.props.pattern.rows[this.props.selectedPatternRowIndex].notes[this.props.selectedPatternNoteIndex];
    }
    else {
      selectedNote = { name: "" };
    }

    return <div>
      <button className="button-link" onClick={this.close}>&larr; Sequencer</button>
      <PatternHeader patternID={this.props.pattern.id} patternName={this.props.pattern.name} setPatternName={this.props.setPatternName} />
      <NoteInput note={selectedNote} patternID={this.props.pattern.id} rowCount={this.props.pattern.rows.length} noteCount={PATTERN_LENGTH} selectedPatternRowIndex={this.props.selectedPatternRowIndex} selectedPatternNoteIndex={this.props.selectedPatternNoteIndex} setSelectedPatternNoteIndex={this.props.setSelectedPatternNoteIndex} setNoteValue={this.props.setNoteValue} keyboardActive={this.props.keyboardActive} />
      <div className="flex">
        <ul className="flex flex-column flex-uniform-size mt0 ml0 pl0 overflow-scroll-x border-box">
          <li className="inline-block list-style-none full-width">
            <ul className="flex ml0 pl0 center no-whitespace-wrap">
              {Array(PATTERN_LENGTH).fill(undefined).map((_, noteIndex) =>
              <li key={noteIndex + 1} className="list-style-none inline-block note-container h4 note-column-header">{noteIndex + 1}</li>
              )}
            </ul>
          </li>
          {this.props.pattern.rows.map((patternRow, rowIndex) =>
          <li key={rowIndex} className="inline-block list-style-none full-width">
            <ul className="flex ml0 pl0 no-whitespace-wrap">
              {patternRow.notes.slice(0, PATTERN_LENGTH).map((note, noteIndex) =>
              <li key={noteIndex} className="list-style-none inline-block note-container">
                <NoteBox note={note} rowIndex={rowIndex} noteIndex={noteIndex} selectedPatternRowIndex={this.props.selectedPatternRowIndex} selectedPatternNoteIndex={this.props.selectedPatternNoteIndex} setSelectedPatternNoteIndex={this.props.setSelectedPatternNoteIndex} />
               </li>
              )}
            </ul>
          </li>
          )}
        </ul>
        <ul className="flex flex-column mt0 ml0 pl0 overflow-scroll-x border-box">
          <li className="list-style-none flex-uniform-size">&nbsp;</li>
          {this.props.pattern.rows.map((patternRow, rowIndex) =>
          <li key={rowIndex} className="list-style-none flex-uniform-size">
            <PatternRowRemoveButton patternID={this.props.pattern.id} rowIndex={rowIndex} removePatternRow={this.props.removePatternRow} />
          </li>
          )}
        </ul>
      </div>
      <div className="flex flex-justify-space-between">
        <button className="button-full button-hollow" onClick={this.addPatternRow}>Add Row</button>
        <span>
          <button className="inline-block button-full button-hollow mr-half" disabled={this.props.selectedPatternRowIndex === undefined || this.props.selectedPatternNoteIndex === undefined} onMouseDown={this.eraseNote}>&#8998;</button>
          <button className="inline-block button-full button-hollow" disabled={this.props.selectedPatternRowIndex === undefined || this.props.selectedPatternNoteIndex === undefined} onMouseDown={this.setNoteAsDash}>—</button>
        </span>
      </div>
    </div>;
  };
};

export { PatternEditor };
