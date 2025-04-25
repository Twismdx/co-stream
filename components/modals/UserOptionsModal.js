import React from 'react'
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native'

const UserOptionsModal = ({ visible, onClose, user, onSendFriendRequest, onMessage, onRequestChallenge }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{user.full_name}</Text>
                    <TouchableOpacity style={styles.modalButton} onPress={onSendFriendRequest}>
                        <Text style={styles.modalButtonText}>Send Friend Request</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalButton} onPress={onMessage}>
                        <Text style={styles.modalButtonText}>Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalButton} onPress={onRequestChallenge}>
                        <Text style={styles.modalButtonText}>Request Challenge Match</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalButton} onPress={onClose}>
                        <Text style={styles.modalButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 10,
    },
    modalButton: {
        width: '100%',
        padding: 10,
        backgroundColor: '#D98FEE',
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
    },
})

export default UserOptionsModal