package com.costream;

import android.annotation.SuppressLint;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.Choreographer;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.webkit.WebSettings;
import android.webkit.WebView;
import java.util.List;
import java.util.ArrayList;
import android.util.Range;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.fragment.app.FragmentActivity;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.pedro.encoder.input.gl.SpriteGestureController;
import com.pedro.encoder.input.gl.render.filters.AndroidViewFilterRender;
import com.pedro.encoder.input.video.Camera2ApiManager;
import com.costream.CameraFragment;
import com.pedro.encoder.input.video.CameraHelper;

import java.util.Map;

public class FragmentCamera extends SimpleViewManager<View> implements View.OnTouchListener {

    private String REACT_CLASS_NAME = "FragmentCamera";
    private String TAG = "FragmentCamera";
    private int COMMAND_CREATE = 1;
    private int COMMAND_POP_BACK = 2;
    private WebView overlay;
    private WebSettings ws;
    private SpriteGestureController spriteGestureController = new SpriteGestureController();
    public AndroidViewFilterRender androidViewFilterRender;
    private Handler mainHandler = new Handler(Looper.getMainLooper());
    private Camera2ApiManager cameraManager;
    private ThemedReactContext mContext;
    public CameraFragment cameraFragment; // instance reference, not static
    private ConstraintLayout layout;
    private ViewGroup fragmentContainer;

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS_NAME;
    }
    
    @SuppressLint("SetJavaScriptEnabled")
    @NonNull
    @Override
    protected View createViewInstance(@NonNull ThemedReactContext context) {
        mContext = context;
        layout = (ConstraintLayout) LayoutInflater.from(context)
            .inflate(R.layout.gl_container, null);
        // Create a new instance each time
        cameraFragment = CameraFragment.Companion.getInstance();
        fragmentContainer = layout.findViewById(R.id.fragment_container);
        
        layout.post(() -> {
            if (fragmentContainer != null) {
                createFragment();
            }
        });

        // Call the layout hack method
        setupLayoutHack(layout);

        return layout;
    }

    public void sendEvent(ThemedReactContext reactContext, String eventName, @Nullable WritableMap params) {
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        }
    }

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.of(
            "create", COMMAND_CREATE,
            "popBack", COMMAND_POP_BACK
        );
    }

    @Override
    public void receiveCommand(View view, int commandId, @Nullable ReadableArray args) {
        if (commandId == COMMAND_CREATE) {
            createFragment();
        } else if (commandId == COMMAND_POP_BACK) {
            destroyFragment();
        }
    }

    private void createFragment() {
        FragmentActivity activity = (FragmentActivity) mContext.getCurrentActivity();
        if (activity != null) {
            FragmentManager fragmentManager = activity.getSupportFragmentManager();
            FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
            if (fragmentContainer != null) {
                Log.d(TAG, "Fragment container found with ID: " + fragmentContainer.getId());
                // Pass the ReactApplicationContext into the fragment
                ReactApplicationContext reactApplicationContext = (ReactApplicationContext) mContext.getReactApplicationContext();
                cameraFragment.setReactContext(reactApplicationContext);
                cameraManager = new Camera2ApiManager(mContext);
                // Use a tag to identify the fragment instance
                fragmentTransaction.replace(fragmentContainer.getId(), cameraFragment, "CameraFragmentTag");
                fragmentTransaction.commit();
                Log.d(TAG, "Fragment transaction committed.");
            } else {
                Log.e(TAG, "Fragment container not found.");
            }
        } else {
            Log.e(TAG, "Activity is null, cannot create fragment.");
        }
    }

    private void destroyFragment() {
        FragmentActivity activity = (FragmentActivity) mContext.getCurrentActivity();
        if (activity != null) {
            FragmentManager fm = activity.getSupportFragmentManager();
            FragmentTransaction ft = fm.beginTransaction();
            ft.remove(cameraFragment);
            ft.commitAllowingStateLoss();
            fm.executePendingTransactions();
        }
    }

    private void setupLayoutHack(View view) {
        view.getViewTreeObserver().addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
            @Override
            public void onGlobalLayout() {
                manuallyLayoutChildren((ConstraintLayout) view);
                view.getViewTreeObserver().removeOnGlobalLayoutListener(this);
            }
        });

        Choreographer.getInstance().postFrameCallback(new Choreographer.FrameCallback() {
            @Override
            public void doFrame(long frameTimeNanos) {
                manuallyLayoutChildren((ConstraintLayout) view);
                view.getViewTreeObserver().dispatchOnGlobalLayout();
                Choreographer.getInstance().postFrameCallback(this);
            }
        });
    }

    private void manuallyLayoutChildren(ConstraintLayout layout) {
        for (int i = 0; i < layout.getChildCount(); i++) {
            View child = layout.getChildAt(i);
            child.measure(View.MeasureSpec.makeMeasureSpec(layout.getMeasuredWidth(), View.MeasureSpec.EXACTLY),
                    View.MeasureSpec.makeMeasureSpec(layout.getMeasuredHeight(), View.MeasureSpec.EXACTLY));
            child.layout(0, 0, child.getMeasuredWidth(), child.getMeasuredHeight());
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    @Override
    public boolean onTouch(View view, MotionEvent motionEvent) {
        if (spriteGestureController.spriteTouched(view, motionEvent)) {
            spriteGestureController.moveSprite(view, motionEvent);
            spriteGestureController.scaleSprite(motionEvent);
            return true;
        }
        return false;
    }

    public boolean isStreaming() {
        return cameraFragment != null && cameraFragment.isStreaming();
    }

    public boolean isOnPreview() {
        return cameraFragment != null && cameraFragment.isOnPreview();
    }
}
