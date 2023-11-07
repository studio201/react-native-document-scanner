import React from "react";
import {
  requireNativeComponent,
  NativeModules,
  View,
  Platform,
  PermissionsAndroid,
  DeviceEventEmitter,
  Text
} from "react-native";
import PropTypes from "prop-types";

const RNPdfScanner = requireNativeComponent("RNPdfScanner", PdfScanner);
const CameraManager = NativeModules.RNPdfScannerManager || {};

class PdfScanner extends React.Component {
  constructor(props) {
    super(props);
    this.onPictureTakenListener = null;
    this.onProcessingChangeListener = null;

    this.state = {
      permissionsAuthorized: Platform.OS === "ios"
    };
  }

  onPermissionsDenied = () => {
    if (this.props.onPermissionsDenied) this.props.onPermissionsDenied();
  };

  componentDidMount() {
    this.getAndroidPermissions();
  }

  async getAndroidPermissions() {
    if (Platform.OS !== "android") return;
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      ]);

      if (
        granted["android.permission.READ_EXTERNAL_STORAGE"] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted["android.permission.WRITE_EXTERNAL_STORAGE"] ===
          PermissionsAndroid.RESULTS.GRANTED
      )
        this.setState({ permissionsAuthorized: true });
      else this.onPermissionsDenied();
    } catch (err) {
      this.onPermissionsDenied();
    }
  }

  static defaultProps = {
    onPictureTaken: () => {},
    onProcessing: () => {}
  };

  sendOnPictureTakenEvent(event) {
    return this.props.onPictureTaken(event.nativeEvent);
  }

  sendOnRectanleDetectEvent(event) {
    if (!this.props.onRectangleDetect) return null;
    return this.props.onRectangleDetect(event.nativeEvent);
  }

  getImageQuality() {
    if (!this.props.quality) return 0.8;
    if (this.props.quality > 1) return 1;
    if (this.props.quality < 0.1) return 0.1;
    return this.props.quality;
  }

  UNSAFE_componentWillMount() {
    if (Platform.OS === "android") {
      console.log("PdfScanner.UNSAFE_componentWillMount 1");
      const { onPictureTaken, onProcessing } = this.props;
      if (typeof DeviceEventEmitter.addEventListener === "function") {
        console.log("PdfScanner.UNSAFE_componentWillMount 2");
        this.onPictureTakenListener = DeviceEventEmitter.addEventListener("onPictureTaken", onPictureTaken);
        this.onProcessingChangeListener =  DeviceEventEmitter.addEventListener("onProcessingChange", onProcessing);
        console.log("PdfScanner.UNSAFE_componentWillMount 3");
      }else if(typeof DeviceEventEmitter.addListener === "function") {
        console.log("PdfScanner.UNSAFE_componentWillMount 4");
        this.onPictureTakenListener = DeviceEventEmitter.addListener("onPictureTaken", onPictureTaken);
        this.onProcessingChangeListener =  DeviceEventEmitter.addListener("onProcessingChange", onProcessing);
        console.log("PdfScanner.UNSAFE_componentWillMount 5");
      }


    }
  }

  componentWillUnmount() {
    if (Platform.OS === "android") {
      console.log("PdfScanner.componentWillUnmount 1");
      const { onPictureTaken, onProcessing } = this.props;
      console.log("PdfScanner.componentWillUnmount 2");
      if (typeof DeviceEventEmitter.removeEventListener === "function") {
        console.log("PdfScanner.componentWillUnmount 3");
         DeviceEventEmitter.removeEventListener("onPictureTaken", onPictureTaken);
         DeviceEventEmitter.removeEventListener("onProcessingChange", onProcessing);
        console.log("PdfScanner.componentWillUnmount 4");
      }
      else if(typeof this.onPictureTakenListener.remove === "function") {
        console.log("PdfScanner.componentWillUnmount 5");
        this.onPictureTakenListener.remove();
        this.onProcessingChangeListener.remove();
        console.log("PdfScanner.componentWillUnmount 6");
      }

    }
  }

  capture() {
    // NativeModules.RNPdfScannerManager.capture();
    if (this.state.permissionsAuthorized) CameraManager.capture();
  }

  render() {
    if (!this.state.permissionsAuthorized) return null;
    return (
      <RNPdfScanner
        {...this.props}
        onPictureTaken={this.sendOnPictureTakenEvent.bind(this)}
        onRectangleDetect={this.sendOnRectanleDetectEvent.bind(this)}
        useFrontCam={this.props.useFrontCam || false}
        brightness={this.props.brightness || 0}
        saturation={this.props.saturation || 1}
        contrast={this.props.contrast || 1}
        quality={this.getImageQuality()}
        detectionCountBeforeCapture={
          this.props.detectionCountBeforeCapture || 5
        }
        detectionRefreshRateInMS={this.props.detectionRefreshRateInMS || 50}
      />
    );
  }
}

PdfScanner.propTypes = {
  onPictureTaken: PropTypes.func,
  onRectangleDetect: PropTypes.func,
  overlayColor: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  enableTorch: PropTypes.bool,
  useFrontCam: PropTypes.bool,
  saturation: PropTypes.number,
  brightness: PropTypes.number,
  contrast: PropTypes.number,
  detectionCountBeforeCapture: PropTypes.number,
  detectionRefreshRateInMS: PropTypes.number,
  quality: PropTypes.number,
  documentAnimation: PropTypes.bool,
  noGrayScale: PropTypes.bool,
  manualOnly: PropTypes.bool,
  ...View.propTypes // include the default view properties
};

export default PdfScanner;
