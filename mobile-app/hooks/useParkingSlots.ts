import { db } from "@/firebase/firebaseConfig";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";

interface SlotData {
    isOccupied: boolean;
    isReserved: boolean;
    isPayment: boolean;
    entryTime: number;
    exitTime: number;
    fee: number;
}

export function useParkingSlots() {
    const [slots, setSlots] = useState<Record<string, SlotData>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const parkingRef = ref(db, 'parking');
        const unsubscribe = onValue(parkingRef, (snapshot) => {
            const data = snapshot.val();
            setSlots(data || {});
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return { slots, loading };
}
