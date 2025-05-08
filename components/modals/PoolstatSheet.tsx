import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react'
import { StyleSheet } from 'react-native'
import BottomSheet, {
  BottomSheetModal,
  BottomSheetHandleProps,
  useBottomSheetModal,
} from '@gorhom/bottom-sheet'
import { useNavigation } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { useGlobalContext } from '~/components/timer/context'
import { HeaderHandle } from './HeaderHandle'
import * as Clipboard from 'expo-clipboard';
import {
  MainSheetContent,
  DestinationSelectionContent,
  StreamTitleContent,
  MatchPinContent,
  QRCodeContent,
} from './PoolstatSheetContents'

interface PoolstatSheetProps {
  navigation: any;
}

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

export type PoolstatSheetHandle = { openPoolstatA: () => void }

const PoolstatSheet = forwardRef<PoolstatSheetHandle>((_props, ref) => {
  const { isLoading, setIsLoading, theme, actionSheet, setActionSheet, setMatchData, samplePages, sampleGroups, desc, setDesc, streamTitle, setStreamTitle, matchData, destination, setDestination, } =
    useGlobalContext()
  const colors = theme.colors[theme.mode]
  const { dismissAll } = useBottomSheetModal()
  const navigation = useNavigation<any>();
  const modalA = useRef<BottomSheetModal>(null)
  const modalC = useRef<BottomSheetModal>(null)
  const modalD = useRef<BottomSheetModal>(null)
  const modalE = useRef<BottomSheetModal>(null)
  const modalF = useRef<BottomSheetModal>(null)

  // expose .openPoolstatA()
  useImperativeHandle(ref, () => ({
    openPoolstatA: () => modalA.current?.present()!,
  }))

  // local state
  const [dest, setDest] = useState<'profile' | 'page' | 'group'>('profile')
  const [list, setList] = useState<any[]>([])
  const [sel, setSel] = useState<any>(null)
  const [showQR, setShowQR] = useState(false)
  // sheet snap points & links
  const snapPointsD = useMemo(() => ['50%', '80%'], [])
  const psLink = useMemo(
    () => `https://www.poolstat.net.au/${actionSheet.orgCode}`,
    [actionSheet.orgCode]
  )

  // helpers to present/dismiss/expand
  const present = useCallback((m: React.RefObject<any>) => m.current?.present(), [])
  const dismiss = useCallback((m: React.RefObject<any>) => m.current?.dismiss(), [])
  const expand = useCallback(() => {
    dismissAll();
    setShowQR(true)
    modalF.current?.present();
  }, [])

  // actions
  const onStream = () => present(modalC)
  const onReferee = () => {
    dismiss(modalA)
    navigation.navigate('PinCode', {
      matchId: actionSheet.matchId,
      pin: actionSheet.matchPin,
    })
  }
  const onPoolstat = () => Linking.openURL(psLink)
  const onSubmit = async () => {
    await setMatchData({
      matchId: actionSheet.matchId,
      compId: actionSheet.compId,
      pin: actionSheet.matchPin,
      title: streamTitle,
      local: !!actionSheet.local,
      description: desc,
      destination: dest,
      targetId: sel?.id,
    })
    await setActionSheet({})
    modalA.current?.dismiss();
    dismissAll();
    navigation.navigate('GoLive')
    setIsLoading(true)
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
      targetId: sel?.id,
    })
    await setActionSheet({})
    await setShowQR(false)
    modalF.current?.dismiss()
    navigation.navigate('GoLive')
    setIsLoading(true)
  }

  const copyToClipboard = async (copyText: any) => {
    await Clipboard.setStringAsync(
      typeof copyText === "string"
        ? copyText
        : typeof copyText === "number"
          ? String(copyText)
          : copyText
            ? JSON.stringify(copyText)
            : "" // Fallback: empty string if null/undefined
    );
  };

  const onCopyPin = (text: any) => {
    copyToClipboard(text)
  }

  // header renderer uses modalTitle + onAccent
  const renderHeader = useCallback(
    (text: string, onClose: () => void, onBack?: () => void) =>
      (props: BottomSheetHandleProps) => (
        <HeaderHandle
          {...props}
          onClose={onClose}
          onBack={onBack}
          showBack={!!onBack}
          colors={colors}
        >
          {text}
        </HeaderHandle>
      ),
    [colors]
  )

  return (
    <>
      {/* Main Sheet */}
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
        handleComponent={renderHeader('Match Setup', () => dismiss(modalA))}
      >
        <MainSheetContent
          onStream={onStream}
          onReferee={onReferee}
          onPoolstat={onPoolstat}
          textColor={colors.modalText}
        />
      </BottomSheetModal>

      {/* Destination Selection */}
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
          () => present(modalA)
        )}
      >
        <DestinationSelectionContent
          selected={dest}
          onSelectDest={d => {
            setDest(d)
            if (d === 'page') setList(samplePages)
            else if (d === 'group') setList(sampleGroups)
            else {
              setList([])
              setSel(null)
            }
          }}
          listData={list}
          selectedItem={sel}
          onSelectItem={setSel}
          onNext={() => present(modalD)}
          colors={colors}
        />
      </BottomSheetModal>

      {/* Title & Description */}
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
          () => present(modalC)
        )}
      >
        <StreamTitleContent
          title={streamTitle}
          description={desc}
          onChangeTitle={setStreamTitle}
          onChangeDescription={setDesc}
          onNext={() => present(modalE)}
          colors={colors}
        />
      </BottomSheetModal>

      {/* Match Pin */}
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
          () => present(modalD)
        )}
      >
        <MatchPinContent
          pin={actionSheet.matchPin}
          onCopy={(pin: string) => onCopyPin(pin)}
          onQR={expand}
          onSubmit={onSubmit}
          colors={colors}
        />
      </BottomSheetModal>

      {/* Detached QR Code */}
      {/* {showQR && ( */}
      <BottomSheetModal
        ref={modalF}
        detached
        snapPoints={['75%']}
        bottomInset={150}
        enablePanDownToClose
        handleIndicatorStyle={{
          backgroundColor: colors.onPrimary,
          marginTop: 10,
          marginBottom: -30
        }}
        backgroundStyle={{
          backgroundColor: colors.secondary,
          borderColor: colors.modalBorder,
          borderWidth: 1.5,
        }}
        style={styles.qrSheet}
      >
        <QRCodeContent
          qrValue={`com.costream://MainTabs/Home?matchId=${actionSheet.matchId}`}
          onClose={onCloseQR}
          colors={colors}
        />
      </BottomSheetModal>
      {/* )} */}
    </>
  )
})

export default PoolstatSheet

const styles = StyleSheet.create({
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
