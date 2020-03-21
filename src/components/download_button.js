"use strict";

import React from "react";

export class DownloadButton extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isPopupVisible: false,
      errorMessage: "",
      fileName: "js-130",
    };

    this.togglePopup = this.togglePopup.bind(this);
    this.setFileName = this.setFileName.bind(this);
    this.beginExport = this.beginExport.bind(this);
  };

  togglePopup(e) {
    this.setState((prevState, props) => ({
      isPopupVisible: !prevState.isPopupVisible,
    }));
  };

  setFileName(e) {
    this.setState({ fileName: e.target.value });
  };

  beginExport(e) {
    if (this.state.fileName === "") {
      this.setState({ errorMessage: "Please give a file name", });
      return;
    }

    this.setState({ errorMessage: "" });
    this.props.export(this.hiddenDownloadLink);
  };

  render() {
    let bodyContent;

    if (this.props.isEnabled === true) {
      bodyContent = <span>
        <label className="block">File Name:</label>
        <span className="flex">
          <input className="input-underlined flex-uniform-size" style={{minWidth: "1px"}} type="text" value={this.state.fileName} onChange={this.setFileName} />
          <span>.wav</span>
        </span>
        <span className="block red">{this.state.errorMessage}</span>
        <button className="button-full button-hollow mt1 right" disabled={this.props.isDownloadInProgress} onClick={this.beginExport}>Download</button>
      </span>;
    }
    else {
      bodyContent = <span>Downloading to *.wav is not supported in your browser. If using a mobile device, try using a desktop browser instead.</span>;
    }

    return <div id="download-container" className="relative">
      <button className="button-full button-hollow right flex flex-align-center" onClick={this.togglePopup}>
        <span className="h3 lh-flush">&darr;</span>&nbsp;&nbsp;*.wav
      </button>
      <a ref={(el) => { this.hiddenDownloadLink = el; }} className="display-none" download={this.state.fileName + ".wav"} href="#"></a>
      <div className={"mt3 p1 popup-box" + (this.state.isPopupVisible ? "" : " display-none")}>
        {bodyContent}
      </div>
    </div>;
  };
};
