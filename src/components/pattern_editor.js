"use strict";

import React from 'react';

class PatternListItem extends React.Component {
  constructor(props) {
    super(props);

    this.setSelectedPatternID = this.setSelectedPatternID.bind(this);
    this.removePattern = this.removePattern.bind(this);
  };

  setSelectedPatternID(e) {
    this.props.setSelectedPattern(this.props.pattern.id);
  };

  removePattern(e) {
    e.stopPropagation();
    this.props.removePattern(this.props.pattern.id);
  };

  render() {
    return <li className={"flex flex-align-center flex-justify-space-between list-style-none pointer border-box mr1 " + (this.props.pattern.id === this.props.selectedPattern.id ? "paneTabSelected" : "paneTabUnselected")} onClick={this.setSelectedPatternID}>
      <span className="no-whitespace-wrap overflow-hidden-x">{this.props.pattern.name}</span>
      <button className={"button-small button-hollow round ml1 pt0 pb0 pl0 pr0" + (this.props.removable ? "" : " display-none")} onClick={this.removePattern}>&nbsp;X&nbsp;</button>
    </li>
  };
};

class NoteInput extends React.Component {
  constructor(props) {
    super(props);

    this.setNoteValue = this.setNoteValue.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  };

  setNoteValue(e) {
    let rawNoteValue = this.unformatNote(e.target.value);
    this.props.setNoteValue(rawNoteValue, this.props.patternID, this.props.rowIndex, this.props.noteIndex);
  };

  setCurrentlySelectedNote(newRowIndex, newNoteIndex) {
    let nextNoteId = `pattern-${this.props.patternID}-row-${newRowIndex}-note-${newNoteIndex}`;

    document.getElementById(nextNoteId).focus();
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

    return {noteName: noteName, modifier: this.unformatNote(modifier), octave: octave};
  };

  onFocus(e) {
    this.props.setSelectedPatternNoteIndex(this.props.rowIndex, this.props.noteIndex);
  };

  onKeyDown(e) {
    const SPACE = 32;
    const ZERO = 48;
    const TWO = 50;
    const THREE = 51;
    const FOUR = 52;
    const SIX = 54;
    const NINE = 57;
    const A = 65;
    const G = 71;
    const DASH = 189;
    const LEFT_ARROW = 37;
    const RIGHT_ARROW = 39;
    const UP_ARROW = 38;
    const DOWN_ARROW = 40;

    let element = e.target;
    let noteParts;

    if (e.keyCode === SPACE) {
      this.props.setNoteValue("", this.props.patternID, this.props.rowIndex, this.props.noteIndex);
    }
    else if (e.keyCode === TWO && e.shiftKey) {
      noteParts = this.extractNoteParts(element.value);

      if (noteParts.modifier === "" || noteParts.modifier === "b") {
        noteParts.modifier += "b";
      }
      else if (noteParts.modifier === "bb") {
        noteParts.modifier = "";
      }
      else {
        noteParts.modifier = "b";
      }

      this.props.setNoteValue(this.unformatNote(noteParts.noteName + noteParts.modifier + noteParts.octave), this.props.patternID, this.props.rowIndex, this.props.noteIndex);
    }
    else if (e.keyCode === THREE && e.shiftKey) {
      noteParts = this.extractNoteParts(element.value);

      if (noteParts.modifier === "" || noteParts.modifier === "#") {
        noteParts.modifier += "#";
      }
      else if (noteParts.modifier === "##") {
        noteParts.modifier = "";
      }
      else {
        noteParts.modifier = "#";
      }

      this.props.setNoteValue(this.unformatNote(noteParts.noteName + noteParts.modifier + noteParts.octave), this.props.patternID, this.props.rowIndex, this.props.noteIndex);
    }
    else if (e.keyCode === FOUR && e.shiftKey) {
      this.setCurrentlySelectedNote(this.props.rowIndex, this.props.noteCount - 1);
    }
     else if (e.keyCode === SIX && e.shiftKey) {
      this.setCurrentlySelectedNote(this.props.rowIndex, 0);
    }
    else if (e.keyCode >= ZERO && e.keyCode <= NINE && !e.shiftKey) {
      noteParts = this.extractNoteParts(element.value);
      this.props.setNoteValue(this.unformatNote(noteParts.noteName + noteParts.modifier + String.fromCharCode(e.keyCode)), this.props.patternID, this.props.rowIndex, this.props.noteIndex);
    }
    else if (e.keyCode >= A && e.keyCode <= G) {
      noteParts = this.extractNoteParts(element.value);
      this.props.setNoteValue(this.unformatNote(String.fromCharCode(e.keyCode) + noteParts.modifier + noteParts.octave), this.props.patternID, this.props.rowIndex, this.props.noteIndex);
    }
    else if (e.keyCode === DASH && !e.shiftKey) {
      this.props.setNoteValue("", this.props.patternID, this.props.rowIndex, this.props.noteIndex);
    }
    else if (e.keyCode === LEFT_ARROW) {
      if (this.props.noteIndex > 0) {
        this.setCurrentlySelectedNote(this.props.rowIndex, this.props.noteIndex - 1);
      }
    }
    else if (e.keyCode === RIGHT_ARROW) {
      if (this.props.noteIndex < this.props.noteCount - 1) {
        this.setCurrentlySelectedNote(this.props.rowIndex, this.props.noteIndex + 1);
      }
    }
    else if (e.keyCode === UP_ARROW) {
      if (this.props.rowIndex > 0) {
        this.setCurrentlySelectedNote(this.props.rowIndex - 1, this.props.noteIndex);
      }
    }
    else if (e.keyCode === DOWN_ARROW) {
      if (this.props.rowIndex < this.props.rowCount - 1) {
        this.setCurrentlySelectedNote(this.props.rowIndex + 1, this.props.noteIndex);
      }
    }

    e.preventDefault();
  };

  noteIsValid(rawNoteString) {
    return /^$|^-$|^ $|(^[A-G](b|bb|#|##){0,1}[0-7]$)/.test(rawNoteString);
  };

  formatNote(rawNoteString) {
    let formattedNoteName = rawNoteString;

    // Only make first character uppercase, but not subsequent characters, to avoid
    // making a 'b' uppercase, which will mess with ♭ replacement.
    let firstCharacter = formattedNoteName.substr(0, 1);
    formattedNoteName = firstCharacter.toUpperCase() + formattedNoteName.substr(1);

    formattedNoteName = formattedNoteName.replace("##", "𝄪");
    formattedNoteName = formattedNoteName.replace("#", "♯");
    formattedNoteName = formattedNoteName.replace("bb", "𝄫");
    formattedNoteName = formattedNoteName.replace("b", "♭");
    formattedNoteName = formattedNoteName.replace("-", "—");

    return formattedNoteName;
  };

  unformatNote(rawNoteString) {
    rawNoteString = rawNoteString.replace("♯", "#");
    rawNoteString = rawNoteString.replace("𝄪", "##");
    rawNoteString = rawNoteString.replace("♭", "b");
    rawNoteString = rawNoteString.replace("𝄫", "bb");

    return rawNoteString;
  };

  render() {
    let formattedNoteName = this.formatNote(this.props.note.name);
    let noteIsValid = this.noteIsValid(this.props.note.name);
    let noteIsSelected = this.props.selectedPatternRowIndex === this.props.rowIndex &&
                         this.props.selectedPatternNoteIndex === this.props.noteIndex;

    return <input id={`pattern-${this.props.patternID}-row-${this.props.rowIndex}-note-${this.props.noteIndex}`} type="text" maxLength="4" className={"note" + (noteIsValid ? "" : " invalid") + (noteIsSelected ? " note-focused" : "")} value={formattedNoteName} onFocus={this.onFocus} onChange={this.setNoteValue} onKeyDown={this.onKeyDown} />;
  }
};

class PatternRowRemoveButton extends React.Component {
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

    this.state = {
      tipsAndTricksVisible: false,
    };

    this.setPatternName = this.setPatternName.bind(this);
    this.addPattern = this.addPattern.bind(this);
    this.duplicatePattern = this.duplicatePattern.bind(this);
    this.addPatternRow = this.addPatternRow.bind(this);
    this.removePatternRow = this.removePatternRow.bind(this);
    this.setTipsAndTricksVisible = this.setTipsAndTricksVisible.bind(this);
  };

  setPatternName(e) {
    this.props.setPatternName(this.props.selectedPattern.id, e.target.value);
  };

  addPattern(e) {
    this.props.addPattern(this.props.selectedPattern.trackID);
  };

  duplicatePattern(e) {
    this.props.duplicatePattern(this.props.selectedPattern.id);
  };

  addPatternRow(e) {
    this.props.addPatternRow(this.props.selectedPattern.id);
  };

  removePatternRow(e) {
    this.props.removePatternRow();
  };

  setTipsAndTricksVisible(e) {
    this.setState((prevState, props) => ({
      tipsAndTricksVisible: !prevState.tipsAndTricksVisible,
    }));
  };

  render() {
    const tipsAndTricks = <ul className="toggleable">
      <li>A note is a letter between A and G plus an octave between 0 and 7. For example: <b>A3</b>, <b>C♯4</b>, <b>E♭2</b></li>
      <li>Use &lsquo;#&rsquo; to enter a sharp, and &lsquo;@&rsquo; to enter a flat.</li>
      <li>Use &mdash; to lengthen a note. For example, &lsquo;A4&mdash;&mdash;&mdash;&rsquo; will last for 4 steps, while &lsquo;A4&mdash;&rsquo; will last for two, and &lsquo;A4&rsquo; will last for one.</li>
      <li>Press <code>SPACE</code> to clear the current note.</li>
      <li>Use the left/right arrow keys to move between notes, and the up/down arrow keys to move between rows.</li>
    </ul>;

    return <div>
      <div className="mb2">
        <ul className="flex pl0 mt0 mb1 overflow-scroll-x full-width">
          {this.props.patterns.map((pattern) =>
          <PatternListItem key={pattern.id} pattern={pattern} selectedPattern={this.props.selectedPattern} removable={this.props.patterns.length > 1} setSelectedPattern={this.props.setSelectedPattern} removePattern={this.props.removePattern} />
          )}
        </ul>
        <button className="button-full button-hollow mr-half" onClick={this.addPattern}>Add Pattern</button>
        <button className="button-full button-hollow" onClick={this.duplicatePattern}>Duplicate Pattern</button>
      </div>

      <label>Name:</label> <input className="underlinedInput" value={this.props.selectedPattern.name} onChange={this.setPatternName} type="text" /> <a href="javascript:void(0);" className="h4 helperToggle" onClick={this.setTipsAndTricksVisible}>Tips and Tricks</a>
      {(this.state.tipsAndTricksVisible === true) ? tipsAndTricks : undefined}
      <div className="flex">
        <ul className="flex flex-column flex-uniform-size mt0 ml0 pl0 overflow-scroll-x border-box">
          <li className="inline-block list-style-none full-width">
            <ul className="ml0 pl0 center no-whitespace-wrap">
              {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map((noteIndex) =>
              <li key={noteIndex} className="list-style-none inline-block note-container">
                <span className="h4 note-column-header">{noteIndex}</span>
              </li>
              )}
            </ul>
          </li>
          {this.props.selectedPattern.rows.map((patternRow, rowIndex) =>
          <li key={rowIndex} className="inline-block list-style-none full-width">
            <ul className="ml0 pl0 no-whitespace-wrap">
              {patternRow.notes.map((note, noteIndex) =>
              <li key={noteIndex} className="list-style-none inline-block note-container">
                <NoteInput note={note} patternID={this.props.selectedPattern.id} rowIndex={rowIndex} rowCount={this.props.selectedPattern.rows.length} noteIndex={noteIndex} noteCount={patternRow.notes.length} selectedPatternRowIndex={this.props.selectedPatternRowIndex} selectedPatternNoteIndex={this.props.selectedPatternNoteIndex} setSelectedPatternNoteIndex={this.props.setSelectedPatternNoteIndex} setNoteValue={this.props.setNoteValue} />
              </li>
              )}
            </ul>
          </li>
          )}
        </ul>
        <ul className="flex flex-column mt0 ml0 pl0 overflow-scroll-x border-box">
          <li className="list-style-none flex-uniform-size">&nbsp;</li>
          {this.props.selectedPattern.rows.map((patternRow, rowIndex) =>
          <li key={rowIndex} className="list-style-none flex-uniform-size">
            <PatternRowRemoveButton patternID={this.props.selectedPattern.id} rowIndex={rowIndex} removePatternRow={this.props.removePatternRow} />
          </li>
          )}
        </ul>
      </div>
      <div className="overflow-auto">
        <button className="block button-full button-hollow" onClick={this.addPatternRow}>Add Row</button>
      </div>
    </div>;
  };
};

export { PatternEditor };
