import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

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

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
