import {useEffect} from 'react'
import * as Linking from 'expo-linking'

export function useDeepLinkListener(handleUrl) {
	useEffect(() => {
		const subscription = Linking.addEventListener('url', ({url}) => {
			handleUrl(url)
		})
		return () => {
			subscription.remove()
		}
	}, [handleUrl])
}
