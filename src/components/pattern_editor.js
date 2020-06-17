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

class PatternNotes extends React.Component {
  constructor(props) {
    super(props);
  };

  render() {
    const measureLength = 16;
    const measureCount = Math.ceil(this.props.stepCount / measureLength);

    let measures = [];
    let measure = undefined;
    let i, j;
    let startStep;

    for (i = 0; i < measureCount; i++) {
      measure = [];
      startStep = i * measureLength;

      for (j = 0; j < this.props.rows.length; j++) {
        measure.push(this.props.rows[j].notes.slice(startStep, startStep + measureLength));
      }

      measures.push(measure);
    }

    return <div className="flex">
      <div className="flex flex-uniform-size overflow-scroll-x">
        {measures.map((measure, measureIndex) =>
        <PatternMeasure key={measureIndex}
                        patternID={this.props.patternID}
                        startStep={measureIndex * measureLength}
                        stepCount={measureLength}
                        maxStep={this.props.stepCount - 1}
                        rows={measure}
                        isKeyboardActive={this.props.isKeyboardActive}
                        selectedRowIndex={this.props.selectedRowIndex}
                        selectedNoteIndex={this.props.selectedNoteIndex}
                        setSelectedNoteIndex={this.props.setSelectedNoteIndex}
                        setNoteValue={this.props.setNoteValue} />
        )}
      </div>
      <ul className="flex flex-column mt1 mb1 ml0 pl0 overflow-scroll-x border-box">
        <li className="list-style-none flex-uniform-size">&nbsp;</li>
        {this.props.rows.map((patternRow, rowIndex) =>
        <li key={rowIndex} className="list-style-none flex-uniform-size">
          <PatternRowRemoveButton patternID={this.props.patternID} rowIndex={rowIndex} removePatternRow={this.props.removePatternRow} />
        </li>
        )}
      </ul>
    </div>;
  };
};

class PatternMeasure extends React.Component {
  constructor(props) {
    super(props);
  };

  render() {
    const leftPaddingStyle = (this.props.startStep === 0) ? " pl0" : " pl-half";
    const leftBorderStyle = (this.props.startStep === 0) ? "" : " bl";

    return <ul className={"flex flex-uniform-size flex-column mt1 mb0 ml0 pb1" + leftPaddingStyle + " pr-half" + leftBorderStyle + " border-box"}>
      <li className="inline-block list-style-none full-width">
        <ul className="flex ml0 pl0 center whitespace-wrap-none">
          {Array(this.props.stepCount).fill(undefined).map((_, noteIndex) =>
          <li key={noteIndex + this.props.startStep + 1} className="list-style-none inline-block note-container h4 note-column-header">{noteIndex + this.props.startStep + 1}</li>
          )}
        </ul>
      </li>
      {this.props.rows.map((patternRow, rowIndex) =>
      <li key={rowIndex} className="inline-block list-style-none full-width">
        <ul className="flex ml0 pl0 whitespace-wrap-none">
          {patternRow.slice(0, this.props.stepCount).map((note, noteIndex) =>
          <li key={this.props.startStep + noteIndex} className="list-style-none inline-block note-container">
            <NoteBox patternID={this.props.patternID}
                     note={note}
                     rowIndex={rowIndex}
                     noteIndex={this.props.startStep + noteIndex}
                     maxStep={this.props.maxStep}
                     maxRow={this.props.rows.length - 1}
                     isSelected={this.props.selectedRowIndex === rowIndex && this.props.selectedNoteIndex === (this.props.startStep + noteIndex)}
                     isKeyboardActive={this.props.isKeyboardActive}
                     setSelectedNoteIndex={this.props.setSelectedNoteIndex}
                     setNoteValue={this.props.setNoteValue} />
           </li>
          )}
        </ul>
      </li>
      )}
    </ul>;
  };
};

class NoteBox extends React.PureComponent {
  constructor(props) {
    super(props);

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.setNoteValue = this.setNoteValue.bind(this);
    this.extractNoteParts = this.extractNoteParts.bind(this);
    this.noteIsValid = this.noteIsValid.bind(this);
    this.formatNote = this.formatNote.bind(this);
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
      this.props.setSelectedNoteIndex(this.props.rowIndex, this.props.maxStep);
    }
     else if (e.keyCode === SIX && e.shiftKey) {
      this.props.setSelectedNoteIndex(this.props.rowIndex, 0);
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
      if (this.props.noteIndex > 0) {
        this.props.setSelectedNoteIndex(this.props.rowIndex, this.props.noteIndex - 1);
      }
    }
    else if (e.keyCode === RIGHT_ARROW) {
      if (this.props.noteIndex < this.props.maxStep) {
        this.props.setSelectedNoteIndex(this.props.rowIndex, this.props.noteIndex + 1);
      }
    }
    else if (e.keyCode === UP_ARROW) {
      if (this.props.rowIndex > 0) {
        this.props.setSelectedNoteIndex(this.props.rowIndex - 1, this.props.noteIndex);
      }
    }
    else if (e.keyCode === DOWN_ARROW) {
      if (this.props.rowIndex < this.props.maxRow) {
        this.props.setSelectedNoteIndex(this.props.rowIndex + 1, this.props.noteIndex);
      }
    }

    e.preventDefault();
  };

  onMouseDown(e) {
    this.el.focus();
  };

  onTouchStart(e) {
    this.el.focus();
  };

  onFocus(e) {
    this.props.setSelectedNoteIndex(this.props.rowIndex, this.props.noteIndex);
  };

  onBlur(e) {
    if (!this.props.isKeyboardActive) {
      this.props.setSelectedNoteIndex(undefined, undefined);
    }
  };

  setNoteValue(newNoteValue) {
    this.props.setNoteValue(newNoteValue, this.props.patternID, this.props.rowIndex, this.props.noteIndex);
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

  componentDidUpdate() {
    if (this.props.isSelected === true) {
      this.el.focus();
    }
  };

  render() {
    let formattedNoteName = this.formatNote(this.props.note.name);
    let noteIsValid = (this.props.isSelected === true) || this.noteIsValid(this.props.note.name);

    return <span ref={(el) => { this.el = el; }}
                 tabIndex="-1"
                 className={"note-box" + (noteIsValid ? "" : " note-box-invalid") + ((this.props.isSelected === true) ? " note-box-focused" : "")}
                 onKeyDown={this.onKeyDown}
                 onMouseDown={this.onMouseDown}
                 onTouchStart={this.onTouchStart}
                 onFocus={this.onFocus}
                 onBlur={this.onBlur}>
             {formattedNoteName}
           </span>;
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

class PatternFooter extends React.PureComponent {
  constructor(props) {
    super(props);

    this.addPatternRow = this.addPatternRow.bind(this);
    this.eraseNote = this.eraseNote.bind(this);
    this.setNoteAsDash = this.setNoteAsDash.bind(this);
  };

  addPatternRow(e) {
    this.props.addPatternRow(this.props.patternID);
  };

  eraseNote(e) {
    if (this.props.selectedRowIndex !== undefined && this.props.selectedNoteIndex !== undefined) {
      this.props.setNoteValue("", this.props.patternID, this.props.selectedRowIndex, this.props.selectedNoteIndex);

      // Prevent the currently selected note input from losing focus,
      // which will prevent the note from being set properly.
      e.preventDefault();
    }
  };

  setNoteAsDash(e) {
    if (this.props.selectedRowIndex !== undefined && this.props.selectedNoteIndex !== undefined) {
      this.props.setNoteValue("-", this.props.patternID, this.props.selectedRowIndex, this.props.selectedNoteIndex);

      // Prevent the currently selected note input from losing focus,
      // which will prevent the note from being set properly.
      e.preventDefault();
    }
  };

  render() {
    return <div className="flex flex-justify-space-between">
      <button className="button-full button-hollow" onClick={this.addPatternRow}>Add Row</button>
      <span>
        <button className="inline-block button-full button-hollow mr-half" disabled={this.props.selectedRowIndex === undefined || this.props.selectedNoteIndex === undefined} onMouseDown={this.eraseNote}>&#8998;</button>
        <button className="inline-block button-full button-hollow" disabled={this.props.selectedRowIndex === undefined || this.props.selectedNoteIndex === undefined} onMouseDown={this.setNoteAsDash}>—</button>
      </span>
    </div>;
  };
};

class PatternEditor extends React.Component {
  constructor(props) {
    super(props);
  };

  render() {
    let selectedNote;
    if (this.props.selectedRowIndex !== undefined && this.props.selectedNoteIndex !== undefined) {
      selectedNote = this.props.pattern.rows[this.props.selectedRowIndex].notes[this.props.selectedNoteIndex];
    }
    else {
      selectedNote = { name: "" };
    }

    return <div>
      <button className="button-link" onClick={this.props.onClose}>&larr; Sequencer</button>
      <PatternHeader patternID={this.props.pattern.id}
                     patternName={this.props.pattern.name}
                     setPatternName={this.props.setPatternName} />
      <PatternNotes patternID={this.props.pattern.id}
                    stepCount={this.props.pattern.stepCount}
                    rows={this.props.pattern.rows}
                    isKeyboardActive={this.props.isKeyboardActive}
                    selectedRowIndex={this.props.selectedRowIndex}
                    selectedNoteIndex={this.props.selectedNoteIndex}
                    setSelectedNoteIndex={this.props.setSelectedNoteIndex}
                    setNoteValue={this.props.setNoteValue}
                    removePatternRow={this.props.removePatternRow} />
      <PatternFooter patternID={this.props.pattern.id}
                     selectedRowIndex={this.props.selectedRowIndex}
                     selectedNoteIndex={this.props.selectedNoteIndex}
                     addPatternRow={this.props.addPatternRow}
                     setNoteValue={this.props.setNoteValue} />
    </div>;
  };
};

export { PatternEditor };
