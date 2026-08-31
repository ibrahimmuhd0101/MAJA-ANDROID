// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyARNIMr9CLKIFOt6AONAa4fYz-pe28yX4I",
  authDomain: "maja-ae9d0.firebaseapp.com",
  projectId: "maja-ae9d0",
  storageBucket: "maja-ae9d0.firebasestorage.app",
  messagingSenderId: "21674614341",
  appId: "1:21674614341:web:2f63073f1d0e1c3df04d2c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
