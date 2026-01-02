# Smart Parking System - ESP32 Firebase

A comprehensive smart parking management system using ESP32, Firebase Realtime Database, ultrasonic sensors, servo motors, and dual LCD displays.

## 🚗 Features

- **6 Parking Slots** with real-time occupancy detection
- **Dual LCD Display System**:
  - Entrance LCD: Shows available spots and reserved slots
  - Exit LCD: Displays payment status
- **Automated Gate Control** with servo motors
- **Firebase Integration** for remote monitoring and payment
- **Reservation System** via Firebase
- **Automatic Fee Calculation** based on parking duration
- **LED Indicators** for each parking slot
- **Buzzer Alerts** for full parking lot

## 🛠️ Hardware Requirements

- ESP32 Development Board
- 8x HC-SR04 Ultrasonic Sensors (6 for slots, 2 for gates)
- 2x 16x2 I2C LCD Displays (0x27 and 0x26)
- 2x Servo Motors (Entry and Exit gates)
- 6x LEDs (Slot indicators)
- 1x Buzzer
- Jumper wires and breadboard

## 📋 Pin Configuration

| Component | Pin |
|-----------|-----|
| Trigger Pin | GPIO 25 |
| Servo In | GPIO 18 |
| Servo Out | GPIO 19 |
| Buzzer | GPIO 26 |
| LEDs | GPIO 2, 4, 5, 12, 15, 23 |
| Echo Pins | GPIO 13, 14, 16, 17, 32, 33, 34, 35 |

## 🔧 Setup Instructions

### 1. Install Required Libraries
Install these libraries via Arduino IDE Library Manager:
- `ESP32Servo`
- `LiquidCrystal_I2C`
- `FirebaseClient`
- `WiFiClientSecure`

### 2. Configure Credentials
Open `new-fb-client.ino` and replace the placeholders:

```cpp
#define WIFI_SSID "Your_WiFi_SSID"
#define WIFI_PASSWORD "Your_WiFi_Password"
#define Web_API_KEY "Your_API_Key"
#define DATABASE_URL "Your_Database_URL"
#define USER_EMAIL "Your_Email"
#define USER_PASS "Your_Password"
```

### 3. Firebase Setup
1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Realtime Database
3. Set up Email/Password authentication
4. Get your Web API Key and Database URL

### 4. Upload to ESP32
1. Select your ESP32 board in Arduino IDE
2. Choose the correct COM port
3. Upload the sketch

## 📊 Firebase Database Structure

```json
{
  "parking": {
    "slot1": {
      "isOccupied": false,
      "isReserved": false,
      "isPayment": false,
      "entryTime": 0,
      "exitTime": 0,
      "fee": 0
    },
    // ... slot2 through slot6
  }
}
```

## 💰 Pricing

- Slots 1-4: 50 TL/hour
- Slots 5-6: 20 TL/hour
- Minimum charge: 0.05 hours

## 🎯 How It Works

1. **Entry**: Vehicle detected → Gate opens → Welcome message displayed
2. **Parking**: Ultrasonic sensors detect occupancy → Firebase updated → LED indicators activated
3. **Exit**: Vehicle leaves slot → Fee calculated → Payment required via Firebase
4. **Payment**: User pays online → Gate opens → Goodbye message displayed

## 📱 Online/Offline Mode

- **Online**: Full Firebase integration with remote monitoring and payment
- **Offline**: Local operation with automatic payment bypass for testing

## 🔒 Security Note

**Never commit your actual credentials to GitHub!** Always use placeholder values like shown in this repository.

## 📝 License

This project is open source and available for educational purposes.

## 👨‍💻 Author

Created for smart parking management systems.

---

**⚠️ Important**: Remember to replace all placeholder credentials with your actual values before deploying!
