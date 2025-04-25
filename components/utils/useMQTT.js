// useMQTT.js
import {useState, useEffect} from 'react'
import * as mqtt from 'mqtt/dist/mqtt'
import {Buffer} from 'buffer'
import process from 'process'
global.Buffer = global.Buffer || Buffer
global.process = process

const useMQTT = (brokerUrl, topics = []) => {
	const [client, setClient] = useState(null)
	const [messages, setMessages] = useState([])

	useEffect(() => {
		// Connect to the MQTT broker
		const mqttClient = mqtt.connect(brokerUrl)

		mqttClient.on('connect', () => {
			console.log('Connected to MQTT broker')
			// Subscribe to each provided topic
			topics.forEach((topic) => {
				mqttClient.subscribe(topic, (err) => {
					if (err) {
						console.error(`Subscription error for topic ${topic}:`, err)
					} else {
						console.log(`Subscribed to topic: ${topic}`)
					}
				})
			})
		})

		mqttClient.on('message', (topic, message) => {
			const text = message.toString()
			setMessages((prev) => [...prev, {topic, text}])
		})

		setClient(mqttClient)

		// Clean up on unmount
		return () => {
			if (mqttClient) mqttClient.end()
		}
	}, [brokerUrl, topics])

	const publishMessage = (topic, message) => {
		if (client) {
			client.publish(topic, message)
		}
	}

	return {messages, publishMessage}
}

export default useMQTT
