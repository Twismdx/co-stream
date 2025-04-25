package com.costream;

import android.content.res.Configuration;
import android.graphics.PixelFormat;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.OrientationEventListener;
import android.view.SurfaceHolder;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.fragment.app.FragmentActivity;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;

import com.costream.modules.Publisher;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.pedro.encoder.input.gl.SpriteGestureController;
import com.pedro.encoder.input.gl.render.filters.AndroidViewFilterRender;
import com.pedro.encoder.input.video.CameraHelper;
import com.pedro.encoder.utils.gl.TranslateTo;
import com.pedro.library.view.OpenGlView;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Map;

import com.costream.CameraFragment;

public class RTMPManager extends SimpleViewManager<ConstraintLayout> implements SurfaceHolder.Callback, View.OnTouchListener {

    private static final String TAG = "RTMPManager";
    public final String REACT_CLASS_NAME = "RTMPPublisher";
    private ThemedReactContext reactContext;
    private static String _streamUrl;
    private static String _streamName;
    public static ConstraintLayout layout;
    public static Publisher publisher;
    public static AndroidViewFilterRender androidViewFilterRender;
    private static WebView overlay;
    private OrientationEventListener orientationEventListener;
    private static WebSettings ws;
    private OpenGlView openGlView;
    private static final SpriteGestureController spriteGestureController = new SpriteGestureController();
    private static Handler mainHandler = new Handler(Looper.getMainLooper());
    static String matchID;
    private PixelFormat pixelFormat;
    CameraFragment cameraFragment = CameraFragment.Companion.getInstance();

    CameraHelper.Facing facing = CameraHelper.Facing.BACK;
  float dX, dY;

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS_NAME;
    }

  View.OnLayoutChangeListener onLayoutChangeListener = new View.OnLayoutChangeListener() {
    @Override
    public void onLayoutChange(@NonNull View view, int i, int i1, int i2, int i3, int i4, int i5, int i6, int i7) {

    }
  };

    @NonNull
    @Override
    protected ConstraintLayout createViewInstance(ThemedReactContext reactContext) {
        this.reactContext = reactContext;
        layout = (ConstraintLayout) LayoutInflater.from(reactContext).inflate(R.layout.gl_container, null);
        // openGlView = layout.findViewById(R.id.surfaceView);
        // publisher = new Publisher(reactContext, openGlView);
        layout.setTag(this);
        
        // overlay = layout.findViewById(R.id.overlay);
        // overlay.setBackgroundColor(0);
        // overlay.getSettings().setJavaScriptEnabled(true);
        // overlay.getSettings().setLoadWithOverviewMode(true);
        // overlay.getSettings().setUseWideViewPort(true);
        // overlay.loadUrl("https://svg-overlay.vercel.app");

        // androidViewFilterRender = new AndroidViewFilterRender();
        // androidViewFilterRender.setView(overlay);
        // androidViewFilterRender.setPosition(TranslateTo.CENTER);
        // androidViewFilterRender.setScale(100, 100);
        // publisher.getGenericCamera().getGlInterface().setFilter(androidViewFilterRender);
        // spriteGestureController.setBaseObjectFilterRender(androidViewFilterRender);
        // spriteGestureController.setPreventMoveOutside(false);

        // overlay.setVisibility(View.INVISIBLE);

    // removeOverlay();

    // SurfaceHolderHelper surfaceHolderHelper = new SurfaceHolderHelper(reactContext, publisher.getGenericCamera(), openGlView.getId());

    // openGlView.addOnLayoutChangeListener(onLayoutChangeListener);
    // openGlView.getHolder().addCallback(surfaceHolderHelper);
    // openGlView.setOnTouchListener(this);

        return layout;
    }

     public void toggleCameraFragment(boolean isVisible) {
    FragmentActivity activity = (FragmentActivity) reactContext.getCurrentActivity();
    if (activity != null) {
        activity.runOnUiThread(() -> {
            try {
                FragmentManager fragmentManager = activity.getSupportFragmentManager();
                FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();

                if (isVisible) {
                    if (!cameraFragment.isAdded()) {
                        layout.removeView(openGlView);
                        fragmentTransaction.replace(R.id.fragment_container, cameraFragment);
                        fragmentTransaction.commitAllowingStateLoss();
                        Log.e(TAG, "completed");
                    }
                } else {
                  Log.e(TAG, "Error toggling camera fragment");
                    removeCameraFragment();
                }
            } catch (Exception e) {
                Log.e(TAG, "Error toggling camera fragment", e);
            }
        });
    } else {
        Log.e(TAG, "Activity is null");
    }
}

     public void removeCameraFragment() {
        FragmentActivity activity = (FragmentActivity) reactContext.getCurrentActivity();
        if (activity != null) {
            activity.runOnUiThread(() -> {
                FragmentManager fragmentManager = activity.getSupportFragmentManager();
                FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();

                if (cameraFragment.isAdded()) {
                    fragmentTransaction.remove(cameraFragment);
                    fragmentTransaction.commitAllowingStateLoss();
                }
            });
        }
    }

  public static int getLayoutId() {
    return layout.getId();
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

    @Override
    public void surfaceCreated(@NonNull SurfaceHolder surfaceHolder) {
      String id = facingToString(facing);
      publisher.getGenericCamera().startPreview(id, 1920, 1080, reactContext.getResources().getConfiguration().orientation == Configuration.ORIENTATION_PORTRAIT ? 90 : 0);
    }

    @Override
    public void surfaceChanged(@NonNull SurfaceHolder surfaceHolder, int i, int i1, int i2) {
    }

    @Override
    public void surfaceDestroyed(@NonNull SurfaceHolder surfaceHolder) {
        publisher.getGenericCamera().stopPreview();
    }

    @Nullable
    @Override
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.<String, Object>builder()
            .put("onDisconnect", MapBuilder.of("registrationName", "onDisconnect"))
            .put("onConnectionFailed", MapBuilder.of("registrationName", "onConnectionFailed"))
            .put("onConnectionStarted", MapBuilder.of("registrationName", "onConnectionStarted"))
            .put("onConnectionSuccess", MapBuilder.of("registrationName", "onConnectionSuccess"))
            .put("onNewBitrateReceived", MapBuilder.of("registrationName", "onNewBitrateReceived"))
            .put("onStreamStateChanged", MapBuilder.of("registrationName", "onStreamStateChanged"))
            .build();
    }

    @Override
    public boolean onTouch(View view, MotionEvent motionEvent) {
        if (spriteGestureController.spriteTouched(view, motionEvent)) {
            spriteGestureController.moveSprite(view, motionEvent);
            spriteGestureController.scaleSprite(motionEvent);
            return true;
        }
        return false;
    }

    public static void removeOverlay() {
        mainHandler.post(() -> {
            if (publisher != null && publisher.getGenericCamera() != null
                && publisher.getGenericCamera().getGlInterface() != null) {
                publisher.getGenericCamera().getGlInterface().clearFilters();
            }
        });
    }

    public static void setLargeOverlay(@Nullable String compId, String matchId, int test) {
        mainHandler.post(() -> {
            if (overlay == null) {
                Log.e(TAG, "Overlay is null. Cannot proceed.");
                return;
            }
            overlay.setBackgroundColor(0);
            overlay.getSettings().setJavaScriptEnabled(true);
            overlay.getSettings().setLoadWithOverviewMode(true);
            overlay.getSettings().setUseWideViewPort(true);

            try {
                String url = "https://svg-overlay.vercel.app?"
                    + "compId=" + (compId != null ? URLEncoder.encode(compId, "UTF-8") : "")
                    + "&matchId=" + (matchId != null ? URLEncoder.encode(matchId, "UTF-8") : "")
                    + "&test=" + test;
                overlay.loadUrl(url);
                Log.d(TAG, url);
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
            }

            androidViewFilterRender = new AndroidViewFilterRender();
            androidViewFilterRender.setView(overlay);
            androidViewFilterRender.setPosition(TranslateTo.BOTTOM);
            androidViewFilterRender.setScale(100, 100);

            publisher.getGenericCamera().getGlInterface().setFilter(androidViewFilterRender);
            spriteGestureController.setBaseObjectFilterRender(androidViewFilterRender);
            spriteGestureController.setPreventMoveOutside(false);
            overlay.setVisibility(View.INVISIBLE);
        });
    }

    public static void setSmallOverlay(@Nullable String compId, String matchId, int test) {
        mainHandler.post(() -> {
            overlay.setBackgroundColor(0);
            overlay.getSettings().setJavaScriptEnabled(true);
            overlay.getSettings().setLoadWithOverviewMode(true);
            overlay.getSettings().setUseWideViewPort(true);
            overlay.loadUrl(
                "https://scoreboard-landscape.vercel.app?" + "compId=" + compId + "&matchId=" + matchId + "&test=" + test);
            androidViewFilterRender = new AndroidViewFilterRender();
            androidViewFilterRender.setView(overlay);
            androidViewFilterRender.setPosition(TranslateTo.CENTER);
            androidViewFilterRender.setScale(100, 100);
            publisher.getGenericCamera().getGlInterface().setFilter(androidViewFilterRender);
            spriteGestureController.setBaseObjectFilterRender(androidViewFilterRender);
            spriteGestureController.setPreventMoveOutside(false);
            overlay.setVisibility(View.INVISIBLE);
        });
    }

    @ReactProp(name = "streamURL")
  public void setStreamURL(ConstraintLayout openGlView, @Nullable String url) {
    publisher.setStreamUrl(url);
  }

  @ReactProp(name = "streamName")
  public void setStreamName(ConstraintLayout openGlView, @Nullable String name) {
    publisher.setStreamName(name);
  }

}