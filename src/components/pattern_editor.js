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
    return <li className={"flex flex-align-center flex-justify-space-between list-style-none pointer border-box mr1 width-5 " + (this.props.pattern.id === this.props.selectedPattern.id ? "paneTabSelected" : "paneTabUnselected")} onClick={this.setSelectedPatternID}>
      <span className="no-whitespace-wrap overflow-hidden-x overflow-ellipsis">{this.props.pattern.name}</span>
      <button className={"button-small button-hollow round ml1 pt0 pb0 pl0 pr0" + (this.props.removable ? "" : " display-none")} onClick={this.removePattern}>&nbsp;X&nbsp;</button>
    </li>
  };
};

class NoteInput extends React.Component {
  constructor(props) {
    super(props);

    this.setNoteValue = this.setNoteValue.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  };

  setNoteValue(e) {
    let rawNoteValue = this.unformatNote(e.target.value);
    this.props.setNoteValue(rawNoteValue, this.props.patternID, this.props.rowIndex, this.props.noteIndex);
  };

  changeCurrentlySelectedNote(rowIndexDelta, noteIndexDelta) {
    let nextNoteId = `pattern-${this.props.patternID}-row-${this.props.rowIndex + rowIndexDelta}-note-${this.props.noteIndex + noteIndexDelta}`;

    document.getElementById(nextNoteId).focus();
  };

  onKeyDown(e) {
    let element = e.target;

    if (e.keyCode === 32) {  // Space bar
      this.props.setNoteValue("", this.props.patternID, this.props.rowIndex, this.props.noteIndex);
    }
    else if (e.keyCode >= 48 && e.keyCode <= 57) {  // Numbers 0 through 9
      if (/^.*\d$/.test(element.value)) {
        this.props.setNoteValue(this.unformatNote(element.value.slice(0, element.value.length - 1)), this.props.patternID, this.props.rowIndex, this.props.noteIndex);
      }
    }
    else if (e.keyCode === 189) {  // Dash
      this.props.setNoteValue("", this.props.patternID, this.props.rowIndex, this.props.noteIndex);
    }
    else if (e.keyCode === 37) {  // Left arrow key
      if (element.selectionStart === 0 && !(element.classList.contains('firstNote'))) {
        this.changeCurrentlySelectedNote(0, -1);
      }
    }
    else if (e.keyCode === 39) {  // Right arrow key
      if (element.selectionEnd === element.value.length && !(element.classList.contains('lastNote'))) {
        this.changeCurrentlySelectedNote(0, 1);
      }
    }
    else if (e.keyCode === 38) {  // Up arrow key
      if (!(element.classList.contains('firstRow'))) {
        this.changeCurrentlySelectedNote(-1, 0);
      }
    }
    else if (e.keyCode === 40) {  // Down arrow key
      if (!(element.classList.contains('lastRow'))) {
        this.changeCurrentlySelectedNote(1, 0);
      }
    }
  };

  onKeyUp(e) {
    if (e.keyCode === 32) {  // Space bar
      this.props.setNoteValue("", this.props.patternID, this.props.rowIndex, this.props.noteIndex);
    }
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

    return <input id={`pattern-${this.props.patternID}-row-${this.props.rowIndex}-note-${this.props.noteIndex}`} type="text" maxLength="4" className={"note" + (this.props.rowIndex === 0 ? " firstRow" : "") + (this.props.rowIndex === this.props.rowCount - 1 ? " lastRow" : "") + (this.props.noteIndex === 0 ? " firstNote" : "") + (this.props.noteIndex === this.props.noteCount - 1 ? " lastNote" : "") + (noteIsValid ? "" : " ng-invalid ng-dirty")} value={formattedNoteName} onChange={this.setNoteValue} onKeyDown={this.onKeyDown} onKeyUp={this.onKeyUp} />;
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
      <li>Use &lsquo;#&rsquo; to enter a sharp, and a lowercase &lsquo;b&rsquo; to enter a flat</li>
      <li>Use &mdash; to lengthen a note. For example, &lsquo;A4&mdash;&mdash;&mdash;&rsquo; will last for 4 steps, while &lsquo;A4&mdash;&rsquo; will last for two, and &lsquo;A4&rsquo; will last for one.</li>
      <li>Press <code>SPACE</code> to clear the current note</li>
      <li>Use the left/right arrow keys to move between notes, and the up/down arrow keys to move between rows</li>
    </ul>;

    return <div>
      <div className="mb2">
        <ul className="flex pl0 mt0 mb1 overflow-scroll-x full-width">
          {this.props.patterns.map((pattern) =>
          <PatternListItem key={pattern.id} pattern={pattern} selectedPattern={this.props.selectedPattern} removable={this.props.patterns.length > 1} setSelectedPattern={this.props.setSelectedPattern} removePattern={this.props.removePattern} />
          )}
        </ul>
        <button className="block button-full button-hollow" onClick={this.addPattern}>Add Pattern</button>
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
                <NoteInput note={note} patternID={this.props.selectedPattern.id} rowIndex={rowIndex} rowCount={this.props.selectedPattern.rows.length} noteIndex={noteIndex} noteCount={patternRow.notes.length} setNoteValue={this.props.setNoteValue} />
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
