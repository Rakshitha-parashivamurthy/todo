const { doc, setDoc, updateDoc, getDoc, collection, getDocs, query, where } = require("firebase/firestore");
const { db } = require("../firebase");

const addUserToFirestore = async (user) => {
  const userRef = doc(db, "users", user.uid);
  try {
    const hasSA = await hasSuperAdmin();
    const role = user.role || (!hasSA ? 'super_admin' : 'user');
    await setDoc(userRef, {
      email: user.email || null,
      username: user.username || user.email?.split('@')[0] || 'user',
      password_hash: user.password_hash || null,
      role,
      companyId: user.companyId || null,
      status: 'pending',
      created_at: new Date(),
      last_login: new Date(),
    });
    console.log("✅ User profile created:", user.uid, "role:", role);
  } catch (error) {
    console.error("❌ Error creating user profile:", error);
  }
};

const updateUserLastLogin = async (uid) => {
  const userRef = doc(db, "users", uid);
  try {
    await setDoc(userRef, {
      last_login: new Date(),
    }, { merge: true });
    console.log("✅ Last login updated:", uid);
  } catch (error) {
    console.error("❌ Error updating last login:", error);
  }
};

const getUserByUid = async (uid) => {
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

const updateUserRole = async (uid, role) => {
  const userRef = doc(db, "users", uid);
  try {
    await updateDoc(userRef, { role });
    console.log("✅ User role updated:", uid);
  } catch (error) {
    console.error("❌ Error updating user role:", error);
  }
};

const updateUserCompany = async (uid, companyId) => {
  const userRef = doc(db, "users", uid);
  try {
    await updateDoc(userRef, { companyId });
    console.log("✅ User company updated:", uid);
  } catch (error) {
    console.error("❌ Error updating user company:", error);
  }
};

const updateUserStatus = async (uid, status) => {
  const userRef = doc(db, "users", uid);
  try {
    await updateDoc(userRef, { status });
    console.log("✅ User status updated:", uid);
  } catch (error) {
    console.error("❌ Error updating user status:", error);
  }
};

const hasSuperAdmin = async () => {
  const q = query(collection(db, "users"), where("role", "==", "super_admin"));
  try {
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking super admin:", error);
    return false;
  }
};

module.exports = { addUserToFirestore, updateUserLastLogin, getUserByUid, updateUserRole, updateUserCompany, updateUserStatus, hasSuperAdmin };