# Smart Parking Mobile App

React Native mobile application for the ESP32 Smart Parking System.

## 🚀 Features

- **Real-time Parking Status**: View all 6 parking slots in real-time
- **Slot Reservation**: Reserve parking spots before arrival
- **Payment Processing**: Pay parking fees through the app
- **Firebase Integration**: Real-time database synchronization
- **Dark/Light Theme**: Automatic theme switching
- **Turkish Language**: Full Turkish language support

## 📱 Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Firebase Realtime Database**
- **Expo Router** for navigation
- **Context API** for state management

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd mobile-app
npm install
```

### 2. Configure Firebase

Edit `firebase/firebaseConfig.js` and replace placeholders with your Firebase credentials:

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

### 3. Run the App

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## 📂 Project Structure

```
mobile-app/
├── app/
│   ├── (tabs)/          # Tab navigation screens
│   │   ├── slots.tsx    # Parking slot selection
│   │   ├── payment.tsx  # Payment screen
│   │   └── _layout.tsx  # Tab layout
│   ├── context/         # React contexts
│   │   └── reservation.tsx
│   └── _layout.tsx      # Root layout
├── components/
│   └── ui/              # Reusable UI components
│       ├── slot-card.tsx
│       ├── primary-button.tsx
│       ├── tarife-card.tsx
│       ├── toast.tsx
│       └── confirm.tsx
├── constants/
│   └── theme.ts         # Theme colors
├── firebase/
│   └── firebaseConfig.js # Firebase configuration
└── hooks/
    ├── useParkingSlots.ts
    └── use-color-scheme.ts
```

## 🎯 How It Works

1. **View Slots**: Open the app to see real-time parking slot availability
2. **Reserve**: Tap on an available slot to reserve it
3. **Park**: Drive to the parking lot and park in your reserved slot
4. **Pay**: When leaving, go to the Payment tab and complete payment
5. **Exit**: Gate opens automatically after payment

## 🎨 UI Components

- **SlotCard**: Displays parking slot status (Available/Occupied/Reserved)
- **PrimaryButton**: Main action button
- **TarifeCard**: Pricing information display
- **Toast**: Notification messages
- **Confirm**: Confirmation dialogs

## 💰 Pricing

- Slots 1-4: 50 TL/hour (Standard)
- Slots 5-6: 20 TL/hour (Accessible parking)

## 🔒 Security

**Important**: Never commit your actual Firebase credentials to GitHub. Always use placeholder values in the repository.

## 📝 License

Open source for educational purposes.
