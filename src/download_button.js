"use strict";

import React from 'react';

class DownloadButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      enabled: false,
    };

    this.toggleEnabled = this.toggleEnabled.bind(this);
  };

  toggleEnabled(e) {
    this.setState((prevState, props) => ({
      enabled: !prevState.enabled,
    }));
  };

  render() {
    return <div id="download-container" className="relative">
      <button className="button-full button-hollow right" onClick={this.toggleEnabled}>
        <span className="h3 lh-flush">&darr;</span>&nbsp; *.wav
      </button>
      <a id="hidden-download-link" className="display-none" download={this.props.downloadFileName + ".wav"} href="#"></a>
      <div className={"mt3 pl1 pr1 pt1 pb1 popup-box" + (this.state.enabled ? "" : " display-none")}>
        <label className="block">File Name:</label>
        <span className="flex">
          <input className="underlinedInput flex-uniform-size" type="text" value={this.props.downloadFileName} onChange={this.props.setDownloadFileName} />
          <span>.wav</span>
        </span>
        <button className="button-full button-hollow mt1 right" onClick={this.props.export}>Download</button>
      </div>
    </div>;
  };
};

export { DownloadButton };
