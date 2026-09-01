// ============================================================
//  EO EXECUTIVE OPTICAL – Firebase Configuration
//  Replace these values with your Firebase project config
//  Firebase Console → Project Settings → Your Apps → Web App
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBIMEfnNooGHHjsfglghsNi6yxGeXeRDI4",
  authDomain: "eo-optical-ims.firebaseapp.com",
  projectId: "eo-optical-ims",
  storageBucket: "eo-optical-ims.firebasestorage.app",
  messagingSenderId: "168452419885",
  appId: "1:168452419885:web:f552afec11e4d1656623a4",
  measurementId: "G-80783X85RL"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

export { auth, db };
