// HomeScreen.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  StyleSheet,
  Button,
  Dimensions
} from 'react-native'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useNavigation } from '@react-navigation/native'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useGlobalContext } from '~/components/timer/context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CategoryTabSection from '~/components/sections/CategoryTabSection'
import ChallengeSheet from '~/components/modals/ChallengeSheet'
import PoolstatSheet, { PoolstatSheetHandle } from '~/components/modals/PoolstatSheet'
import StyledText from '~/components/texts/StyledText'
import axios from 'axios'
import { setItem, getItem } from '~/components/utils/AsyncStorage'
import { supabase } from '~/components/utils/supabase'
import { TourGuideZoneByPosition } from 'rn-tourguide'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

const HomeScreen: React.FC = () => {
  const {
    theme,
    setSelectedOrg,
    selectedOrg,
    user,
    liveUrls,
    setUrl,
    setIsLoading,
    actionSheet,
    setActionSheet,
    openSearchModal,
    selectedUser,
  } = useGlobalContext()

  const activeColors = theme.colors[theme.mode]
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<any[]>([])
  const [matchData, setMatchData] = useState<any[]>([])
  const navigation = useNavigation()
  const poolstatRef = useRef<PoolstatSheetHandle>(null)
  const challengeRef = useRef<{ openSetup: () => void }>(null)

  const openPoolstat = () => poolstatRef.current?.openPoolstatA()
  const openChallenge = () => challengeRef.current?.openSetup()

  useEffect(() => {
    if (!actionSheet.matchId) return
    
    const getPinWithRetry = async (retryDelay = 1000, maxRetries = 5) => {
      let attempt = 0;
      while (attempt < maxRetries) {
        const { data, error } = await supabase
          .from('poolstat_match_pins')
          .select('pin')
          .eq('matchid', actionSheet.matchId)
          .single()
          
        if (!error && data?.pin) {
          return data.pin;
        }
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // Exponential backoff
        attempt++;
      }
      return null;
    };

    const createPin = async () => {
      try {
        // Try to insert new pin
        await supabase
          .from('poolstat_match_pins')
          .insert([
            { matchid: actionSheet.matchId, compid: actionSheet.compId }
          ])
      } catch (error) {
        // Ignore 409 conflict errors - pin already exists
        console.log('Pin creation error or conflict:', error);
      }

      // Start polling for pin with exponential backoff
      const pin = await getPinWithRetry();
      if (pin) {
        setActionSheet((prev: any) => ({ ...prev, matchPin: pin }));
      } else {
        setActionSheet((prev: any) => ({ ...prev, matchPin: 'Failed to load' }));
      }
    }
    createPin()
  }, [actionSheet.matchId])

  useEffect(() => {
    console.log(actionSheet)
  }, [actionSheet])

  const mergeNames = useCallback(async (chs: any[]) => {
    const ids = [...new Set(chs.flatMap(c => [c.owner, c.opponent]))]
    const { data: users } = await supabase
      .from('users')
      .select('id,name')
      .in('id', ids)
    const map = Object.fromEntries(users!.map(u => [u.id, u.name]))
    return chs.map(c => ({
      ...c,
      owner_full: map[c.owner] ?? 'N/A',
      opponent_full: map[c.opponent] ?? 'N/A',
    }))
  }, [])

  const getChallenges = useCallback(async () => {
    if (!user?.id) return
    const startUTC = dayjs().startOf('day').utc().toISOString()
    const endUTC = dayjs().endOf('day').utc().toISOString()
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .gte('date', startUTC)
      .lte('date', endUTC)
      .or(`owner.eq.${user.id},opponent.eq.${user.id}`)
    if (data) {
      const merged = await mergeNames(data)
      console.log(data)
      console.log(merged)
      setMatchData(merged)
    }
  }, [user?.id, mergeNames])

  useEffect(() => {
    if (user) setIsLoading(false)
  }, [user, setIsLoading])

  useEffect(() => {
    const init = async () => {
      setUrl(liveUrls.compsURL)
      const org = await getItem('@selectedOrg')
      if (org) setSelectedOrg(org)
    }
    init()
  }, [liveUrls.compsURL, setUrl, setSelectedOrg])

  const fetchStats = useCallback(async () => {
    if (!selectedOrg) return
    try {
      const res = await axios.post(liveUrls.compsURL, { orgid: selectedOrg })
      setStats(res.data)
    } catch { }
  }, [selectedOrg, liveUrls.compsURL])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchStats()
    await getChallenges()
    setRefreshing(false)
  }, [fetchStats, getChallenges])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    getChallenges()
  }, [getChallenges])

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <TourGuideZoneByPosition
        zone={1}
        isTourGuide
        text={"Welcome to Co-Stream!  Let's take a quick tour of the main features."}
        shape={"rectangle"}
        bottom={0}
        left={0}
        width={screenWidth}
        height={screenHeight}
      />
      <ScrollView
        style={{ backgroundColor: activeColors.primary, flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.categoryContainer}>
          <CategoryTabSection
            openPoolstatA={openPoolstat}
            openChallengeA={openChallenge}
            stats={stats}
            challengeData={matchData}
            selectedOrg={selectedOrg}
          />
        </View>
      </ScrollView>
      <PoolstatSheet ref={poolstatRef} />
      <ChallengeSheet ref={challengeRef} />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  inputContainer: {
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  centerText: {
    marginVertical: 15,
    textAlign: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginTop: 15,
    paddingHorizontal: 10,
  },
})

export default HomeScreen
