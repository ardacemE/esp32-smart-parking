import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface TarifeCardProps {
    title: string;
    price: string;
    isLast?: boolean;
}

export function TarifeCard({ title, price, isLast }: TarifeCardProps) {
    return (
        <View style={[styles.container, !isLast && styles.borderBottom]}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.price}>{price}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { paddingVertical: 16, paddingHorizontal: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
    title: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
    price: { fontSize: 16, fontWeight: "bold", color: "#3B82F6" },
});
