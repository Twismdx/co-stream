import * as CheckboxPrimitive from '@rn-primitives/checkbox';
import * as React from 'react';
import { Platform, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const Checkbox = React.forwardRef<CheckboxPrimitive.RootRef, CheckboxPrimitive.RootProps>(
    ({ style, checked, onCheckedChange, disabled, ...props }, ref) => {
        // Define size based on platform: 16px for web and 20px for native.
        const size = Platform.OS === 'web' ? 16 : 20;

        const baseStyle: ViewStyle = {
            height: size,
            width: size,
            flexShrink: 0,
            borderRadius: Platform.OS === 'web' ? 2 : 4,
            borderWidth: 1,
            borderColor: 'hsl(240, 10%, 3.9%)',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: disabled ? 0.5 : 1,
        };

        const checkedStyle: ViewStyle = checked ? { backgroundColor: '#2563eb' } : {};

        return (
            <CheckboxPrimitive.Root
                ref={ref}
                checked={checked}
                onCheckedChange={onCheckedChange}
                style={[baseStyle, checkedStyle, style] as StyleProp<ViewStyle>}
                disabled={disabled}
                {...props}
            >
                <CheckboxPrimitive.Indicator style={styles.indicator}>
                    {checked && (
                        <MaterialIcons
                            name="check"
                            size={Platform.OS === 'web' ? 12 : 16}
                            color="#000000"
                        />
                    )}
                </CheckboxPrimitive.Indicator>
            </CheckboxPrimitive.Root>
        );
    }
);
Checkbox.displayName = 'Checkbox';

const styles = StyleSheet.create({
    indicator: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
});

export { Checkbox };
