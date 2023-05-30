"use strict";

import React from "react";

export class DownloadButton extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isPopupVisible: false,
      isDownloadInProgress: false,
      errorMessage: "",
      fileName: "js-140",
    };

    this.togglePopup = this.togglePopup.bind(this);
    this.setFileName = this.setFileName.bind(this);
    this.beginDownload = this.beginDownload.bind(this);
    this.downloadCompleteCallback = this.downloadCompleteCallback.bind(this);
    this.onDownloadError = this.onDownloadError.bind(this);
  };

  togglePopup(e) {
    this.setState((prevState, props) => ({
      isPopupVisible: !prevState.isPopupVisible,
    }));
  };

  setFileName(e) {
    this.setState({ fileName: e.target.value });
  };

  beginDownload(e) {
    if (this.state.fileName === "") {
      this.setState({ errorMessage: "Please give a file name", });
      return;
    }

    this.setState({
      errorMessage: "",
      isDownloadInProgress: true,
    });

    try {
      this.props.onRequestDownload(this.downloadCompleteCallback);
    }
    catch(e) {
      this.onDownloadError();
    }
  };

  downloadCompleteCallback(blob) {
    let url = window.URL.createObjectURL(blob);

    this.hiddenDownloadLink.href = url;
    this.hiddenDownloadLink.click();

    window.URL.revokeObjectURL(blob);

    this.setState({isDownloadInProgress: false});
  };

  onDownloadError() {
    this.setState({
      errorMessage: "An error occurred",
      isDownloadInProgress: false,
    });
  };

  render() {
    let bodyContent;

    if (this.props.isEnabled === true) {
      bodyContent = <span>
        <label className="block">File Name:</label>
        <span className="flex">
          <input className="input-underlined flex-uniform-size" style={{minWidth: "1px"}} type="text" value={this.state.fileName} disabled={this.state.isDownloadInProgress} onChange={this.setFileName} />
          <span>.wav</span>
        </span>
        <span className="block red">{this.state.errorMessage}</span>
        <div className="mt1 flex flex-justify-end flex-align-center">
          {this.state.isDownloadInProgress && <span className="spinner-icon mr-half" style={{}}></span>}
          <button className="button-full button-standard" disabled={this.state.isDownloadInProgress} onClick={this.beginDownload}>Download</button>
        </div>
      </span>;
    }
    else {
      bodyContent = <span>Downloading to *.wav is not supported in your browser. If using a mobile device, try using a desktop browser instead.</span>;
    }

    return <div id="download-container" className="relative flex flex-justify-end">
      <button className="button-full button-standard flex flex-align-center" onClick={this.togglePopup}>
        <span className="h3 lh-4">&darr;</span>&nbsp;&nbsp;*.wav
      </button>
      <a ref={(el) => { this.hiddenDownloadLink = el; }} className="display-none" download={this.state.fileName + ".wav"} href="#"></a>
      <div className={"mt3 p1 popup-box" + (this.state.isPopupVisible ? "" : " display-none")}>
        {bodyContent}
      </div>
    </div>;
  };
};
