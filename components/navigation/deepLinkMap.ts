// src/navigation/deepLinkMap.ts
import { RootStackParamList } from './types';

export const deepLinkMap: Record<keyof RootStackParamList, string> = {
  Login:         'com.costream://Login',
  Register:      'com.costream://Register',
  MainTabs:      'com.costream://MainTabs',
  Home:          'com.costream://Home',
  Timer:         'com.costream://Timer',
  Settings:      'com.costream://Settings',
  'GoLive':     'com.costream://go-live',
  PinCode:       'com.costream://PinCode',
  SearchModal:   'com.costream://SearchModal',
  Profile:       'com.costream://Profile',
  MatchHistory:  'com.costream://MatchHistory',
  ChallengeMatch:'com.costream://ChallengeMatch',
  PendingMatches:'com.costream://PendingMatches',
};
