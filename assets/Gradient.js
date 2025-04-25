import React from 'react'
import { Svg, Defs, LinearGradient, Stop } from 'react-native-svg'

const GradientSVG = ({ idCSS }) => {
	const gradientTransform = 'rotate(315deg)'

	return (
        <Svg>
            <Defs>
				<LinearGradient
					id={idCSS}
					gradientTransform={gradientTransform}
				>
					<Stop
						offset='0%'
						stopColor='#2e325a'
					/>
					<Stop
						offset='100%'
						stopColor='#0e112a'
					/>
				</LinearGradient>
			</Defs>
        </Svg>
    );
}

export default GradientSVG
