// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-95698.firebaseapp.com",
  projectId: "mern-estate-95698",
  storageBucket: "mern-estate-95698.appspot.com",
  messagingSenderId: "408629362565",
  appId: "1:408629362565:web:89d0cf12f293da227cceec"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);