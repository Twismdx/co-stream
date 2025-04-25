import React, {useState} from 'react'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {Ionicons} from '@expo/vector-icons'
import {useGlobalContext} from './timer/context'
import HomeScreen from '../screens/HomeScreen'
import TimerScreen from '../screens/TimerScreen'
import SettingsScreen from '../screens/SettingsScreen'
import CreateComp from './CreateComp'
import ProfileScreen from '../screens/ProfileScreen'

const Tab = createBottomTabNavigator()

export default function Footer({navigation}) {
	const {theme, setDrawerOpen, drawerOpen} = useGlobalContext()
	let activeColors = theme.colors[theme.mode]
	const [isDisabled, setIsDisabled] = useState(true)

	return (
		<Tab.Navigator
			screenOptions={({route}) => ({
				tabBarStyle: {
					backgroundColor: activeColors.secondary,
				},
				headerShown: false,
				tabBarIcon: ({focused, color}) => {
					let iconName
					if (route.name === 'Home') {
						iconName = focused ? 'home' : 'home-outline'
					} else if (route.name === 'Settings') {
						iconName = focused ? 'settings' : 'settings-outline'
					} else if (route.name === 'Timer') {
						iconName = focused ? 'stopwatch' : 'stopwatch-outline'
					} else if (route.name === 'Profile') {
						iconName = focused ? 'person-circle' : 'person-circle-outline'
					} else if (route.name === 'Create Comp') {
						iconName = focused ? 'menu' : 'menu-outline'
					}

					return <Ionicons name={iconName} size={24} color={color} />
				},
				tabBarActiveTintColor: activeColors.accent,
				tabBarInactiveTintColor: activeColors.onPrimary,
				headerTitleAlign: 'left',
				headerTitleStyle: {
					paddingLeft: 10,
					fontSize: 24,
				},
				headerStyle: {
					backgroundColor: activeColors.secondary,
				},
				headerTintColor: activeColors.tint,
			})}>
			<Tab.Screen name="Home" component={HomeScreen} />
			<Tab.Screen name="Profile" component={ProfileScreen} />
			{isDisabled ? null : <Tab.Screen name="Create Comp" component={CreateComp} />}
			<Tab.Screen name="Timer" component={TimerScreen} />
			<Tab.Screen name="Settings" component={SettingsScreen} />
		</Tab.Navigator>
	)
}
