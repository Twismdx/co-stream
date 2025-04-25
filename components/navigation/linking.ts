import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['com.costream://'],
  config: {
    screens: {
      Login:          'login',
      Register:       'register',
      MainTabs:       'tabs',
      Home:           'home',
      Timer:          'timer',
      Settings:       'settings',
      'GoLive':      'go-live',
      PinCode:        'pin-code',
      SearchModal:    'search',
      Profile:        'profile',
      MatchHistory:   'match-history',
      ChallengeMatch: 'challenge-match',
      PendingMatches: 'pending-matches',
    },
  },
};
