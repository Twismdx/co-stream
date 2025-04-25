import * as React from 'react';
import { Pressable, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast, { ToastConfig } from 'react-native-toast-message';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useGlobalContext } from '~/components/timer/context';

/**
 * Temporary fix for warning when accessing useLayoutEffect on the server.
 */
if (typeof document === 'undefined') {
  // @ts-ignore
  React.useLayoutEffect = React.useEffect;
}

/**
 * Toast configuration replacing className styling with theme values.
 */
const TOAST_CONFIG: ToastConfig = {
  success: ({ text1, text2, onPress }) => {
    const { theme } = useGlobalContext();
    const colors = theme.colors[theme.mode];
    const configuredActiveColors = {
      background: colors.bottomsheet,
      border: colors.success,
      titleColor: colors.success,
      descriptionColor: colors.onPrimary,
    };

    return (
      <Pressable
        onPress={onPress}
        style={{
          width: '100%',
          maxWidth: theme.maxWidth ?? 576,
          paddingHorizontal: theme.spacing?.px6 ?? 24,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: configuredActiveColors.background,
            borderWidth: 1,
            borderColor: configuredActiveColors.border,
            borderRadius: 8,
            padding: 12,
          }}
        >
          <Ionicons name="checkbox-outline" size={24} color={colors.success} />
          <View style={{ marginLeft: 8 }}>
            <Text style={{ color: configuredActiveColors.titleColor, fontWeight: 'bold' }}>
              {text1}
            </Text>
            <Text
              style={{ color: configuredActiveColors.descriptionColor, marginTop: 4 }}
            >
              {text2}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  },
  error: ({ text1, text2, onPress }) => {
    const { theme } = useGlobalContext();
    const colors = theme.colors[theme.mode];
    const configuredActiveColors = {
      background: colors.bottomsheet,
      border: colors.error,
      titleColor: colors.error,
      descriptionColor: colors.onPrimary,
    };

    return (
      <Pressable
        onPress={onPress}
        style={{
          width: '100%',
          maxWidth: theme.maxWidth ?? 576,
          paddingHorizontal: theme.spacing?.px6 ?? 24,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: configuredActiveColors.background,
            borderWidth: 1,
            borderColor: configuredActiveColors.border,
            borderRadius: 8,
            padding: 12,
          }}
        >
          <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
          <View style={{ marginLeft: 8 }}>
            <Text style={{ color: configuredActiveColors.titleColor, fontWeight: 'bold' }}>
              {text1}
            </Text>
            <Text
              style={{ color: configuredActiveColors.descriptionColor, marginTop: 4 }}
            >
              {text2}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  },
  base: ({ text1, text2, onPress }) => {
    const { theme } = useGlobalContext();
    const colors = theme.colors[theme.mode];
    const configuredActiveColors = {
      background: colors.bottomsheet,
      border: colors.success,
      titleColor: colors.success,
      descriptionColor: colors.onPrimary,
    };

    return (
      <Pressable
        onPress={onPress}
        style={{
          width: '100%',
          maxWidth: theme.maxWidth ?? 576,
          paddingHorizontal: theme.spacing?.px6 ?? 24,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: configuredActiveColors.background,
            borderWidth: 1,
            borderColor: configuredActiveColors.border,
            borderRadius: 8,
            padding: 12,
          }}
        >
          <Ionicons name="information-circle-outline" size={24} color={colors.success} />
          <View style={{ marginLeft: 8 }}>
            <Text style={{ color: configuredActiveColors.titleColor, fontWeight: 'bold' }}>
              {text1}
            </Text>
            <Text
              style={{ color: configuredActiveColors.descriptionColor, marginTop: 4 }}
            >
              {text2}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  },
};

/**
 * Toast Provider
 */
function ToastProvider() {
  const insets = useSafeAreaInsets();
  return <Toast config={TOAST_CONFIG} topOffset={36} bottomOffset={insets.bottom} />;
}

export { ToastProvider };
export default Toast;