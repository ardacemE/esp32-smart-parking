import { useReservation } from "@/app/context/reservation";
import { useConfirm } from "@/components/ui/confirm";
import { PrimaryButton } from "@/components/ui/primary-button";
import { TarifeCard } from "@/components/ui/tarife-card";
import { useToast } from "@/components/ui/toast";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useParkingSlots } from "@/hooks/useParkingSlots";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "dark"];
    const confirm = useConfirm();
    const params = useLocalSearchParams();
    const router = useRouter();
    const selectedSlot = params.slot ? String(params.slot) : null;
    const toast = useToast();
    const { pay } = useReservation();
    const { slots } = useParkingSlots();
    const currentSlot = selectedSlot ? slots[`slot${selectedSlot}`] : null;
    const fee = currentSlot?.fee || 0;
    const feeText = fee > 0 ? `${fee.toFixed(2)} TL` : "Ücret slottan çıkınca hesaplanır";

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <View style={styles.iconSection}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="card-outline" size={80} color={colors.primary} />
                    </View>
                </View>
                <Text style={[styles.title, { color: colors.text }]}>Tarife ve Ödeme</Text>
                <View style={[styles.tarifeContainer, { backgroundColor: colors.cardBackground, borderColor: colors.primary }]}>
                    <TarifeCard title="Standart Tarife (Slot 1-4)" price="50 TL / Saat" />
                    <TarifeCard title="Engelli Tarifesi (Slot 5-6)" price="20 TL / Saat" isLast={true} />
                </View>
                <Text style={{ textAlign: "center", color: colors.text, marginBottom: 20, fontStyle: "italic" }}>
                    5. ve 6. slotlar engelli park yeri olup daha ucuzdur.
                </Text>
                <View style={styles.paymentSection}>
                    <Text style={[styles.totalAmount, { color: colors.primary }]}>
                        {fee > 0 ? `Toplam Borç: ${feeText}` : feeText}
                    </Text>
                    <PrimaryButton
                        title={selectedSlot ? `ÖDEME YAP (Slot ${selectedSlot})` : "ÖDEME YAP"}
                        onPress={() => {
                            confirm.show("Ödemeyi tamamlamak istiyor musunuz?", {
                                confirmLabel: "Ödeme Yap",
                                cancelLabel: "İptal",
                                onConfirm: () => {
                                    pay();
                                    toast.show("Ödeme başarılı — Teşekkürler");
                                    confirm.show("Ödeme alındı. Park yeriniz artık kullanımda.", { confirmLabel: "Tamam" });
                                    setTimeout(() => router.replace("/(tabs)/slots"), 900);
                                },
                            });
                        }}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1 },
    contentContainer: { padding: 16, paddingBottom: 100 },
    iconSection: { width: "100%", justifyContent: "center", alignItems: "center", paddingVertical: 24, minHeight: 140 },
    iconContainer: { justifyContent: "center", alignItems: "center" },
    title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 24 },
    tarifeContainer: { borderWidth: 2, borderRadius: 12, paddingVertical: 8, marginBottom: 32 },
    paymentSection: { alignItems: "center", gap: 24, marginTop: 32 },
    totalAmount: { fontSize: 32, fontWeight: "900", textAlign: "center" },
});
