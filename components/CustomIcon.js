import React from 'react'
import { View } from 'react-native'
import { SvgXml } from 'react-native-svg'

const CustomSVGIcon = ({ xml, width, height, color }) => {
    return (
        <View>
            <SvgXml xml={xml} width={width} height={height} fill={color} />
        </View>
    );
}

export default CustomSVGIcon