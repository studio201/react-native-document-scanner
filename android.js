import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import {
  DeviceEventEmitter, // android
  NativeModules, Platform,
  requireNativeComponent,
  View,
} from 'react-native';

var iface = {
    name: 'DocumentScanner',
    propTypes: {
      documentAnimation : PropTypes.bool,
      detectionCountBeforeCapture : PropTypes.number,
      enableTorch : PropTypes.bool,
      manualOnly: PropTypes.bool,
      overlayColor: PropTypes.string,
      contrast: PropTypes.number,
      brightness: PropTypes.number,
      noGrayScale: PropTypes.bool,
      ...View.propTypes // include the default view properties
    },
  };

const DocumentScanner = requireNativeComponent('DocumentScanner', iface);
const CameraManager = NativeModules.DocumentScannerManager || {};

class Scanner extends PureComponent{

  static defaultProps = {
    onPictureTaken: ()=>{},
    onProcessing: ()=>{},
  }
  constructor(props) {
    super(props);
    this.onPictureTakenListener = null;
    this.onProcessingChangeListener = null;

  }
  UNSAFE_componentWillMount(){
    const { onPictureTaken, onProcessing } = this.props;

    if (typeof DeviceEventEmitter.addEventListener === "function") {
      console.log("Scanner.UNSAFE_componentWillMount 2");
      this.onPictureTakenListener = DeviceEventEmitter.addEventListener("onPictureTaken", onPictureTaken);
      this.onProcessingChangeListener =  DeviceEventEmitter.addEventListener("onProcessingChange", onProcessing);
      console.log("Scanner.UNSAFE_componentWillMount 3");
    }else if(typeof DeviceEventEmitter.addListener === "function") {
      console.log("Scanner.UNSAFE_componentWillMount 4");
      this.onPictureTakenListener = DeviceEventEmitter.addListener("onPictureTaken", onPictureTaken);
      this.onProcessingChangeListener =  DeviceEventEmitter.addListener("onProcessingChange", onProcessing);
      console.log("PdfScanner.UNSAFE_componentWillMount 5");
    }
  }


  componentWillUnmount(){
    const { onPictureTaken, onProcessing } = this.props;

    if (typeof DeviceEventEmitter.removeEventListener === "function") {
      console.log("Scanner.componentWillUnmount 3");
      DeviceEventEmitter.removeEventListener("onPictureTaken", onPictureTaken);
      DeviceEventEmitter.removeEventListener("onProcessingChange", onProcessing);
      console.log("Scanner.componentWillUnmount 4");
    }
    else if(typeof this.onPictureTakenListener.remove === "function") {
      console.log("Scanner.componentWillUnmount 5");
      this.onPictureTakenListener.remove();
      this.onProcessingChangeListener.remove();
      console.log("Scanner.componentWillUnmount 6");
    }


  }

  capture = ()=>{
    CameraManager.capture();
  }

  render(){
    return <DocumentScanner {...this.props}/>
  }
}

export default Scanner;
