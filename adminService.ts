import { auth, db } from "./firebase";
import { doc, deleteDoc } from "firebase/firestore";

const API_URL = "http://localhost:5000/api";

export interface InviteResponse {
  success: boolean;
  inviteId: string;
  message: string;
}

// ✅ INVITE USER (NOW USES BACKEND → EMAIL WILL BE SENT)
export const inviteUserToCompany = async (
  companyId: string,
  email: string
): Promise<InviteResponse> => {
  try {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(`${API_URL}/users/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        uid: auth.currentUser.uid,
      },
      body: JSON.stringify({
        companyId,
        email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send invite");
    }

    return {
      success: true,
      inviteId: data.inviteId,
      message: data.message || "Invite sent successfully",
    };
  } catch (error: any) {
    console.error("❌ Error inviting user:", error);
    throw new Error(error.message || "Failed to send invite");
  }
};

// ✅ CREATE USER DIRECTLY (BACKEND → FIREBASE AUTH + FIRESTORE)
export const createUserDirectly = async (
  companyId: string,
  email: string,
  password?: string,
  username?: string
): Promise<{ success: boolean; userId: string; message: string }> => {
  try {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }

    const finalPassword = password || "Temp12345!";

    const response = await fetch(`${API_URL}/users/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        uid: auth.currentUser.uid,
      },
      body: JSON.stringify({
        companyId,
        email,
        password: finalPassword,
        username,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create user");
    }

    return {
      success: true,
      userId: data.userId,
      message: data.message || "User created successfully",
    };
  } catch (error: any) {
    console.error("❌ Error creating user:", error);
    throw new Error(error.message || "Failed to create user");
  }
};

// ✅ DELETE USER (CALL BACKEND IF YOU ADD DELETE API LATER)
// currently Firestore direct delete
export const deleteUserFromCompany = async (userId: string) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }

    await deleteDoc(doc(db, "users", userId));

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error: any) {
    console.error("❌ Error deleting user:", error);
    throw new Error(error.message || "Failed to delete user");
  }
};