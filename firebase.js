// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyARNIMr9CLKIFOt6AONAa4fYz-pe28yX4I",
  authDomain: "maja-ae9d0.firebaseapp.com",
  projectId: "maja-ae9d0",
  storageBucket: "maja-ae9d0.firebasestorage.app",
  messagingSenderId: "21674614341",
  appId: "1:21674614341:web:2f63073f1d0e1c3df04d2c"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

console.log('🔥 Firebase initialized successfully!');
