"use strict";

export function BufferCollection(audioContext) {
  var buffers = {};

  var addBuffer = function(label, buffer) {
    buffers[label] = buffer;
  };

  var addBufferFromURL = function(label, url, onSuccess, onError) {
    var onDecodeSuccess = function(buffer) {
      buffers[label] = buffer;
      onSuccess();
    };

    var onDecodeError = function(e) {
      var errorMessage = "Error decoding audio data for URL `" + url + "`";

      if (e) {  // The error object seems to be null in Safari (as of v11)
        errorMessage += ": " + e.message;
      }

      console.log(errorMessage);
      onError();
    };

    var request = new XMLHttpRequest();

    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function() {
      audioContext.decodeAudioData(request.response, onDecodeSuccess, onDecodeError);
    };

    request.send();
  };

  var addBuffersFromURLs = function(bufferConfig, onAllBuffersLoaded, onLoadError) {
    var loadedBufferCount = 0;
    var allBuffersCount = bufferConfig.length;
    var i;

    var onBufferLoaded = function() {
      loadedBufferCount += 1;

      if (loadedBufferCount === allBuffersCount) {
        onAllBuffersLoaded();
      }
    };

    for (i = 0; i < bufferConfig.length; i++) {
      addBufferFromURL(bufferConfig[i].label, bufferConfig[i].url, onBufferLoaded, onLoadError);
    }
  };

  var addBufferFromFile = function(label, file, onSuccess) {
    var onDecodeSuccess = function(buffer) {
      buffers[label] = buffer;
      onSuccess();
    };

    var onDecodeError = function(e) {
      alert(`${file.name} is not a valid sound file`);
    };

    var reader = new FileReader();

    reader.onload = function(e) {
      audioContext.decodeAudioData(e.target.result, onDecodeSuccess, onDecodeError);
    };

    reader.readAsArrayBuffer(file);
  };

  var getBuffer = function(label) {
    return buffers[label];
  };

  var removeBuffer = function(label) {
    delete buffers[label];
  };


  return {
    addBuffer: addBuffer,
    addBuffersFromURLs: addBuffersFromURLs,
    addBufferFromFile: addBufferFromFile,
    getBuffer: getBuffer,
    removeBuffer: removeBuffer,
  };
};
