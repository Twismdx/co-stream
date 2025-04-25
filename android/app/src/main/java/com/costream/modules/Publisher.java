package com.costream.modules;

import android.app.Activity;
import android.content.Context;
import android.graphics.Point;
import android.media.AudioManager;
import android.util.Log;
import android.util.Range;

import androidx.annotation.NonNull;
import androidx.constraintlayout.widget.ConstraintLayout;

import com.costream.CameraFragment;
import com.costream.RTMPManager;
import com.costream.enums.AudioInputType;
import com.costream.enums.StreamState;
import com.costream.interfaces.ConnectionListener;
import com.costream.utils.ObjectCaster;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.pedro.encoder.input.video.CameraHelper;
import com.pedro.library.generic.GenericCamera2;
import com.pedro.library.view.OpenGlView;

public class Publisher {
    private static final String TAG = "Publisher";

    private final OpenGlView openGlView;
    private final GenericCamera2 genericCamera2;
    private final ThemedReactContext reactContext;
    private final AudioManager audioManager;
    private String streamUrl;
    private String streamName; 
    private final ConnectionChecker connectionChecker = new ConnectionChecker();

    public Publisher(ThemedReactContext reactContext, OpenGlView openGlView) {
        this.reactContext = reactContext;
        this.openGlView = openGlView;
        this.genericCamera2 = new GenericCamera2(openGlView, connectionChecker);
        this.genericCamera2.enableAutoFocus();
        this.audioManager = (AudioManager) reactContext.getSystemService(Context.AUDIO_SERVICE);
        connectionChecker.addListener(createConnectionListener());
        audioManager.setSpeakerphoneOn(true);
    }

    public GenericCamera2 getGenericCamera() {
        return genericCamera2;
    }

    public String facingToString(CameraHelper.Facing facing) {
        switch (facing) {
            case BACK:
                return "BACK";
            case FRONT:
                return "FRONT";
            default:
                return "UNKNOWN";
        }
    }

    public Point getEncoderSize() {
        return genericCamera2.getGlInterface().getEncoderSize();
    }

    public float getZoom() {
        return genericCamera2.getZoom();
    }

    public Range<Float> getZoomRange() {
        return genericCamera2.getZoomRange();
    }

    public void setZoom(float level) {
        try {
            genericCamera2.setZoom(level);
        } catch (Exception e) {
            Log.e(TAG, "Failed to set zoom level", e);
        }
    }

    public ConnectionListener createConnectionListener() {
        return new ConnectionListener() {
            @Override
            public void onChange(String type, Object data) {
                handleEvent(type, data);
            }
        };
    }

    private void handleEvent(@NonNull String eventType, Object data) {
        WritableMap eventData = ObjectCaster.caster(data);
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(RCTEventEmitter.class)
                .receiveEvent(RTMPManager.getLayoutId(), eventType, eventData);

            WritableMap stateEvent = Arguments.createMap();
            switch (eventType) {
                case "onConnectionStarted":
                    stateEvent.putString("data", String.valueOf(StreamState.CONNECTING));
                    break;
                case "onConnectionSuccess":
                    stateEvent.putString("data", String.valueOf(StreamState.CONNECTED));
                    break;
                case "onDisconnect":
                    stateEvent.putString("data", String.valueOf(StreamState.DISCONNECTED));
                    break;
                case "onConnectionFailed":
                    stateEvent.putString("data", String.valueOf(StreamState.FAILED));
                    break;
                default:
                    Log.w(TAG, "Unknown event type: " + eventType);
                    return;
            }

            reactContext
                .getJSModule(RCTEventEmitter.class)
                .receiveEvent(RTMPManager.getLayoutId(), "onStreamStateChanged", stateEvent);
        } else {
            Log.e(TAG, "React context is not active, cannot send event: " + eventType);
        }
    }

    public String getPublishURL() {
        return streamUrl + "/" + streamName;
    }

    public void setStreamUrl(String streamUrl) {
        this.streamUrl = streamUrl;
    }

    public void setStreamName(String streamName) {
        this.streamName = streamName;
    }

    public boolean isStreaming() {
        return genericCamera2.isStreaming();
    }

    public boolean isOnPreview() {
        return genericCamera2.isOnPreview();
    }

    public boolean isAudioPrepared() {
        return genericCamera2.prepareAudio();
    }

    public boolean isVideoPrepared() {
        return genericCamera2.prepareVideo(1920, 1080, 1200 * 1000);
    }

    public boolean isAudioMuted() {
        return genericCamera2.isAudioMuted();
    }

    public void disableAudio() {
        try {
            genericCamera2.disableAudio();
        } catch (Exception e) {
            Log.e(TAG, "Failed to disable audio", e);
        }
    }

    public void enableAudio() {
        try {
            genericCamera2.enableAudio();
        } catch (Exception e) {
            Log.e(TAG, "Failed to enable audio", e);
        }
    }

    public void switchCamera() {
        try {
            genericCamera2.switchCamera();
        } catch (Exception e) {
            Log.e(TAG, "Failed to switch camera", e);
        }
    }

    public void toggleFlash() {
        try {
            if (genericCamera2.isLanternEnabled()) {
                genericCamera2.disableLantern();
            } else {
                genericCamera2.enableLantern();
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to toggle flash", e);
        }
    }

    public void startStream() {
        try {
            if (streamName == null || streamUrl == null) {
                Log.e(TAG, "Stream URL or stream name is not set.");
                return;
            }

            boolean isAudioPrepared = genericCamera2.prepareAudio();
            boolean isVideoPrepared = genericCamera2.prepareVideo(1920, 1080, 1200 * 1000);

            if (!isAudioPrepared || !isVideoPrepared) {
                Log.e(TAG, "Failed to prepare audio or video for streaming.");
                return;
            }

            String url = streamUrl + "/" + streamName;
            genericCamera2.startStream(url);
        } catch (Exception e) {
            Log.e(TAG, "Failed to start stream", e);
        }
    }

    public void stopStream() {
        try {
            if (!genericCamera2.isStreaming()) {
                Log.e(TAG, "Stream is not active.");
                return;
            }
            genericCamera2.stopStream();
        } catch (Exception e) {
            Log.e(TAG, "Failed to stop stream", e);
        }
    }
}
