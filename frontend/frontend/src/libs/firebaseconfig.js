import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOJs66D78iN4xtW8t2AS1ia7Fdh6fZCSA",
  authDomain: "pern-expense-tracker-62236.firebaseapp.com",
  projectId: "pern-expense-tracker-62236",
  storageBucket: "pern-expense-tracker-62236.firebasestorage.app",
  messagingSenderId: "700717188574",
  appId: "1:700717188574:web:6f0be926bbb3c9f7f9094f",
  measurementId: "G-1W4V4SXNFH"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Export auth so SocialAuth can use it
export const auth = getAuth(app);

export default app; // optional, if you want to import app el