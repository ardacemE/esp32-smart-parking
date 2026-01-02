import React, { createContext, useContext, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ConfirmOptions {
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface ConfirmContextType {
    show: (message: string, options?: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [options, setOptions] = useState<ConfirmOptions>({});

    const show = (msg: string, opts: ConfirmOptions = {}) => {
        setMessage(msg);
        setOptions(opts);
        setVisible(true);
    };

    const handleConfirm = () => {
        setVisible(false);
        options.onConfirm?.();
    };

    const handleCancel = () => {
        setVisible(false);
        options.onCancel?.();
    };

    return (
        <ConfirmContext.Provider value={{ show }}>
            {children}
            <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
                <View style={styles.overlay}>
                    <View style={styles.dialog}>
                        <Text style={styles.message}>{message}</Text>
                        <View style={styles.buttons}>
                            {options.cancelLabel && (
                                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                    <Text style={styles.cancelText}>{options.cancelLabel}</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                                <Text style={styles.confirmText}>{options.confirmLabel || "Tamam"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) throw new Error("useConfirm must be used within ConfirmProvider");
    return context;
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
    dialog: { backgroundColor: "#FFF", borderRadius: 16, padding: 24, width: "80%", maxWidth: 400 },
    message: { fontSize: 16, color: "#1F2937", marginBottom: 24, textAlign: "center" },
    buttons: { flexDirection: "row", gap: 12, justifyContent: "flex-end" },
    cancelButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, backgroundColor: "#E5E7EB" },
    cancelText: { color: "#1F2937", fontWeight: "600" },
    confirmButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, backgroundColor: "#3B82F6" },
    confirmText: { color: "#FFF", fontWeight: "600" },
});
