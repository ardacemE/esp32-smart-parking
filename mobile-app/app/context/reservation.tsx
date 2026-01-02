import { db } from "@/firebase/firebaseConfig";
import { ref, update } from "firebase/database";
import React, { createContext, useContext, useState } from "react";

interface ReservationContextType {
    reservedSlot: number | null;
    reserve: (slotId: number) => boolean;
    pay: () => void;
    cancelReservation: () => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export function ReservationProvider({ children }: { children: React.ReactNode }) {
    const [reservedSlot, setReservedSlot] = useState<number | null>(null);

    const reserve = (slotId: number) => {
        try {
            const slotRef = ref(db, `parking/slot${slotId}`);
            update(slotRef, { isReserved: true });
            setReservedSlot(slotId);
            return true;
        } catch (error) {
            console.error("Rezervasyon hatası:", error);
            return false;
        }
    };

    const pay = () => {
        if (!reservedSlot) return;
        try {
            const slotRef = ref(db, `parking/slot${reservedSlot}`);
            update(slotRef, { isPayment: true });
        } catch (error) {
            console.error("Ödeme hatası:", error);
        }
    };

    const cancelReservation = () => {
        if (!reservedSlot) return;
        try {
            const slotRef = ref(db, `parking/slot${reservedSlot}`);
            update(slotRef, { isReserved: false });
            setReservedSlot(null);
        } catch (error) {
            console.error("İptal hatası:", error);
        }
    };

    return (
        <ReservationContext.Provider value={{ reservedSlot, reserve, pay, cancelReservation }}>
            {children}
        </ReservationContext.Provider>
    );
}

export function useReservation() {
    const context = useContext(ReservationContext);
    if (!context) {
        throw new Error("useReservation must be used within ReservationProvider");
    }
    return context;
}
