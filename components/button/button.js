import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

const Button = ({ title, type = 'default', onPress }) => {
    return (
        <TouchableOpacity style={styles[type].container} onPress={onPress}>
            <Text style={styles[type].title}>{title}</Text>
        </TouchableOpacity>
    );
}

export default Button

const styles = StyleSheet.create({
    default: StyleSheet.create({
        container: {
            backgroundColor: '#039be5',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 5,
            borderRadius: 31.5,
        },
        title: {
            color: '#FFFFFF',
        },
    }),

    circle: StyleSheet.create({
        container: {
            backgroundColor: '#039be5',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8,
            borderRadius: 50,
            margin: 5,
        },
        title: {
            color: '#FFFFFF',
            fontSize: 20,
        },
    }),
})