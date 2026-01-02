import React, { createContext, useContext, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";

interface ToastContextType {
    show: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [message, setMessage] = useState("");
    const [visible, setVisible] = useState(false);
    const opacity = React.useRef(new Animated.Value(0)).current;

    const show = (msg: string) => {
        setMessage(msg);
        setVisible(true);
        Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.delay(2000),
            Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => setVisible(false));
    };

    return (
        <ToastContext.Provider value={{ show }}>
            {children}
            {visible && (
                <Animated.View style={[styles.toast, { opacity }]}>
                    <Text style={styles.toastText}>{message}</Text>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
}

const styles = StyleSheet.create({
    toast: { position: "absolute", bottom: 100, left: 20, right: 20, backgroundColor: "#1F2937", padding: 16, borderRadius: 12, alignItems: "center", zIndex: 9999 },
    toastText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
});
