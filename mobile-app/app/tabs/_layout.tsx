import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#3B82F6" }}>
            <Tabs.Screen
                name="slots"
                options={{
                    title: "Park Yerleri",
                    tabBarIcon: ({ color, size }) => <Ionicons name="car-outline" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="payment"
                options={{
                    title: "Ödeme",
                    tabBarIcon: ({ color, size }) => <Ionicons name="card-outline" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
