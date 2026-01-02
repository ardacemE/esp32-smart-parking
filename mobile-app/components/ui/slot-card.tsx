import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SlotCardProps {
    slotNumber: number;
    isOccupied: boolean;
    isReserved: boolean;
    isMine: boolean;
    onPress: () => void;
}

export function SlotCard({ slotNumber, isOccupied, isReserved, isMine, onPress }: SlotCardProps) {
    const getStatusColor = () => {
        if (isOccupied) return "#EF4444";
        if (isReserved) return "#F59E0B";
        return "#10B981";
    };

    const getStatusText = () => {
        if (isOccupied) return "DOLU";
        if (isReserved) return isMine ? "SİZİN" : "REZERVE";
        return "BOŞ";
    };

    const isDisabled = isOccupied || (isReserved && !isMine);

    return (
        <TouchableOpacity
            style={[styles.card, { borderColor: getStatusColor(), opacity: isDisabled ? 0.6 : 1 }]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}
        >
            <Text style={styles.slotNumber}>Slot {slotNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: { padding: 16, borderRadius: 12, borderWidth: 3, backgroundColor: "#FFF", alignItems: "center", minHeight: 120, justifyContent: "space-between", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    slotNumber: { fontSize: 24, fontWeight: "bold", color: "#1F2937" },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, minWidth: 80, alignItems: "center" },
    statusText: { color: "#FFF", fontWeight: "bold", fontSize: 12, letterSpacing: 0.5 },
});
