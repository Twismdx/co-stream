import React, { memo } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, StyleProp,
    ViewStyle,
} from 'react-native';
import {
    BottomSheetHandle,
    BottomSheetHandleProps,
    useBottomSheetModal,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

interface Props extends BottomSheetHandleProps {
    children?: string | React.ReactNode;
    onClose: () => void;
    onBack?: () => void;
    showBack?: boolean;
    colors: any;
    style?: StyleProp<ViewStyle>;
    indicatorStyle?: StyleProp<ViewStyle>;
}

const HeaderHandleComponent = ({
    children,
    onClose,
    onBack,
    showBack = false,
    colors,
    style,
    indicatorStyle,
    ...rest
}: Props) => {
    const { dismissAll } = useBottomSheetModal()

    return (
        <BottomSheetHandle
            style={[styles.handle, style]}
            indicatorStyle={[styles.indicator, { backgroundColor: colors.foreground }, indicatorStyle]}
            {...rest}
        >
            <View style={styles.row}>
                {showBack ? (
                    <TouchableOpacity onPress={onBack!}>
                        <Ionicons name="arrow-back-sharp" size={24} color='white' />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 24 }} />
                )}
                <Text style={[styles.title, { color: colors.foreground }]}>{children}</Text>
                <TouchableOpacity onPress={dismissAll}>
                    <Ionicons name="close-sharp" size={28} color={colors.error} />
                </TouchableOpacity>
            </View>
        </BottomSheetHandle>
    )
}

const styles = StyleSheet.create({
    handle: {
        paddingBottom: 0,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.075)',
        zIndex: 99999,
    },
    indicator: { height: 4, opacity: 0.8 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontSize: 20, fontWeight: 'bold', paddingTop: 12 },
});

export const HeaderHandle = memo(HeaderHandleComponent);
