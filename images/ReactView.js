import * as React from 'react'
import { View, AppRegistry } from 'react-native'
import Svg, {
	LinearGradient,
	Stop,
	G,
	Path,
	Rect,
	Text,
} from 'react-native-svg'
import ProgressBar from '../components/timer/ProgressBar'

const Scoreboard = ({ stats }) => {
	return (
        <View
			style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
		>
            <Svg
				version='1.0'
				id='Layer_1'
				xmlns='http://www.w3.org/2000/svg'
				viewBox='0 0 1920 100'
				width='450'
				height='100'
			>
				<G id='Group_1'>
					<Path
						id='Frame'
						fill-opacity='0.5'
						d='M29.7,7.7C32.4,2.9,37.4,0,42.8,0h1582.5c11.7,0,18.9,12.8,12.8,22.8l-18.3,30
c-2.7,4.5-7.6,7.2-12.8,7.2H26.1C14.6,60,7.4,47.7,13,37.7L29.7,7.7z'
					/>
					<Path
						id='HomeFrame'
						fill='#1C1C1C'
						d='M30.6,9.4C33.3,4.8,38.3,2,43.6,2H718v56H28.2C16.6,58,9.4,45.4,15.3,35.4L30.6,9.4z'
					/>
					<Path
						id='AwayFrame'
						fill='#1C1C1C'
						d='M718,2h904.9c11.8,0,19,13,12.7,23l-16.2,26c-2.7,4.4-7.6,7-12.7,7H718V2z'
					/>

					<LinearGradient
						id='Center_1_'
						gradientUnits='userSpaceOnUse'
						x1='729.3607'
						y1='93.9038'
						x2='921.7156'
						y2='82.1527'
						gradientTransform='matrix(1 0 0 -1 0 118)'
					>
						<Stop
							offset='0'
							style={{ stopColor: '#F7F5F5' }}
						/>
						<Stop
							offset='0.537'
							style={{ stopColor: '#D9D8D8' }}
						/>
					</LinearGradient>
					<Path
						id='Center'
						fill='url(#Center_1_)'
						d='M733,5h186c8.3,0,15,6.7,15,15v20c0,8.3-6.7,15-15,15H733c-8.3,0-15-6.7-15-15V20
C718,11.7,724.7,5,733,5z'
					/>
					<Rect
						id='ProgressBarFrame'
						x='403'
						y='71'
						fill='#FFFFFF'
						width='218'
						height='46'
					/>
					<Rect
						id='ProgressBar'
						x='405'
						y='73'
						fill='#FFFFFF'
						width='214'
						height='42'
					/>
					<Path
						id='Extension'
						fill='#42D70E'
						d='M343,86c0-8.3,6.7-15,15-15h45v46h-45c-8.3,0-15-6.7-15-15V86z'
					/>
					<Path
						id='Time'
						fill='#1C1C1C'
						d='M621,71h65c8.3,0,15,6.7,15,15v16c0,8.3-6.7,15-15,15h-65V71z'
					/>
					<Path
						id='Gloss'
						fill='#D9D9D9'
						fill-opacity='8.000000e-02'
						style={{ opacity: '0.2' }}
						d='M343,92c0-11.6,9.4-21,21-21h322c8.3,0,15,6.7,15,15v6H343z'
					/>
					<G>
						<G enable-background='new    '>
							<Path
								fill='#FFFFFF'
								d='M347.8,103V84h13.6v4.1h-8.5v3.2h7.8v4.1h-7.8v3.2h8.5v4.1H347.8z'
							/>
							<Path
								fill='#FFFFFF'
								d='M369.5,84l3.1,5.5h0.1l3.1-5.5h5.7l-5.7,9.5l5.9,9.5h-5.9l-3.2-5.6h-0.1l-3.2,5.6h-5.8l5.8-9.5l-5.6-9.5
        H369.5z'
							/>
							<Path
								fill='#FFFFFF'
								d='M383.3,88.2V84h16.4v4.1H394V103H389V88.2H383.3z'
							/>
						</G>
					</G>
				</G>
				<Rect
					id='homeplayer'
					x='92.6'
					y='7.5'
					fill='none'
					width='500.8'
					height='45.1'
				/>
				<Rect
					id='awayplayer'
					x='1058'
					y='7.5'
					fill='none'
					width='500.8'
					height='45.1'
				/>
				<Rect
					id='homescore'
					x='610.6'
					y='7.5'
					fill='none'
					width='100.9'
					height='45.1'
				/>
				<Rect
					id='awayscore'
					x='939.9'
					y='7.5'
					fill='none'
					width='100.9'
					height='45.1'
				/>
				<Rect
					id='raceto'
					x='736.4'
					y='7.5'
					fill='none'
					width='175.6'
					height='45.1'
				/>
				<Rect
					id='timer'
					x='626'
					y='73'
					fill='none'
					width='67.5'
					height='42'
				/>
				<Text
					transform='matrix(1 0 0 1 652.2307 101.3956)'
					fill='#FFFFFF'
					font-family="'MyriadPro-Regular'"
					textAlign='middle'
					textAnchor='middle'
					font-size='30px'
				>
					{stats?.hometeamscore}
				</Text>
				<Text
					transform='matrix(1 0 0 1 334.8398 37.4294)'
					fill='#FFFFFF'
					font-family="'MyriadPro-Regular'"
					textAlign='middle'
					textAnchor='middle'
					font-size='30px'
				>
					{stats?.hometeamlabel}
				</Text>
				<Text
					transform='matrix(1 0 0 1 1301.2169 37.4292)'
					fill='#FFFFFF'
					font-family="'MyriadPro-Regular'"
					textAlign='middle'
					textAnchor='middle'
					font-size='30px'
				>
					{stats?.awayteamlabel}
				</Text>
				<Text
					transform='matrix(1 0 0 1 983.14 37.4292)'
					fill='#FFFFFF'
					font-family="'MyriadPro-Regular'"
					textAlign='middle'
					textAnchor='middle'
					font-size='30px'
				>
					{stats?.awayteamscore}
				</Text>
				<Text
					transform='matrix(1 0 0 1 653.3701 37.4292)'
					fill='#FFFFFF'
					font-family="'MyriadPro-Regular'"
					textAlign='middle'
					textAnchor='middle'
					font-size='30px'
				>
					{stats?.timer}
				</Text>
				<Text
					transform='matrix(1 0 0 1 815.7994 37.4292)'
					fill='#231F20'
					font-family="'MyriadPro-Regular'"
					textAlign='middle'
					textAnchor='middle'
					font-size='30px'
				>
					{stats?.raceto}
				</Text>
			</Svg>
        </View>
    );
}

AppRegistry.registerComponent('costream', () => ReactView)
