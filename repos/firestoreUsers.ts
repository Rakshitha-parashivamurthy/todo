import { doc, setDoc, updateDoc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

type Role = 'super_admin' | 'admin' | 'user';

export const addUserToFirestore = async (user: { 
  uid: string; 
  email?: string | null;
  username?: string;
  password_hash?: string;
  role?: Role;
  companyId?: string;
}) => {
  const userRef = doc(db, "users", user.uid);
  try {
    const hasSA = await hasSuperAdmin();
    const role = !hasSA ? 'super_admin' : (user.role || 'user');
    const status = !hasSA ? 'active' : 'pending';

    await setDoc(userRef, {
      email: user.email || null,
      username: user.username || user.email?.split('@')[0] || 'user',
      password_hash: user.password_hash || null,
      role,
      companyId: user.companyId || null,
      status,
      created_at: new Date(),
      last_login: new Date(),
    });
    console.log("✅ User profile created:", user.uid, "role:", role);
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
      last_login: new Date(),
    }, { merge: true });
    console.log("✅ Last login updated:", uid);
  } catch (error) {
    console.error("❌ Error updating last login:", error);
  }
};

// Get user by UID
export const getUserByUid = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such user!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

// Update user role
export const updateUserRole = async (uid: string, role: 'super_admin' | 'admin' | 'user') => {
  const userRef = doc(db, "users", uid);
  try {
    await updateDoc(userRef, { role });
    console.log("✅ User role updated:", uid);
  } catch (error) {
    console.error("❌ Error updating user role:", error);
  }
};

// Update user company
export const updateUserCompany = async (uid: string, companyId: string) => {
  const userRef = doc(db, "users", uid);
  try {
    await updateDoc(userRef, { companyId });
    console.log("✅ User company updated:", uid);
  } catch (error) {
    console.error("❌ Error updating user company:", error);
  }
};

// Update user status
export const updateUserStatus = async (uid: string, status: 'pending' | 'active' | 'inactive') => {
  const userRef = doc(db, "users", uid);
  try {
    await updateDoc(userRef, { status });
    console.log("✅ User status updated:", uid);
  } catch (error) {
    console.error("❌ Error updating user status:", error);
  }
};

// Check if super admin exists
export const hasSuperAdmin = async () => {
  const q = query(collection(db, "users"), where("role", "==", "super_admin"));
  try {
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking super admin:", error);
    return false;
  }
};

export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users: any[] = [];
    querySnapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
};
