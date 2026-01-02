# 🚗 ESP32 Smart Parking System

A comprehensive IoT smart parking management system with hardware control and mobile application.

## 📋 Project Overview

This project consists of two main components:
1. **Hardware System** - ESP32-based parking lot controller
2. **Mobile App** - React Native application for users

## 🏗️ System Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   ESP32 + Sensors│  ◄────► │  Firebase RTDB   │  ◄────► │  Mobile App     │
│   (Hardware)     │         │  (Cloud Database)│         │  (React Native) │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

## 📁 Repository Structure

```
esp32-smart-parking/
├── hardware/              # ESP32 Arduino code
│   └── new-fb-client.ino
├── mobile-app/           # React Native mobile application
│   ├── app/             # Screens and navigation
│   ├── components/      # Reusable UI components
│   ├── firebase/        # Firebase configuration
│   ├── hooks/           # Custom React hooks
│   └── constants/       # Theme and constants
├── README.md            # This file
└── .gitignore
```

---

## 🔧 Hardware System

### Features
- **6 Parking Slots** with ultrasonic sensors
- **Dual LCD Displays** (entrance & exit)
- **Automated Gates** with servo motors
- **LED Indicators** for each slot
- **Firebase Integration** for real-time sync
- **Offline Mode** support

### Hardware Requirements
- ESP32 Development Board
- 8× HC-SR04 Ultrasonic Sensors
- 2× 16x2 I2C LCD Displays (0x27, 0x26)
- 2× Servo Motors
- 6× LEDs
- 1× Buzzer
- Jumper wires and breadboard

### Pin Configuration

| Component   | Pin                                 |
| ----------- | ----------------------------------- |
| Trigger Pin | GPIO 25                             |
| Servo In    | GPIO 18                             |
| Servo Out   | GPIO 19                             |
| Buzzer      | GPIO 26                             |
| LEDs        | GPIO 2, 4, 5, 12, 15, 23            |
| Echo Pins   | GPIO 13, 14, 16, 17, 32, 33, 34, 35 |

### Setup Instructions

1. **Install Arduino IDE** and ESP32 board support
2. **Install Required Libraries**:
   - `ESP32Servo`
   - `LiquidCrystal_I2C`
   - `FirebaseClient`
   - `WiFiClientSecure`

3. **Configure Credentials** in `hardware/new-fb-client.ino`:
   ```cpp
   #define WIFI_SSID "Your_WiFi_SSID"
   #define WIFI_PASSWORD "Your_WiFi_Password"
   #define Web_API_KEY "Your_API_Key"
   #define DATABASE_URL "Your_Database_URL"
   #define USER_EMAIL "Your_Email"
   #define USER_PASS "Your_Password"
   ```

4. **Upload** to ESP32

📖 **[Full Hardware Documentation →](hardware/)**

---

## 📱 Mobile Application

### Features
- **Real-time Slot Monitoring**
- **Parking Slot Reservation**
- **Payment Processing**
- **Dark/Light Theme**
- **Turkish Language Support**

### Tech Stack
- React Native with Expo
- TypeScript
- Firebase Realtime Database
- Expo Router
- Context API

### Setup Instructions

1. **Navigate to mobile app directory**:
   ```bash
   cd mobile-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Firebase** in `mobile-app/firebase/firebaseConfig.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "Your_API_Key",
     authDomain: "Your_Auth_Domain",
     databaseURL: "Your_Database_URL",
     projectId: "Your_Project_ID",
     storageBucket: "Your_Storage_Bucket",
     messagingSenderId: "Your_Messaging_Sender_ID",
     appId: "Your_App_ID",
     measurementId: "Your_Measurement_ID",
   };
   ```

4. **Run the app**:
   ```bash
   npm start
   ```

📖 **[Full Mobile App Documentation →](mobile-app/README.md)**

---

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Realtime Database**
4. Enable **Email/Password Authentication**

### 2. Database Structure

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
    "slot2": { ... },
    "slot3": { ... },
    "slot4": { ... },
    "slot5": { ... },
    "slot6": { ... }
  }
}
```

### 3. Security Rules

```json
{
  "rules": {
    "parking": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

---

## 💰 Pricing System

| Slot Type  | Slots | Price      |
| ---------- | ----- | ---------- |
| Standard   | 1-4   | 50 TL/hour |
| Accessible | 5-6   | 20 TL/hour |

*Minimum charge: 0.05 hours (3 minutes)*

---

## 🎯 How It Works

### Entry Process
1. Vehicle approaches entrance
2. Ultrasonic sensor detects vehicle
3. LCD shows "Welcome" message
4. Gate opens automatically
5. Driver parks in available/reserved slot

### Parking
1. Slot sensor detects vehicle
2. Status updates in Firebase
3. LED turns on
4. Entry time recorded
5. Mobile app shows slot as occupied

### Exit Process
1. Driver leaves parking slot
2. System calculates parking fee
3. Fee appears in mobile app
4. User pays through app
5. Exit gate opens automatically
6. LCD shows "Goodbye" message

---

## 🔒 Security Best Practices

⚠️ **IMPORTANT**: Never commit real credentials to GitHub!

- Use placeholder values in repository
- Store actual credentials locally
- Add sensitive files to `.gitignore`
- Use environment variables in production

---

## 🛠️ Development

### Adding New Features

**Hardware Side**:
1. Modify `hardware/new-fb-client.ino`
2. Test with Arduino Serial Monitor
3. Upload to ESP32

**Mobile Side**:
1. Create/modify components in `mobile-app/`
2. Test with Expo Go app
3. Build for production

---

## 📸 Screenshots

*Add screenshots of your mobile app and hardware setup here*

---

## 🤝 Contributing

This is an educational project. Feel free to:
- Fork the repository
- Submit pull requests
- Report issues
- Suggest improvements

---

## 📝 License

This project is open source and available for educational purposes.

---

## 👨‍💻 Author

Created as a smart parking management system project.

---

## 🙏 Acknowledgments

- Firebase for real-time database
- Expo for React Native development
- ESP32 community for hardware support

---

## 📞 Support

For questions or issues:
1. Check the documentation in each folder
2. Open an issue on GitHub
3. Review Firebase and ESP32 documentation

---

**⭐ If you find this project helpful, please give it a star!**
