import * as DropdownMenuPrimitive from '@rn-primitives/dropdown-menu';
import * as React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  type TextProps,
  View,
  type ViewStyle,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useGlobalContext } from '../timer/context';
const darkColors = {
  foreground: '#EDEDED',  // near-white for text/icons
  surface: '#1E1E1E',     // dark background
  border: '#2B2B2B',      // slightly lighter gray for borders
  // ...
};

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  DropdownMenuPrimitive.SubTriggerRef,
  DropdownMenuPrimitive.SubTriggerProps & { inset?: boolean }
>(({ inset, children, ...props }, ref) => {
  const { open } = DropdownMenuPrimitive.useSubContext();

  const activeColors = {
    foreground: '#EDEDED',  // near-white for text/icons
    surface: '#1E1E1E',     // dark background
    border: '#2B2B2B',      // slightly lighter gray for borders
    // ...
  };
  const Icon = Ionicons;
  const iconName =
    Platform.OS === 'web'
      ? 'chevron-forward'
      : open
        ? 'chevron-up'
        : 'chevron-down';

  const triggerStyle: StyleProp<ViewStyle> = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8, // ~px-2
    paddingVertical: Platform.OS === 'web' ? 8 : 10, // emulating py-1.5 / native:py-2
    borderRadius: 4, // rounded-sm
    backgroundColor: open ? darkColors.surface : undefined,
    ...(inset ? { paddingLeft: 32 } : {}),

  };

  return (
    <DropdownMenuPrimitive.SubTrigger ref={ref} style={triggerStyle} {...props}>
      {typeof children === 'function' ? children({ pressed: false }) : children}
      <Icon name={iconName} size={18} style={{ marginLeft: 'auto', color: darkColors.foreground }} />
    </DropdownMenuPrimitive.SubTrigger>
  );
});
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  DropdownMenuPrimitive.SubContentRef,
  DropdownMenuPrimitive.SubContentProps
>(({ style, ...props }, ref) => {

  const darkColors = {
    foreground: '#EDEDED',  // near-white for text/icons
    surface: '#1E1E1E',     // dark background
    border: '#2B2B2B',      // slightly lighter gray for borders
    // ...
  };
  const subContentStyle: StyleProp<ViewStyle> = {
    zIndex: 50,
    minWidth: 128, // 8rem ~ 128px
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 0,
    borderColor: 'transparent',
    marginTop: 4,
    backgroundColor: darkColors.surface,
    padding: 4, // p-1
    paddingLeft: 32,
    shadowColor: 'hsl(240, 5.9%, 90%)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  };
  return (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      style={[subContentStyle, typeof style === 'function' ? style({ pressed: false }) : style]}
      {...props}
    />
  );
});
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  DropdownMenuPrimitive.ContentRef,
  DropdownMenuPrimitive.ContentProps & {
    overlayStyle?: StyleProp<ViewStyle>;
    portalHost?: string;
  }
>(({ overlayStyle, portalHost, style, ...props }, ref) => {

  const darkColors = {
    foreground: '#EDEDED',  // near-white for text/icons
    surface: '#1E1E1E',     // dark background
    border: '#2B2B2B',      // slightly lighter gray for borders
    // ...
  };
  const overlay = Platform.OS !== 'web' ? StyleSheet.absoluteFill : undefined;
  const contentStyle: StyleProp<ViewStyle> = {
    zIndex: 50,
    minWidth: 128,
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: darkColors.surface,
    padding: 16, // increased padding for internal spacing
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  };
  return (
    <DropdownMenuPrimitive.Portal hostName={portalHost}>
      <DropdownMenuPrimitive.Overlay style={StyleSheet.flatten([overlay, overlayStyle])}>
        <DropdownMenuPrimitive.Content ref={ref} style={[contentStyle, style]} {...props} />
      </DropdownMenuPrimitive.Overlay>
    </DropdownMenuPrimitive.Portal>
  );
});
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  DropdownMenuPrimitive.ItemRef,
  DropdownMenuPrimitive.ItemProps & { inset?: boolean }
>(({ inset, disabled, style, ...props }, ref) => {

  const darkColors = {
    foreground: '#EDEDED',  // near-white for text/icons
    surface: '#1E1E1E',     // dark background
    border: '#2B2B2B',      // slightly lighter gray for borders
    // ...
  };
  const itemStyle: StyleProp<ViewStyle> = {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    paddingHorizontal: 8,
    // paddingRight: 8,
    paddingVertical: 7,
    ...(inset ? { paddingLeft: 32 } : {}),
    opacity: disabled ? 0.5 : 1,

  };
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      style={[itemStyle, typeof style === 'function' ? style({ pressed: false }) : style]}
      disabled={disabled}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  DropdownMenuPrimitive.CheckboxItemRef,
  DropdownMenuPrimitive.CheckboxItemProps
>(({ children, checked, disabled, style, ...props }, ref) => {

  const darkColors = {
    foreground: '#EDEDED',  // near-white for text/icons
    surface: '#1E1E1E',     // dark background
    border: '#2B2B2B',      // slightly lighter gray for borders
    // ...
  };
  const checkboxItemStyle: StyleProp<ViewStyle> = {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    paddingLeft: 32,
    opacity: disabled ? 0.5 : 1,
  };
  const indicatorStyle: StyleProp<ViewStyle> = {
    position: 'absolute',
    left: 8,
    height: 14,
    width: 14,
    alignItems: 'center',
    justifyContent: 'center',
  };
  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      style={typeof style === 'function' ? checkboxItemStyle : [checkboxItemStyle, style]}
      checked={checked}
      disabled={disabled}
      {...props}
    >
      <View style={indicatorStyle}>
        <DropdownMenuPrimitive.ItemIndicator>
          <Ionicons name="checkmark" size={14} color="white" />
        </DropdownMenuPrimitive.ItemIndicator>
      </View>
      {typeof children === 'function' ? children({ pressed: false }) : children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
});
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  DropdownMenuPrimitive.RadioItemRef,
  DropdownMenuPrimitive.RadioItemProps
>(({ children, disabled, style, ...props }, ref) => {

  const darkColors = {
    foreground: '#EDEDED',  // near-white for text/icons
    surface: '#1E1E1E',     // dark background
    border: '#2B2B2B',      // slightly lighter gray for borders
    // ...
  };
  const radioItemStyle: StyleProp<ViewStyle> = {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    paddingLeft: 32,
    opacity: disabled ? 0.5 : 1,
  };
  const indicatorStyle: StyleProp<ViewStyle> = {
    position: 'absolute',
    left: 8,
    height: 14,
    width: 14,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const innerIndicatorStyle: StyleProp<ViewStyle> = {
    backgroundColor: darkColors.border,
    height: 8,
    width: 8,
    borderRadius: 4,
  };
  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      style={[radioItemStyle, typeof style === 'function' ? style({ pressed: false }) : style]}
      disabled={disabled}
      {...props}
    >
      <View style={indicatorStyle}>
        <DropdownMenuPrimitive.ItemIndicator>
          <View style={innerIndicatorStyle} />
        </DropdownMenuPrimitive.ItemIndicator>
      </View>
      {typeof children === 'function' ? children({ pressed: false }) : children}
    </DropdownMenuPrimitive.RadioItem>
  );
});
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  DropdownMenuPrimitive.LabelRef,
  DropdownMenuPrimitive.LabelProps & { inset?: boolean }
>(({ inset, style, ...props }, ref) => {

  const darkColors = {
    foreground: '#EDEDED',  // near-white for text/icons
    surface: '#1E1E1E',     // dark background
    border: '#2B2B2B',      // slightly lighter gray for borders
    // ...
  };
  const labelStyle: StyleProp<TextStyle> = {
    paddingHorizontal: 6,
    paddingVertical: 6,
    fontSize: Platform.OS === 'web' ? 14 : 16,
    fontWeight: '600',
    color: darkColors.foreground,
    ...(inset ? { paddingLeft: 32 } : {}),
  };
  return <DropdownMenuPrimitive.Label ref={ref} style={[labelStyle, style]} {...props} />;
});
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  DropdownMenuPrimitive.SeparatorRef,
  DropdownMenuPrimitive.SeparatorProps
>(({ style, ...props }, ref) => {

  const darkColors = {
    foreground: '#EDEDED',  // near-white for text/icons
    surface: '#1E1E1E',     // dark background
    border: '#2B2B2B',      // slightly lighter gray for borders
    // ...
  };
  const separatorStyle: StyleProp<ViewStyle> = {
    marginVertical: 4,
    height: StyleSheet.hairlineWidth,
    backgroundColor: darkColors.border,
  };
  return (
    <DropdownMenuPrimitive.Separator ref={ref} style={[separatorStyle, style]} {...props} />
  );
});
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = (props: TextProps) => {

  const darkColors = {
    foreground: '#EDEDED',  // near-white for text/icons
    surface: '#1E1E1E',     // dark background
    border: '#2B2B2B',      // slightly lighter gray for borders
    // ...
  };
  const shortcutStyle: TextStyle = {
    marginLeft: 'auto',
    fontSize: Platform.OS === 'web' ? 12 : 14,
    letterSpacing: 1,
    color: darkColors.foreground,
  };
  return <Text style={[shortcutStyle, props.style]} {...props} />;
};
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
