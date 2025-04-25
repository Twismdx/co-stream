import React, { useEffect, useContext, useRef, useState } from 'react'
import {
	View,
	TouchableOpacity,
	Image,
	StyleSheet,
	ScrollView,
	RefreshControl,
	SafeAreaView,
	Platform,
} from 'react-native'

import { useGlobalContext } from '../timer/context'
import {
	Modal,
	FormControl,
	Button,
	Center,
	Input,
	Select,
	WarningOutlineIcon,
	CheckIcon,
	KeyboardAvoidingView,
	Radio,
} from 'native-base'

const StreamModal = ({ asyncCallback, isOpen, setIsOpen }) => {
	const { streamTitle, setStreamTitle, defaultStream } = useGlobalContext()

	const { theme } = useGlobalContext()
	let activeColors = theme.colors[theme.mode]

	const handleClose = () => {
		setIsOpen(false)
	}
	const handleSubmit = () => {
		asyncCallback()
		setIsOpen(false)
	}

	const handleTitle = (text) => setStreamTitle(text)

	return (
        <KeyboardAvoidingView style={{ flex: 1, zIndex: 999 }}>
            <Center>
				<Modal
					isOpen={isOpen}
					onClose={() => setIsOpen(false)}
					_backdrop={{
						_dark: {
							bg: activeColors.secondary,
						},
						bg: activeColors.primary,
					}}
					avoidKeyboard
					justifyContent='center'
					alignItems='center'
					size='lg'
				>
					<Modal.Content
						maxWidth='350'
						maxH='212'
					>
						<Modal.CloseButton onPress={() => handleClose()} />
						<Modal.Header>Stream Settings</Modal.Header>
						<Modal.Body>
							<FormControl>
								<FormControl.Label>
									Stream Title
								</FormControl.Label>
								<Input
									value={streamTitle}
									placeholder={streamTitle}
									isRequired={true}
									onChangeText={handleTitle}
								/>
							</FormControl>
						</Modal.Body>
						<Modal.Footer>
							<Button.Group space={2}>
								<Button
									colorScheme='primary'
									onPress={() => handleSubmit()}
								>
									Submit
								</Button>
							</Button.Group>
						</Modal.Footer>
					</Modal.Content>
				</Modal>
			</Center>
        </KeyboardAvoidingView>
    );
}

export default StreamModal
