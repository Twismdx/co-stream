import { requireNativeComponent, UIManager, findNodeHandle } from 'react-native'
import React, { useEffect, useImperativeHandle, useRef } from 'react'

const FragmentCamera = requireNativeComponent('FragmentCamera')

const CameraView = React.forwardRef((props, ref) => {
    const localRef = useRef(null)

    useImperativeHandle(ref, () => ({
        createFragment: () => {
            const handle = findNodeHandle(localRef.current)
            if (handle) {
                UIManager.dispatchViewManagerCommand(
                    handle,
                    UIManager.getViewManagerConfig('FragmentCamera').Commands.create,
                    []
                )
            }
        }
    }))

    return <FragmentCamera ref={localRef} style={{ flex: 1 }} />
})

export default CameraView