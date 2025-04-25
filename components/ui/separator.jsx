import * as SeparatorPrimitive from '@rn-primitives/separator';
import React from 'react';
import { useGlobalContext } from '../timer/context';

const Separator = React.forwardRef((props, ref) => {
  const { theme } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];

  const {
    orientation = 'horizontal',
    decorative = true,
    style,
    ...rest
  } = props;

  // Determine dimensions based on orientation.
  const dimensionStyle =
    orientation === 'horizontal'
      ? { height: 1, width: '100%' }
      : { height: '100%', width: 1 };

  const separatorStyle = {
    backgroundColor: activeColors.foreground,
    opacity: 0.6,
    marginVertical: 16,
    ...dimensionStyle,
  };

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      style={[separatorStyle, style]}
      {...rest}
    />
  );
});

Separator.displayName = 'Separator';

export { Separator };
