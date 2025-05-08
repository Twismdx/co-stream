// components/modals/ChallengeSheet.tsx
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react'
import { View, StyleSheet } from 'react-native'
import BottomSheet, {
    BottomSheetModal,
    BottomSheetHandleProps,
    useBottomSheetModal,
} from '@gorhom/bottom-sheet'
import { useNavigation } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { useGlobalContext } from '~/components/timer/context'
import { supabase } from '~/components/utils/supabase'
import { Separator } from '~/components/ui/separator'
import { HeaderHandle } from './HeaderHandle'
import * as Clipboard from 'expo-clipboard';
import {
    MainSheetContent,
    BreakFirstContent,
    DestinationSelectionContent,
    StreamTitleContent,
    MatchPinContent,
    QRCodeContent,
} from './SheetContents'

type RootStackParamList = {
    navigate: any;
    Login: any;
    Register: any;
    MainTabs: any;
    Home: any;
    Timer: any;
    Settings: any;
    GoLive: any;
    PinCode: any;
    SearchModal: any;
    Profile: any;
    MatchHistory: any;
    ChallengeMatch: any;
    PendingMatches: any;
};

const ChallengeSheet = forwardRef((_, ref) => {
    const { isLoading, setIsLoading, theme, actionSheet, setActionSheet, setMatchData, samplePages, sampleGroups, desc, setDesc, streamTitle, setStreamTitle, matchData, destination, setDestination, } =
        useGlobalContext()
    const colors = theme.colors[theme.mode]
    const navigation = useNavigation<any>()
    const { dismissAll } = useBottomSheetModal()

    const modalA = useRef<BottomSheetModal>(null)
    const modalB = useRef<BottomSheetModal>(null)
    const modalC = useRef<BottomSheetModal>(null)
    const modalD = useRef<BottomSheetModal>(null)
    const modalE = useRef<BottomSheetModal>(null)
    const modalF = useRef<BottomSheetModal>(null)

    const [p1, setP1] = useState('')
    const [p2, setP2] = useState('')
    const [firstToBreak, setFirstToBreak] = useState('')
    const [dest, setDest] = useState<'profile' | 'page' | 'group'>('profile')
    const [pagesOrGroups, setPagesOrGroups] = useState<any[]>([])
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [showQR, setShowQR] = useState(false)

    useImperativeHandle(ref, () => ({
        openSetup: () => modalA.current?.present(),
    }))

    useEffect(() => {
        if (!actionSheet.challengeId) return
            ; (async () => {
                const { data, error } = await supabase
                    .from('challenges')
                    .select('owner,opponent')
                    .eq('challengeid', actionSheet.challengeId)
                    .single()
                if (data) {
                    setP1(data.owner)
                    setP2(data.opponent)
                }
            })()
    }, [actionSheet.challengeId])

    const psLink = useMemo(
        () => `https://www.poolstat.net.au/${actionSheet.orgCode}`,
        [actionSheet.orgCode]
    )

    const present = useCallback((m: React.RefObject<any>) => m.current?.present(), [])
    const dismiss = useCallback((m: React.RefObject<any>) => m.current?.dismiss(), [])
    const expandQR = useCallback(() => {
        dismissAll();
        setShowQR(true)
        modalF.current?.present()
    }, [])

    const onStream = () => present(modalB)
    const onReferee = () => {
        dismiss(modalA)
        navigation.navigate('PinCode', {
            challengeId: actionSheet.challengeId,
            pin: actionSheet.matchPin,
        })
    }
    const onPoolstat = () => Linking.openURL(psLink)

    const onNextBreak = async () => {
        await supabase
            .from('challenges')
            .update({ firsttobreak: firstToBreak })
            .eq('challengeid', actionSheet.challengeId)
        present(modalC)
    }

    const onSubmitStream = async () => {
        await setMatchData({
            challengeId: actionSheet.challengeId,
            pin: actionSheet.matchPin,
            title: streamTitle,
            local: !!actionSheet.local,
            description: desc,
            destination: dest,
            targetId: selectedItem?.id,
        })
        await setActionSheet({})
        modalE.current?.dismiss();
        navigation.navigate('GoLive')
        setIsLoading(true)
    }

    const copyToClipboard = async (copyText: any) => {
        await Clipboard.setStringAsync(copyText);
    };

    const onCopyPin = (text: any) => {
        copyToClipboard(text)
    }

    const onCloseQR = async () => {
        await setMatchData({
            matchId: actionSheet.matchId,
            compId: actionSheet.compId,
            pin: actionSheet.matchPin,
            title: streamTitle,
            local: !!actionSheet.local,
            description: desc,
            destination: dest,
            targetId: selectedItem?.id,
        })
        await setActionSheet({})
        await setShowQR(false)
        modalF.current?.dismiss()
        navigation.navigate('GoLive')
        setIsLoading(true)
    }

    const renderHeader = useCallback(
        (title: string, onClose: () => void, onBack?: () => void) =>
            (props: BottomSheetHandleProps) => (
                <HeaderHandle
                    {...props}
                    onClose={onClose}
                    onBack={onBack}
                    showBack={!!onBack}
                    colors={colors}
                >
                    {title}
                </HeaderHandle>
            ),
        [colors]
    )

    const snapPointsD = useMemo(() => ['50%', '80%'], [])

    return (
        <View style={styles.wrapper}>
            {/* A: Match Setup */}
            <BottomSheetModal
                ref={modalA}
                snapPoints={['40%']}
                enableDynamicSizing={false}
                backgroundStyle={{

                    backgroundColor: colors.secondary,
                    borderColor: colors.modalBorder,
                    borderRadius: 30,
                    borderWidth: 1.5,
                }}
                handleIndicatorStyle={{ backgroundColor: colors.foreground }}
                handleComponent={renderHeader(
                    'Match Setup',
                    () => dismiss(modalA),
                )}
            >
                <MainSheetContent
                    onStream={onStream}
                    onReferee={onReferee}
                    onPoolstat={onPoolstat}
                    textColor={colors.modalText}
                />
            </BottomSheetModal>

            {/* B: First to break */}
            <BottomSheetModal
                ref={modalB}
                snapPoints={['45%']}
                enableDynamicSizing={false}
                backgroundStyle={{

                    backgroundColor: colors.secondary,
                    borderColor: colors.modalBorder,
                    borderRadius: 30,
                    borderWidth: 1.5,
                }}
                handleIndicatorStyle={{ backgroundColor: colors.foreground }}
                handleComponent={renderHeader(
                    'Select first to break',
                    () => dismiss(modalB),
                    () => present(modalA),
                )}
            >
                <BreakFirstContent
                    options={[
                        { id: p1, label: actionSheet.owner },
                        { id: p2, label: actionSheet.opponent },
                    ]}
                    selected={firstToBreak}
                    onSelect={setFirstToBreak}
                    onNext={onNextBreak}
                    accentColor={colors.accent}
                />
            </BottomSheetModal>

            {/* C: Share To */}
            <BottomSheetModal
                ref={modalC}
                snapPoints={['55%']}
                enableDynamicSizing={false}
                backgroundStyle={{

                    backgroundColor: colors.secondary,
                    borderColor: colors.modalBorder,
                    borderRadius: 30,
                    borderWidth: 1.5,
                }}
                handleIndicatorStyle={{ backgroundColor: colors.foreground }}
                handleComponent={renderHeader(
                    'Share To',
                    () => dismiss(modalC),
                    () => present(modalB),
                )}
            >
                <DestinationSelectionContent
                    selected={dest}
                    onSelectDest={d => {
                        setDest(d)
                        if (d === 'page') setPagesOrGroups(samplePages)
                        else if (d === 'group') setPagesOrGroups(sampleGroups)
                        else {
                            setPagesOrGroups([])
                            setSelectedItem(null)
                        }
                    }}
                    listData={pagesOrGroups}
                    selectedItem={selectedItem}
                    onSelectItem={setSelectedItem}
                    onNext={() => present(modalD)}
                    colors={colors}
                />
            </BottomSheetModal>

            {/* D: Title & Description */}
            <BottomSheetModal
                ref={modalD}
                snapPoints={snapPointsD}
                enableDynamicSizing={false}
                backgroundStyle={{

                    backgroundColor: colors.secondary,
                    borderColor: colors.modalBorder,
                    borderRadius: 30,
                    borderWidth: 1.5,
                }}
                handleIndicatorStyle={{ backgroundColor: colors.foreground }}
                handleComponent={renderHeader(
                    'Title & Description',
                    () => dismiss(modalD),
                    () => present(modalC),
                )}
                children={<StreamTitleContent
                    title={streamTitle}
                    description={desc}
                    onChangeTitle={setStreamTitle}
                    onChangeDescription={setDesc}
                    onNext={() => present(modalE)}
                    colors={colors}
                />}
            />

            {/* E: Match Pin */}
            <BottomSheetModal
                ref={modalE}
                snapPoints={['52%']}
                enableDynamicSizing={false}
                backgroundStyle={{

                    backgroundColor: colors.secondary,
                    borderColor: colors.modalBorder,
                    borderRadius: 30,
                    borderWidth: 1.5,
                }}
                handleIndicatorStyle={{ backgroundColor: colors.foreground }}
                handleComponent={renderHeader(
                    'Match Pin',
                    () => dismiss(modalE),
                    () => present(modalD),
                )}
            >
                <MatchPinContent
                    pin={actionSheet.matchPin}
                    onCopy={() => onCopyPin(actionSheet.matchPin)}
                    onQR={expandQR}
                    onSubmit={onSubmitStream}
                    colors={colors}
                />
            </BottomSheetModal>

            {/* F: QR Code (detached) */}
            {/* {showQR && ( */}
            <BottomSheetModal
                ref={modalF}
                detached
                snapPoints={['75%']}
                bottomInset={150}
                enablePanDownToClose
                handleIndicatorStyle={{ backgroundColor: colors.foreground }}
                backgroundStyle={{
                    backgroundColor: colors.secondary,
                    borderColor: colors.modalBorder,
                    borderWidth: 1.5,
                }}
                style={styles.qrSheet}
            >
                <QRCodeContent
                    qrValue={`com.costream://MainTabs/Home?pin=true&challengeId=${actionSheet.challengeId}`}
                    onClose={onCloseQR}
                    colors={colors}
                />
            </BottomSheetModal>
            {/* )} */}
        </View>
    )
})

export default ChallengeSheet

const styles = StyleSheet.create({
    wrapper: { paddingHorizontal: 24 },
    qrSheet: {
        marginHorizontal: 25,
        flex: 1,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 24,
    },
})
