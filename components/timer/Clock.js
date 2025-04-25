import React, { useEffect, useRef } from 'react'
import { useGlobalContext } from './context'
import { Text, TouchableOpacity, StyleSheet } from 'react-native'

export default function Clock() {
	const {
		clockStatus,
		setClockStatus,
		setActionText,
		time,
		setTime,
		selectedFont,
		key,
		setKey,
		selectedController,
		shortTimer,
		minuteTimer,
		theme,
		actionText,
		isPlaying,
		setIsPlaying,
	} = useGlobalContext()
	let activeColors = theme.colors[theme.mode]
	const minutesToDisplay = Math.floor(time / 60)
	const secondsToDisplay = time - minutesToDisplay * 60

	const styles = {
		clockText: {
			// flex: 1,
			// position: 'relative',
			justifyContent: 'center',
			alignItems: 'center',
			// bottom: -75,
			left: -3,
			fontStyle: 'normal',
			fontWeight: 'bold',
			fontSize: 140,
			textAlign: 'center',
			lineHeight: 12,
			color: activeColors.primary,
			letterSpacing: -0.5,
			paddingTop: 100,
		},
	}

	useEffect(() => {
		if (
			twoDigits(minutesToDisplay) === '00' &&
			twoDigits(secondsToDisplay) === '00'
		) {
			setActionText('RESTART')
		}
	})

	useInterval(
		() => {
			if (time > 0) {
				setTime(time - 1)
			} else {
				setClockStatus('Stopped')
			}
		},
		clockStatus === 'Started' ? 1000 : null
	)

	const handleReset = () => {
		setKey((prevKey) => prevKey + 1)
		if (selectedController === 'shortTimer') {
			setTime(shortTimer)
		} else if (selectedController === 'minuteTimer') {
			setTime(minuteTimer)
		}
	}

	const handleAction = () => {
		if (actionText === 'START') {
			setClockStatus('Started')
			setActionText('PAUSE')
			setIsPlaying(true)
		} else if (actionText === 'PAUSE') {
			setClockStatus('Stopped')
			setActionText('START')
			setIsPlaying(false)
		} else if (actionText === 'RESTART') {
			setClockStatus('Stopped')
			setIsPlaying(false)
			handleReset()
			if (selectedController === 'shortTimer') {
				setTime(shortTimer)
			} else if (selectedController === 'minuteTimer') {
				setTime(minuteTimer)
			}
			setActionText('START')
		}
	}

	return (
		<>
			<TouchableOpacity onPress={() => handleReset()}>
				<Text
					style={[
						styles.clockText,
						{
							fontFamily: selectedFont,
							color: activeColors.onPrimary,
						},
					]}
				>
					{time >= 60
						? `${minutesToDisplay}:${twoDigits(secondsToDisplay)}`
						: twoDigits(secondsToDisplay)}
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={[
					styles.actionTextDiv,
					{
						marginTop: 25,
					}
				]}
				id={actionText}
				onPress={() => {
					handleAction()
					// Beep()
				}}
			>
				<Text
					style={{
						fontFamily: selectedFont,
						opacity: 0.5,
						fontSize: 45,
						lineHeight: 30,
						letterSpacing: 19,
						fontWeight: 'bold',
						color: activeColors.onPrimary,
						paddingTop: 25,
					}}
				>
					{actionText}
				</Text>
			</TouchableOpacity>
		</>
	)
}

function useInterval(callback, delay) {
	const savedCallback = useRef()

	useEffect(() => {
		savedCallback.current = callback
	}, [callback])

	useEffect(() => {
		function tick() {
			savedCallback.current()
		}

		if (delay !== null) {
			let id = setInterval(tick, delay)
			return () => clearInterval(id)
		}
	}, [delay])
}

const twoDigits = (num) => String(num).padStart(2, '0')
