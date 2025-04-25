import * as AvatarPrimitive from '@rn-primitives/avatar';
import React from 'react';
import { useGlobalContext } from '../timer/context';

const Avatar = React.forwardRef((props, ref) => {
  const { style, ...rest } = props;
  // Using inline styles similar to Tailwind's "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full"
  const avatarStyle = {
    position: 'relative',
    flexDirection: 'row',
    height: 40, // equivalent to h-10 (10 * 4)
    width: 40,  // equivalent to w-10
    overflow: 'hidden',
    borderRadius: 9999, // rounded-full
  };

  return (
    <AvatarPrimitive.Root ref={ref} style={[avatarStyle, style]} {...rest} />
  );
});
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef((props, ref) => {
  const { style, ...rest } = props;
  // Using inline styles to mimic "aspect-square h-full w-full"
  const imageStyle = {
    height: '100%',
    width: '100%',
    aspectRatio: 1,
  };

  return (
    <AvatarPrimitive.Image ref={ref} style={[imageStyle, style]} {...rest} />
  );
});
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef((props, ref) => {
  const { theme } = useGlobalContext();
  const { style, ...rest } = props;
  // Using inline styles similar to "flex h-full w-full items-center justify-center rounded-full bg-muted"
  const fallbackStyle = {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: theme.colors[theme.mode].muted || '#ccc',
  };

  return (
    <AvatarPrimitive.Fallback ref={ref} style={[fallbackStyle, style]} {...rest} />
  );
});
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarFallback, AvatarImage };
