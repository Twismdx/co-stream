import React from 'react'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'

export function withModalProvider<
  T,
  P extends object = {}
>(
  Component: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<P> & React.RefAttributes<T>
  >
): React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<T>
> {
  const Wrapped = React.forwardRef<T, P>((props, ref) => (
    <BottomSheetModalProvider>
      <Component {...props} ref={ref} />
    </BottomSheetModalProvider>
  ))
  Wrapped.displayName = `withModalProvider(${Component.displayName || Component.name || 'Component'
    })`
  return Wrapped
}
