/*
 * Copyright (C) 2023 pedroSG94.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.costream

import android.content.Context
import android.annotation.SuppressLint
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.util.Range
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.SurfaceHolder
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import androidx.annotation.RequiresApi
import androidx.fragment.app.Fragment
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.pedro.common.ConnectChecker
import com.pedro.encoder.input.gl.render.filters.AndroidViewFilterRender
import com.pedro.encoder.utils.gl.TranslateTo
import com.pedro.library.generic.GenericStream
import com.pedro.encoder.input.sources.audio.MicrophoneSource
import com.pedro.encoder.input.sources.video.Camera2Source
import com.pedro.library.view.OpenGlView
import com.pedro.encoder.input.gl.SpriteGestureController
import android.graphics.Color
import com.pedro.encoder.input.video.Camera2ApiManager
import com.pedro.encoder.input.video.CameraHelper
import android.webkit.WebViewClient
import android.webkit.WebChromeClient
import android.webkit.ConsoleMessage

@RequiresApi(Build.VERSION_CODES.LOLLIPOP)
class CameraFragment : Fragment(), ConnectChecker, View.OnTouchListener {

    companion object {
        fun getInstance(): CameraFragment = CameraFragment()
    }

    // Lazy initialization of the stream using the current (non-null) context from requireContext()
    val genericStream: GenericStream by lazy {
        GenericStream(requireContext(), this).apply {
            getGlInterface().autoHandleOrientation = true
        }
    }

    // Hold the React context; now it is also set in onAttach.
    private var reactContext: ReactApplicationContext? = null

    // Public setter remains in case the view manager wants to explicitly set it.
    fun setReactContext(context: ReactApplicationContext) {
        reactContext = context
    }

    // Automatically acquire the ReactApplicationContext if available.
    override fun onAttach(context: Context) {
        super.onAttach(context)
        if (context is ReactApplicationContext) {
            reactContext = context
        } else {
            Log.w(TAG, "CameraFragment attached with a non-React context; ensure setReactContext is called.")
        }
    }

    // Clear the context reference when the fragment is detached.
    override fun onDetach() {
        super.onDetach()
        reactContext = null
    }

    private val TAG = "CameraFragment"
    private var cameraManager: Camera2ApiManager? = null
    private lateinit var overlay: WebView
    private lateinit var androidViewFilterRender: AndroidViewFilterRender
    private val mainHandler = Handler(Looper.getMainLooper())
    private lateinit var openGlView: OpenGlView
    private var compId: String? = ""
    private var matchId: String = ""
    private var challengeId: String = ""
    private var challenge: Boolean = false
    private var urlOne: String = "https://scrbd.co-stream.live"
    private var isLandscape: Boolean = false
    private val width = 1280
    private val height = 720
    private val vBitrate = 1200 * 1000
    private var rotation = 0
    private val sampleRate = 32000
    private val isStereo = true
    private val aBitrate = 128 * 1000
    private val spriteGestureController = SpriteGestureController()

    @SuppressLint("ClickableViewAccessibility")
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_camera, container, false)
        openGlView = view.findViewById(R.id.surfaceView)

        cameraManager = Camera2ApiManager(requireContext())

        overlay = view.findViewById(R.id.overlay)
        overlay.setBackgroundColor(0)
        val settings = overlay.settings
        settings.javaScriptEnabled = true  
        settings.loadWithOverviewMode = false
        settings.useWideViewPort = false

        androidViewFilterRender = AndroidViewFilterRender()
        androidViewFilterRender.setView(overlay)
        androidViewFilterRender.setPosition(TranslateTo.CENTER)
        androidViewFilterRender.setScale(100.0f, 100.0f)
        genericStream.getGlInterface().setFilter(androidViewFilterRender)
        spriteGestureController.setBaseObjectFilterRender(androidViewFilterRender)
        spriteGestureController.setPreventMoveOutside(false)
        overlay.visibility = View.INVISIBLE

        openGlView.holder.addCallback(object : SurfaceHolder.Callback {
            override fun surfaceCreated(holder: SurfaceHolder) {
                if (isAdded && !genericStream.isOnPreview) genericStream.startPreview(openGlView)
            }

            override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
                if (isAdded) genericStream.getGlInterface().setPreviewResolution(width, height)
            }

            override fun surfaceDestroyed(holder: SurfaceHolder) {
                if (isAdded && genericStream.isOnPreview) genericStream.stopPreview()
            }
        })
        openGlView.setOnTouchListener(this)
        return view
    }

    override fun onTouch(view: View, motionEvent: MotionEvent): Boolean {
        return if (spriteGestureController.spriteTouched(view, motionEvent)) {
            spriteGestureController.moveSprite(view, motionEvent)
            spriteGestureController.scaleSprite(motionEvent)
            true
        } else {
            false
        }
    }

    fun setOrientationMode(isVertical: Boolean) {
        val wasOnPreview = genericStream.isOnPreview
        genericStream.release()
        rotation = if (isVertical) 90 else 0
        prepare()
        if (wasOnPreview) genericStream.startPreview(openGlView)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        prepare()
        genericStream.getStreamClient().setReTries(10)
    }

    private fun prepare() {
        if (!isAdded) return
        val prepared = try {
            genericStream.prepareVideo(width, height, vBitrate, rotation = rotation) &&
            genericStream.prepareAudio(sampleRate, isStereo, aBitrate)
        } catch (e: IllegalArgumentException) {
            false
        }
        if (!prepared) {
            Log.d(TAG, "Audio or Video configuration failed")
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        genericStream.release()
    }

    override fun onDestroyView() {
        super.onDestroyView()
    }

    fun mute() {
        if (isAdded) {
            when (val source = genericStream.audioSource) {
                is MicrophoneSource -> source.mute()
            }
        }
    }

    fun unMute() {
        if (isAdded) {
            when (val source = genericStream.audioSource) {
                is MicrophoneSource -> source.unMute()
            }
        }
    }

    fun isMuted(): Boolean? {
        return if (isAdded) {
            when (val source = genericStream.audioSource) {
                is MicrophoneSource -> source.isMuted()
                else -> null
            }
        } else {
            false
        }
    }

    fun stopStream() {
        if (isAdded) {
            genericStream.stopStream()
            genericStream.stopPreview()
            genericStream.release()
        }
    }

    fun startStream(url: String) {
        if (isAdded) {
            genericStream.startStream(url)
        }
    }

    fun switchCamera() {
        if (isAdded) {
            when (val source = genericStream.videoSource) {
                is Camera2Source -> source.switchCamera()
            }
        }
    }

    fun enableAutoFocus() {
        if (isAdded) {
            when (val source = genericStream.videoSource) {
                is Camera2Source -> source.enableAutoFocus()
            }
        }
    }

    fun setZoom(level: Float) {
        if (isAdded) {
            when (val source = genericStream.videoSource) {
                is Camera2Source -> source.setZoom(level)
            }
        }
    }

    fun getZoomRange(): Range<Float>? {
        return when (val source = genericStream.videoSource) {
            is Camera2Source -> source.getZoomRange()
            else -> null
        }
    }

    fun getZoom(): Float? {
        return when (val source = genericStream.videoSource) {
            is Camera2Source -> source.getZoom()
            else -> null
        }
    }

    fun isStreaming(): Boolean {
        return if (isAdded) {
            genericStream.isStreaming
        } else {
            false
        }
    }

    fun isOnPreview(): Boolean {
        return if (isAdded) {
            genericStream.isOnPreview
        } else {
            false
        }
    }

    fun getSupportedFps(): List<Range<Int>> {
        return if (cameraManager != null) {
            cameraManager?.getSupportedFps(null, CameraHelper.Facing.BACK) ?: emptyList()
        } else {
            emptyList()
        }
    }



    fun removeOverlay() {
        if (isAdded) mainHandler.post { genericStream.getGlInterface().clearFilters() }
    }

    fun setMatchOverlay(compId: String, matchId: String, challenge: Boolean, isLandscape: Boolean) {
        mainHandler.post {
            overlay.setBackgroundColor(0)
            val settings = overlay.settings
            settings.javaScriptEnabled = true
            settings.loadWithOverviewMode = false
            settings.useWideViewPort = false

            // Set a WebViewClient with the correct method signature and import
            overlay.webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView, url: String) {
                    super.onPageFinished(view, url)
                    Log.d("setMatchOverlay", "Loaded URL: $url")
                }
            }

            overlay.webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(consoleMessage: ConsoleMessage): Boolean {
                    Log.d(
                        "WebView", 
                        "${consoleMessage.message()} -- From line ${consoleMessage.lineNumber()} of ${consoleMessage.sourceId()}"
                    )
                    return true
                }
            }


            val fullUrl = "$urlOne?compId=$compId&matchId=$matchId&challenge=$challenge&isLandscape=$isLandscape"
            overlay.loadUrl(fullUrl)

            androidViewFilterRender = AndroidViewFilterRender()
            androidViewFilterRender.setView(overlay)
            androidViewFilterRender.setPosition(TranslateTo.CENTER)
            androidViewFilterRender.setScale(100.0f, 100.0f)

            genericStream.getGlInterface().setFilter(androidViewFilterRender)
            spriteGestureController.setBaseObjectFilterRender(androidViewFilterRender)
            spriteGestureController.setPreventMoveOutside(false)
            overlay.visibility = View.INVISIBLE
        }
    }


    fun setChallengeOverlay(challengeId: String?, challenge: Boolean, isLandscape: Boolean) {
    mainHandler.post {
        overlay.setBackgroundColor(0)
        val settings = overlay.settings
        settings.javaScriptEnabled = true
        settings.loadWithOverviewMode = false
        settings.useWideViewPort = false

        overlay.loadUrl("$urlOne?challengeId=$challengeId&challenge=$challenge&isLandscape=$isLandscape")

        androidViewFilterRender = AndroidViewFilterRender()
        androidViewFilterRender.setView(overlay)
        androidViewFilterRender.setPosition(TranslateTo.CENTER)
        androidViewFilterRender.setScale(100.0f, 100.0f)

        genericStream.getGlInterface().setFilter(androidViewFilterRender)
        spriteGestureController.setBaseObjectFilterRender(androidViewFilterRender)
        spriteGestureController.setPreventMoveOutside(false)
        overlay.visibility = View.INVISIBLE
    }
}

    // ConnectChecker callbacks: each calls sendEventToReactNative to notify React Native.
    override fun onConnectionStarted(url: String) {
        sendEventToReactNative("onConnectionStarted", url)
    }

    override fun onConnectionSuccess() {
        sendEventToReactNative("onConnectionSuccess", null)
    }

    override fun onConnectionFailed(reason: String) {
        if (genericStream.getStreamClient().reTry(5000, reason, null)) {

        } else {
            genericStream.stopStream()
            sendEventToReactNative("onConnectionFailed", reason)
        }
    }

    override fun onNewBitrate(bitrate: Long) {}

    override fun onDisconnect() {
        sendEventToReactNative("onDisconnect", null)
    }

    override fun onAuthError() {
        genericStream.stopStream()
        sendEventToReactNative("onAuthError", null)
    }

    override fun onAuthSuccess() {
        sendEventToReactNative("onAuthSuccess", null)
    }

    // Helper method to send events to React Native.
    private fun sendEventToReactNative(eventName: String, eventData: String?) {
        reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit(eventName, eventData)
    }
}
