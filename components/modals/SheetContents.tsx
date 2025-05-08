import React, { FC, useCallback } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    TextInput,
    StyleSheet,
} from 'react-native'
import { BottomSheetView, BottomSheetFlatList } from '@gorhom/bottom-sheet'
import QRCode from 'react-native-qrcode-svg'
import CustomButton from '~/components/CustomButton'
import { Separator } from '~/components/ui/separator'
import { useFocusEffect } from '@react-navigation/native'

type Dest = 'profile' | 'page' | 'group'
interface DestItem { id: string; name: string }

const keyExtractor = (item: DestItem, index: number) => `${item.name}.${index}`
const handleGetItem = (data: DestItem[], index: number) => data[index]
const handleGetCount = (data: DestItem[]) => data.length

export const MainSheetContent: FC<{
    onStream(): void
    onReferee(): void
    onPoolstat(): void
    textColor: string
}> = ({ onStream, onReferee, onPoolstat, textColor }) => (
    <BottomSheetView style={styles.container}>
        <Separator />
        <TouchableOpacity onPress={onStream} style={styles.item}>
            <Text style={[styles.text, { color: textColor }]}>Stream this match</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onReferee} style={styles.item}>
            <Text style={[styles.text, { color: textColor }]}>Referee this match</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPoolstat} style={styles.item}>
            <Text style={[styles.text, { color: textColor }]}>View on poolstat</Text>
        </TouchableOpacity>
    </BottomSheetView>
)

export const BreakFirstContent: FC<{
    options: { id: string; label: string }[]
    selected: string
    onSelect(id: string): void
    onNext(): void
    accentColor: string
}> = ({ options, selected, onSelect, onNext, accentColor }) => (
    <BottomSheetView style={styles.container}>
        <Separator />
        <View style={styles.options}>
            {options.map(opt => (
                <TouchableOpacity
                    key={opt.id}
                    onPress={() => onSelect(opt.id)}
                    style={[
                        styles.option,
                        selected === opt.id && { backgroundColor: accentColor },
                    ]}
                >
                    <Text style={[styles.optionText, { color: 'white' }]}>{opt.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
        <CustomButton
            label="Next"
            onPress={onNext}
            style={{}}
            textStyle={{}}
            accessibilityLabel="Next"
            accessibilityHint="Proceed to the next step"
            children={null}
        />
    </BottomSheetView>
)

export const DestinationSelectionContent: FC<{
    selected: Dest
    onSelectDest: (d: Dest) => void
    listData: DestItem[]
    selectedItem: DestItem | null
    onSelectItem: (i: DestItem) => void
    onNext: () => void
    colors: { accent: string; border: string; onPrimary: string }
}> = ({
    selected,
    onSelectDest,
    listData,
    selectedItem,
    onSelectItem,
    onNext,
    colors,
}) => {
        const renderDestItem = useCallback(
            ({ item }: { item: DestItem }) => (
                <TouchableOpacity
                    onPress={() => onSelectItem(item)}
                    style={[
                        styles.listItem,
                        item.id === selectedItem?.id && { backgroundColor: colors.accent },
                    ]}
                >
                    <Text style={{ color: colors.onPrimary }}>{item.name}</Text>
                </TouchableOpacity>
            ),
            [onSelectItem, selectedItem, colors]
        )

        return (
            <BottomSheetView style={styles.container}>
                <Separator />

                {/* Destination buttons */}
                <View style={styles.destButtonsContainer}>
                    {(['profile', 'page', 'group'] as Dest[]).map(d => (
                        <TouchableOpacity
                            key={d}
                            onPress={() => onSelectDest(d)}
                            style={[
                                styles.destButton,
                                { backgroundColor: selected === d ? colors.accent : colors.border },
                            ]}
                        >
                            <Text style={[styles.destText, { color: colors.onPrimary }]}>
                                {d}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* PAGED OR GROUP LIST */}
                {(selected === 'page' || selected === 'group') && (
                    <BottomSheetFlatList
                        data={listData}
                        keyExtractor={keyExtractor}
                        renderItem={renderDestItem}
                        contentContainerStyle={styles.listContainer}
                        initialNumToRender={5}
                        bounces={true}
                        windowSize={10}
                        maxToRenderPerBatch={5}
                        keyboardDismissMode="interactive"
                        indicatorStyle="white"
                        focusHook={useFocusEffect}
                    />
                )}

                {/* Next button */}
                <CustomButton
                    label="Next"
                    onPress={onNext}
                    style={styles.nextButton}
                    textStyle={{}}
                    accessibilityLabel="Next"
                    accessibilityHint="Proceed to next step"
                    children={null}
                />
            </BottomSheetView>
        )
    }

export const StreamTitleContent: FC<{
    title: string
    description: string
    onChangeTitle(t: string): void
    onChangeDescription(d: string): void
    onNext(): void
    colors: any
}> = ({
    title,
    description,
    onChangeTitle,
    onChangeDescription,
    onNext,
    colors,
}) => (
        <BottomSheetView style={[styles.container, { gap: 6 }]}>
            <Separator />
            <Text style={[styles.label, { color: colors.onPrimary }]}>Stream Title</Text>
            <TextInput
                value={title}
                onChangeText={onChangeTitle}
                style={[
                    styles.input,
                    { borderColor: colors.border, backgroundColor: colors.foreground },
                ]}
            />
            <Text
                style={[styles.label, { color: colors.onPrimary, marginTop: 12 }]}
            >
                Description
            </Text>
            <TextInput
                value={description}
                onChangeText={onChangeDescription}
                style={[
                    styles.input,
                    { borderColor: colors.border, backgroundColor: colors.foreground },
                ]}
            />
            <CustomButton
                label="Next"
                onPress={onNext}
                style={{ marginTop: 26 }}
                textStyle={{}}
                accessibilityLabel="Next"
                accessibilityHint="Proceed to next screen"
                children={null}
            />
        </BottomSheetView>
    )

export const MatchPinContent: FC<{
    pin: string
    onCopy(): void
    onQR(): void
    onSubmit(): void
    colors: any
}> = ({ pin, onCopy, onQR, onSubmit, colors }) => (
    <BottomSheetView style={[styles.container, { gap: 6 }]}>
        <Separator />
        <Text style={[styles.hint, { color: colors.foreground }]}>
            Invite a user… or share the pin:
        </Text>
        <TouchableOpacity onPress={onCopy}>
            <Text style={[styles.pin, { color: colors.foreground }]}>{pin}</Text>
            <Text style={[styles.tapHint, { color: colors.foreground }]}>
                Tap to copy!
            </Text>
        </TouchableOpacity>
        <View style={styles.containerB}>
            <View style={styles.row}>
                <View style={styles.sideButtonWrapper}>
                    <CustomButton
                        label="Invite"
                        disabled
                        style={{}}
                        onPress={null}
                        textStyle={{}}
                        accessibilityLabel="Invite"
                        accessibilityHint="Invite referee (disabled)"
                        children={null}
                    />
                </View>
                <View style={styles.sideButtonWrapper}>
                    <CustomButton
                        label="QR Code"
                        onPress={onQR}
                        style={{}}
                        textStyle={{}}
                        accessibilityLabel="Show QR Code"
                        accessibilityHint="Display QR Code"
                        children={null}
                    />
                </View>
            </View>
            <CustomButton
                label="Submit"
                onPress={onSubmit}
                style={{}}
                textStyle={{}}
                accessibilityLabel="Submit"
                accessibilityHint="Finalize match pin"
                children={null}
            />
        </View>
    </BottomSheetView>
)

export const QRCodeContent: FC<{
    qrValue: string
    onClose(): void
    colors: any
}> = ({ qrValue, onClose, colors }) => (
    <BottomSheetView style={styles.qrContainer}>
        <Text style={[styles.qrTitle, { color: colors.foreground }]}>
            Scan this QR code
        </Text>
        <Separator />
        <View style={styles.qrBox}>
            <QRCode value={qrValue} size={200} color="black" backgroundColor="white" />
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
    </BottomSheetView>
)

const styles = StyleSheet.create({
    container: { paddingHorizontal: 20, gap: 12 },
    item: { paddingVertical: 10 },
    text: { fontSize: 16 },
    options: { alignItems: 'center', marginVertical: 20 },
    option: {
        padding: 10,
        width: '80%',
        alignItems: 'center',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
    },
    optionText: { fontSize: 16, fontWeight: 'bold' },
    destButton: {
        marginVertical: 10,
        marginHorizontal: 50,
        paddingVertical: 10,
        borderRadius: 4,
        alignItems: 'center',
    },
    destText: { fontSize: 16 },
    listItem: {
        paddingVertical: 7,
        paddingHorizontal: 15,
        marginVertical: 4,
        borderRadius: 6,
    },
    label: { fontSize: 16, paddingBottom: 8 },
    input: {
        borderWidth: 1,
        borderRadius: 6,
        padding: 8,
        fontSize: 16,
        textAlign: 'center',
    },
    containerB: {
        width: '100%',
        paddingHorizontal: 20,
    },
    sideButtonWrapper: {
        flex: 0.45, minWidth: 100, marginBottom: -10
    },
    hint: { textAlign: 'center', fontSize: 10, opacity: 0.5 },
    pin: { textAlign: 'center', fontSize: 48, fontWeight: 'bold' },
    tapHint: { textAlign: 'center', fontSize: 10, opacity: 0.5, marginTop: 4 },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 15,
    },
    qrContainer: {
        flex: 1,
        paddingHorizontal: 25,
        gap: 5,
        minHeight: 355,
        maxHeight: 355,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrTitle: { fontSize: 20 },
    qrBox: { marginVertical: 10 },
    closeButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 4,
    },
    closeText: { color: 'white', fontWeight: '600' },
    destButtonsContainer: {
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    nextButton: {
        marginTop: 16,
        alignSelf: 'center',
        paddingHorizontal: 24,
    },
    listContainer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
})