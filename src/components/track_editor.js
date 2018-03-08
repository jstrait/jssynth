"use strict";

import React from 'react';

import { InstrumentEditor, SampleInstrumentEditor } from "./instrument_editor";
import { PatternEditor } from "./pattern_editor";

class TrackEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedTab: "instrument",
    };

    this.setSelectedTrack = this.setSelectedTrack.bind(this);
    this.selectInstrumentTab = this.selectInstrumentTab.bind(this);
    this.selectPatternsTab = this.selectPatternsTab.bind(this);
  };

  setSelectedTrack(e) {
    this.props.setSelectedTrack(parseInt(e.target.value, 10));
  };

  selectInstrumentTab(e) {
    this.setState({ selectedTab: "instrument" });
  };

  selectPatternsTab(e) {
    this.setState({ selectedTab: "patterns" });
  };

  render() {
    let instrumentEditor;

    if (this.props.instrument.type === "synth") {
      instrumentEditor = <InstrumentEditor instrument={this.props.instrument} updateInstrument={this.props.updateInstrument} />;
    }
    else {
      instrumentEditor = <SampleInstrumentEditor instrument={this.props.instrument} setBufferFromFile={this.props.setBufferFromFile} updateInstrument={this.props.updateInstrument} />;
    }

    let patternEditor = <PatternEditor patterns={this.props.patterns} selectedPattern={this.props.selectedPattern} setSelectedPattern={this.props.setSelectedPattern} setPatternName={this.props.setPatternName} addPattern={this.props.addPattern} removePattern={this.props.removePattern} addPatternRow={this.props.addPatternRow} removePatternRow={this.props.removePatternRow} setNoteValue={this.props.setNoteValue} />;

    let panel = (this.state.selectedTab === "instrument") ? instrumentEditor : patternEditor;

    return <div className="mt1 pl1 pr1 pt1 pb1 border-box bt-thick">
      <div className="mb2">
        <h2 className="mt0 mb1">Track Editor</h2>
        <select className="mr2 inline-block width-5" style={{verticalAlign: "middle"}} value={this.props.selectedTrackID} onChange={this.setSelectedTrack}>
          {this.props.tracks.map((track) =>
          <option key={track.id} value={track.id}>{track.name}</option>
          )}
        </select>
        <ul className="m0 pl0 inline-block">
          <li className="inline-block list-style-none mr1">
            <a href="javascript:void(0);" className={"paneTab" + (this.state.selectedTab === "instrument" ? " paneTabSelected" : "")} onClick={this.selectInstrumentTab}>Instrument</a>
          </li>
          <li className="inline-block list-style-none">
            <a href="javascript:void(0);" className={"paneTab" + (this.state.selectedTab === "patterns" ? " paneTabSelected" : "")} onClick={this.selectPatternsTab}>Patterns</a>
          </li>
        </ul>
      </div>
      {panel}
    </div>;
  };
};

export { TrackEditor };
