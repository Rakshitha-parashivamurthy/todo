const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyD82Pxf7qI-pQ6rRQP56AXLkaJqG_j4Eh0",
  authDomain: "todo-app-project-aa19e.firebaseapp.com",
  projectId: "todo-app-project-aa19e",
  storageBucket: "todo-app-project-aa19e.firebasestorage.app",
  messagingSenderId: "261014157661",
  appId: "1:261014157661:web:e3c3fd33df343e79f250b4",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

module.exports = { auth, db };