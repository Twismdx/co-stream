package com.costream

import android.content.Context
import android.graphics.Canvas
import android.util.AttributeSet
import android.webkit.WebView

class ClippedWebView(context: Context, attrs: AttributeSet?) : WebView(context, attrs) {
    private val visibleHeight = 300  // Show only the bottom 400px

    override fun onDraw(canvas: Canvas) {
        val saveCount = canvas.save()
        
        // Move the clipping area to show only the bottom part
        val topClip = height - visibleHeight  // Start clipping from (height - 400)
        canvas.clipRect(0, topClip, width, height)

        super.onDraw(canvas)
        canvas.restoreToCount(saveCount)
    }
}
