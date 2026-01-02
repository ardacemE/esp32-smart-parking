import { ReservationProvider } from "@/app/context/reservation";
import { ConfirmProvider } from "@/components/ui/confirm";
import { ToastProvider } from "@/components/ui/toast";
import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
    return (
        <ReservationProvider>
            <ToastProvider>
                <ConfirmProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" />
                    </Stack>
                </ConfirmProvider>
            </ToastProvider>
        </ReservationProvider>
    );
}
