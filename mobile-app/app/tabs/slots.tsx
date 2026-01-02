import { useReservation } from "@/app/context/reservation";
import { useConfirm } from "@/components/ui/confirm";
import { SlotCard } from "@/components/ui/slot-card";
import { useToast } from "@/components/ui/toast";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useParkingSlots } from "@/hooks/useParkingSlots";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SlotSelectionScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];
    const toast = useToast();
    const confirm = useConfirm();
    const { reservedSlot, reserve } = useReservation();
    const { slots: firebaseSlots, loading } = useParkingSlots();
    const RATES = [30, 40, 50, 60, 70, 80];
    const [now, setNow] = React.useState(Date.now());

    React.useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(timer);
    }, []);

    const slots = useMemo(() => {
        if (!firebaseSlots) return [];
        return Object.entries(firebaseSlots)
            .map(([key, value]) => {
                const id = parseInt(key.replace("slot", ""), 10);
                const safeId = isNaN(id) ? 0 : id;
                return {
                    id: safeId,
                    occupied: value.isOccupied,
                    isReserved: value.isReserved,
                    entryTime: value.entryTime,
                };
            })
            .sort((a, b) => a.id - b.id);
    }, [firebaseSlots, now]);

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.headerTop}>
                <Text style={[styles.topTitle, { color: colors.text }]}>Park Yuvaları</Text>
                <View style={styles.topIcon}>
                    <Ionicons name="car-outline" size={72} color={colors.primary} />
                </View>
            </View>
            <View style={styles.header}>
                <Text style={[styles.headerTitleHero, { color: colors.text }]}>
                    Hoş Geldiniz! Park Etmek İstediğiniz Slotu Seçin.
                </Text>
            </View>
            <ScrollView contentContainerStyle={styles.grid}>
                {slots.map((s) => {
                    const isMine = reservedSlot === s.id;
                    return (
                        <View key={s.id} style={styles.cell}>
                            <SlotCard
                                slotNumber={s.id}
                                isOccupied={s.occupied}
                                isReserved={s.isReserved}
                                isMine={isMine}
                                onPress={() => {
                                    confirm.show(`Slot ${s.id} rezerve edilsin mi?`, {
                                        confirmLabel: "Rezerve Et",
                                        cancelLabel: "İptal",
                                        onConfirm: () => {
                                            const success = reserve(s.id);
                                            if (success) {
                                                toast.show(`Slot ${s.id} rezerve edildi`);
                                                confirm.show(`Slot ${s.id} rezerve edildi. Ücretlendirme 5dk sonra başlayacak.`, {
                                                    confirmLabel: "Tamam",
                                                });
                                            }
                                        },
                                    });
                                }}
                            />
                            {isMine ? (
                                <View style={[styles.selectedOverlay, { borderColor: colors.success ?? colors.primary }]} />
                            ) : null}
                        </View>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
    headerTop: { paddingTop: 16, paddingHorizontal: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    topTitle: { fontSize: 36, fontWeight: "900" },
    topIcon: { width: 72, height: 72, justifyContent: "center", alignItems: "center", borderRadius: 36 },
    headerTitleHero: { fontSize: 18, fontWeight: "600", textAlign: "center", marginVertical: 12 },
    grid: { padding: 16, flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" },
    cell: { width: "48%", marginBottom: 12 },
    selectedOverlay: { position: "absolute", top: 6, left: 6, right: 6, bottom: 6, borderRadius: 12, borderWidth: 2 },
});
