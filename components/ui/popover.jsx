import * as PopoverPrimitive from '@rn-primitives/popover';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useGlobalContext } from '../timer/context';
// Removed: import { TextClassContext } from '~/components/ui/text';

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef((props, ref) => {
  const { theme } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];

  const { align = 'center', sideOffset = 4, portalHost, style, ...rest } = props;

  // Inline style approximating the original Tailwind classes
  const contentStyle = {
    zIndex: 50,
    width: 288, // approx 72 * 4 (Tailwind 'w-72')
    borderRadius: 8, // rounded-md
    borderWidth: 1,
    borderColor: activeColors.border,
    backgroundColor: activeColors.popover,
    padding: 16, // p-4 -> 16px
    shadowColor: activeColors.foreground,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  };

  return (
    <PopoverPrimitive.Portal hostName={portalHost}>
      <PopoverPrimitive.Overlay
        style={Platform.OS !== 'web' ? StyleSheet.absoluteFill : undefined}
      >
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut}>
          {/*
           * TextClassContext.Provider removed.
           * Pass text styling down directly or via your own context if needed.
           */}
          <PopoverPrimitive.Content
            ref={ref}
            align={align}
            sideOffset={sideOffset}
            style={[contentStyle, style]}
            {...rest}
          />
        </Animated.View>
      </PopoverPrimitive.Overlay>
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = 'PopoverContent';

export { Popover, PopoverContent, PopoverTrigger };