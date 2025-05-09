import React from 'react'
import { Svg, Path } from 'react-native-svg'

export function PhoneRotateIcon(props) {
	return (
        <Svg
			xmlns='http://www.w3.org/2000/svg'
			width='1em'
			height='1em'
			viewBox='0 0 24 24'
			{...props}
		>
            <Path
				fill='currentColor'
				d='M9 1H3a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2m0 14H3V3h6zm12-2h-8v2h8v6H9v-1H6v1a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2m2-3l-4-2l1.91-.91A7.516 7.516 0 0 0 14 2.5V1a9 9 0 0 1 9 9'
			></Path>
        </Svg>
    );
}
