import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
}

export function PrimaryButton({ title, onPress, disabled }: PrimaryButtonProps) {
    return (
        <TouchableOpacity
            style={[styles.button, disabled && styles.buttonDisabled]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
        >
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: { backgroundColor: "#3B82F6", paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, minWidth: 200, alignItems: "center", shadowColor: "#3B82F6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    buttonDisabled: { backgroundColor: "#9CA3AF", shadowOpacity: 0 },
    buttonText: { color: "#FFF", fontSize: 16, fontWeight: "bold", letterSpacing: 0.5 },
});
