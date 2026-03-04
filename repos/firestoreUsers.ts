import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const addUserToFirestore = async (user: { 
  uid: string; 
  email?: string | null;
  username?: string;
  password_hash?: string;
}) => {
  const userRef = doc(db, "users", user.uid);
  try {
    await setDoc(userRef, {
      email: user.email || null,
      username: user.username || user.email?.split('@')[0] || 'user',
      password_hash: user.password_hash || null,
      createdAt: new Date(),
      lastLogin: new Date(),
      role: 'user',
      status: 'active',
    });
    console.log("✅ User profile created:", user.uid);
  } catch (error) {
    console.error("❌ Error creating user profile:", error);
  }
};

// Update last login timestamp
export const updateUserLastLogin = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  try {
    // use setDoc with merge so that if doc is missing it will be created
    await setDoc(userRef, {
      lastLogin: new Date(),
    }, { merge: true });
    console.log("✅ Last login updated:", uid);
  } catch (error) {
    console.error("❌ Error updating last login:", error);
  }
};
