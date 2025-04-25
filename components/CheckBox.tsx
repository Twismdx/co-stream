import * as React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StyleProp,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { Checkbox } from '~/components/ui/checkbox';

export type CheckboxWithLabelProps = {
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    containerStyle?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
};

const CheckboxWithLabel: React.FC<CheckboxWithLabelProps> = ({
    label,
    checked,
    onCheckedChange,
    containerStyle,
    labelStyle,
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <Checkbox
                accessibilityLabel={label}
                checked={checked}
                onCheckedChange={onCheckedChange}
                style={{ backgroundColor: '#CCC' }}
            />
            <TouchableOpacity onPress={() => onCheckedChange(!checked)}>
                <Text style={[styles.label, labelStyle]}>{label}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', // flex-row
        alignItems: 'center', // items-center
    },
    label: {
        marginLeft: 12, // gap-3 (approx.)
        fontSize: 16,
        color: '#CCC',
    },
});

export default CheckboxWithLabel;
