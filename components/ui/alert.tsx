import React from 'react';
import { View, Text } from 'react-native';

export interface AlertProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  variant: 'success' | 'destructive' | 'default';
  activeColors: {
    background: string;
    border: string;
    titleColor?: string;
    descriptionColor?: string;
    text?: string;
  };
}

export function Alert({ icon, title, description, variant, activeColors }: AlertProps) {
  return (
    <View
      style={{
        padding: 16,
        borderRadius: 8,
        backgroundColor: activeColors.background,
        borderWidth: 1,
        borderColor: activeColors.border,
      }}
    >
      {icon && <View style={{ marginBottom: 8 }}>{icon}</View>}
      <Text style={{ fontWeight: 'bold', color: activeColors.titleColor || activeColors.text }}>
        {title}
      </Text>
      <Text style={{ color: activeColors.descriptionColor || activeColors.text }}>
        {description}
      </Text>
    </View>
  );
}