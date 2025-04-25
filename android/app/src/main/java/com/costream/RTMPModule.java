package com.costream;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.util.Log;
import android.util.Range;
import android.os.Handler;
import android.os.Looper;
import com.costream.FragmentCamera;
import java.util.List;
import java.util.ArrayList;
import android.util.Range;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.FragmentActivity;

import com.costream.CameraFragment;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.pedro.encoder.input.video.CameraHelper;

public class RTMPModule extends ReactContextBaseJavaModule {
  private final String REACT_MODULE_NAME = "RTMPPublisher";
  private final String TAG = "RTMPModule";
  private ReactApplicationContext reactContext;
  private FragmentCamera fragmentCamera;

  public RTMPModule(@Nullable ReactApplicationContext context) {
    super(context);
    this.reactContext = context;
  }

  @NonNull
  @Override
  public String getName() {
    return REACT_MODULE_NAME;
  }

  // Helper method to retrieve the current CameraFragment instance by its tag.
  private CameraFragment getCameraFragment() {
    Activity activity = getCurrentActivity();
    if (activity != null) {
      return (CameraFragment) ((FragmentActivity) activity)
              .getSupportFragmentManager()
              .findFragmentByTag("CameraFragmentTag");
    }
    return null;
  }

  private void sendEvent(String eventName, @Nullable String eventData) {
    if (getReactApplicationContext().hasActiveCatalystInstance()) {
      getReactApplicationContext()
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
          .emit(eventName, eventData);
    } else {
      Log.e(TAG, "Catalyst instance not active, cannot send event: " + eventName);
    }
  }

  @ReactMethod
  public void setIsPortrait(Boolean isVertical) {
    CameraFragment fragment = getCameraFragment();
    if (fragment == null || !fragment.isAdded()) {
      return;
    }
    fragment.setOrientationMode(isVertical);
  }

  @ReactMethod
  public void onConnectionFailed(String reason) {
    sendEvent("onConnectionFailed", reason);
  }

  @ReactMethod
  public void onAuthError() {
    sendEvent("onAuthError", null);
  }

  @ReactMethod
  public void onConnectionStarted(String url) {
    sendEvent("onConnectionStarted", url);
  }

  @ReactMethod
  public void onConnectionSuccess() {
    sendEvent("onConnectionSuccess", null);
  }

  @ReactMethod
  public void onDisconnect() {
    sendEvent("onDisconnect", null);
  }

  @ReactMethod
  public void onAuthSuccess() {
    sendEvent("onAuthSuccess", null);
  }

  @ReactMethod
  public int getMinZoom() {
    return 1;
  }

  @ReactMethod
  public void getSupportedFps(Promise promise) {
      try {
          CameraFragment fragment = getCameraFragment();
          if (fragment == null || !fragment.isAdded()) {
            return;
          }
          List<Range<Integer>> fpsRanges = fragment.getSupportedFps();
          if (fpsRanges == null) {
              fpsRanges = new ArrayList<>();
          }
          
          // Convert to a WritableArray.
          WritableArray resultArray = Arguments.createArray();
          for (Range<Integer> range : fpsRanges) {
              WritableMap rangeMap = Arguments.createMap();
              rangeMap.putInt("min", range.getLower());
              rangeMap.putInt("max", range.getUpper());
              resultArray.pushMap(rangeMap);
          }
          
          promise.resolve(resultArray);
      } catch (Exception e) {
          promise.reject("GET_FPS_ERROR", "Failed to get supported FPS ranges", e);
      }
  }

  @ReactMethod
  public void getZoomRange(Promise promise) {
    try {
      CameraFragment fragment = getCameraFragment();
      if (fragment == null || !fragment.isAdded()) {
        promise.reject("FRAGMENT_NOT_AVAILABLE", "Camera fragment is not available");
        return;
      }
      Range<Float> zoomRange = fragment.getZoomRange();
      if (zoomRange == null) {
        promise.reject("ERROR", "Zoom range is null");
        return;
      }
      WritableMap result = Arguments.createMap();
      result.putDouble("lower", zoomRange.getLower());
      result.putDouble("upper", zoomRange.getUpper());
      promise.resolve(result);
    } catch (Exception e) {
      Log.e(TAG, "Failed to get zoom range", e);
      promise.reject("ERROR", "Failed to get zoom range", e);
    }
  }

  @ReactMethod
  public void setZoom(float level, Promise promise) {
    CameraFragment fragment = getCameraFragment();
    if (fragment == null || !fragment.isAdded()) {
      promise.reject("FRAGMENT_NOT_AVAILABLE", "Camera fragment is not available");
      return;
    }
    try {
      fragment.setZoom(level);
      promise.resolve("Zoom level set successfully");
    } catch (Exception e) {
      Log.e(TAG, "Failed to set zoom level", e);
      promise.reject("SET_ZOOM_ERROR", "Failed to set zoom level", e);
    }
  }

  @ReactMethod
  public void getZoom(Callback successCallback, Callback errorCallback) {
    try {
      CameraFragment fragment = getCameraFragment();
      if (fragment == null || !fragment.isAdded()) {
        errorCallback.invoke("FRAGMENT_NOT_AVAILABLE", "Camera fragment is not available");
        return;
      }
      float zoomValue = fragment.getZoom();
      WritableMap params = Arguments.createMap();
      params.putDouble("zoomValue", zoomValue);
      successCallback.invoke(params);
    } catch (Exception e) {
      errorCallback.invoke("GET_ZOOM_ERROR", "Failed to get zoom value");
    }
  }

  @ReactMethod
  public void setMatchOverlay(String compId, String matchId, Boolean challenge, Boolean isLandscape) {
    CameraFragment fragment = getCameraFragment();
    if (fragment != null && fragment.isAdded()) {
      fragment.setMatchOverlay(compId, matchId, challenge, isLandscape);
    } else {
      Log.e(TAG, "Cannot set large overlay, camera fragment is not available");
    }
  }

  @ReactMethod
  public void setChallengeOverlay(String challengeId, Boolean challenge, Boolean isLandscape) {
    CameraFragment fragment = getCameraFragment();
    if (fragment != null && fragment.isAdded()) {
      fragment.setChallengeOverlay(challengeId, challenge, isLandscape);
    } else {
      Log.e(TAG, "Cannot set small overlay, camera fragment is not available");
    }
  }

  @ReactMethod
  public void removeOverlay() {
    CameraFragment fragment = getCameraFragment();
    if (fragment != null && fragment.isAdded()) {
      fragment.removeOverlay();
    } else {
      Log.e(TAG, "Cannot remove overlay, camera fragment is not available");
    }
  }

  @ReactMethod
  public void isStreaming(Promise promise) {
    try {
      CameraFragment fragment = getCameraFragment();
      if (fragment == null || !fragment.isAdded()) {
        promise.reject("FRAGMENT_NOT_AVAILABLE", "Camera fragment is not available");
        return;
      }
      boolean streamStatus = fragment.isStreaming();
      promise.resolve(streamStatus);
    } catch (Exception e) {
      promise.reject("STREAM_STATUS_ERROR", "Failed to check streaming status", e);
    }
  }

  @ReactMethod
  public void isCameraOnPreview(Promise promise) {
    try {
      CameraFragment fragment = getCameraFragment();
      if (fragment == null || !fragment.isAdded()) {
        promise.reject("FRAGMENT_NOT_AVAILABLE", "Camera fragment is not available");
        return;
      }
      boolean previewStatus = fragment.isOnPreview();
      promise.resolve(previewStatus);
    } catch (Exception e) {
      promise.reject("PREVIEW_STATUS_ERROR", "Failed to check preview status", e);
    }
  }

  @ReactMethod
  public void isMuted(Promise promise) {
    try {
      CameraFragment fragment = getCameraFragment();
      if (fragment == null || !fragment.isAdded()) {
        promise.reject("FRAGMENT_NOT_AVAILABLE", "Camera fragment is not available");
        return;
      }
      boolean status = fragment.isMuted();
      promise.resolve(status);
    } catch (Exception e) {
      promise.reject("MUTE_STATUS_ERROR", "Failed to check mute status", e);
    }
  }

  @ReactMethod
  public void mute(Promise promise) {
    try {
      CameraFragment fragment = getCameraFragment();
      if (fragment == null || !fragment.isAdded()) {
        promise.reject("FRAGMENT_NOT_AVAILABLE", "Camera fragment is not available");
        return;
      }
      if (fragment.isMuted()) {
        promise.resolve("Already Muted");
      } else {
        fragment.mute();
        promise.resolve("Muted successfully");
      }
    } catch (Exception e) {
      promise.reject("MUTE_ERROR", "Failed to mute", e);
    }
  }

  @ReactMethod
  public void unmute(Promise promise) {
    try {
      CameraFragment fragment = getCameraFragment();
      if (fragment == null || !fragment.isAdded()) {
        promise.reject("FRAGMENT_NOT_AVAILABLE", "Camera fragment is not available");
        return;
      }
      if (!fragment.isMuted()) {
        promise.resolve("Already Unmuted");
      } else {
        fragment.unMute();
        promise.resolve("Unmuted successfully");
      }
    } catch (Exception e) {
      promise.reject("UNMUTE_ERROR", "Failed to unmute", e);
    }
  }

  @ReactMethod
  public void switchCamera(Promise promise) {
    try {
      CameraFragment fragment = getCameraFragment();
      if (fragment == null || !fragment.isAdded()) {
        promise.reject("FRAGMENT_NOT_AVAILABLE", "Camera fragment is not available");
        return;
      }
      fragment.switchCamera();
      promise.resolve("Switched camera successfully");
    } catch (Exception e) {
      promise.reject("SWITCH_CAMERA_ERROR", "Failed to switch camera", e);
    }
  }

  @ReactMethod
  public void startStream(String streamUrl, Promise promise) {
    try {
      CameraFragment fragment = getCameraFragment();
      if (fragment == null || !fragment.isAdded()) {
        promise.reject("FRAGMENT_NOT_AVAILABLE", "Camera fragment is not available");
        return;
      }
      fragment.startStream(streamUrl);
      promise.resolve("Streaming started successfully");
    } catch (Exception e) {
      promise.reject("START_STREAM_ERROR", "Failed to start stream", e);
    }
  }

  @ReactMethod
  public void stopStream(Promise promise) {
    try {
      CameraFragment fragment = getCameraFragment();
      if (fragment == null || !fragment.isAdded()) {
        promise.reject("FRAGMENT_NOT_AVAILABLE", "Camera fragment is not available");
        return;
      }
      fragment.stopStream();
      promise.resolve("Streaming stopped successfully");
    } catch (Exception e) {
      promise.reject("STOP_STREAM_ERROR", "Failed to stop stream", e);
    }
  }

  @ReactMethod
  public void enableAutoFocus(Promise promise) {
    try {
      CameraFragment fragment = getCameraFragment();
      if (fragment == null || !fragment.isAdded()) {
        promise.reject("FRAGMENT_NOT_AVAILABLE", "Camera fragment is not available");
        return;
      }
      fragment.enableAutoFocus();
      promise.resolve("Auto focus enabled");
    } catch (Exception e) {
      promise.reject("AUTOFOCUS_ERROR", "Failed to enable auto focus", e);
    }
  }

  @ReactMethod
  public void addListener(String eventName) {
    // No-op: Required for RN built-in event emitter.
  }

  @ReactMethod
  public void removeListeners(double count) {
    // No-op: Required for RN built-in event emitter.
  }
}
