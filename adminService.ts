import { auth, db } from "./firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { API_URL } from "./apiConfig";

export interface InviteResponse {
  success: boolean;
  inviteId: string;
  message: string;
}

// ✅ INVITE USER (BACKEND → EMAIL)
export const inviteUserToCompany = async (
  companyId: string,
  email: string
): Promise<InviteResponse> => {
  try {
    if (!auth.currentUser?.uid) {
      throw new Error("User not authenticated");
    }

    if (!companyId || !email) {
      throw new Error("Company ID and email are required");
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

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to send invite");
    }

    const data = await response.json();

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

// ✅ CREATE USER DIRECTLY
export const createUserDirectly = async (
  companyId: string,
  email: string,
  password?: string,
  username?: string
): Promise<{ success: boolean; userId: string; message: string }> => {
  try {
    if (!auth.currentUser?.uid) {
      throw new Error("User not authenticated");
    }

    if (!companyId || !email) {
      throw new Error("Company ID and email are required");
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

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to create user");
    }

    const data = await response.json();

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

// ✅ DELETE USER (Firestore for now)
export const deleteUserFromCompany = async (userId: string) => {
  try {
    if (!auth.currentUser?.uid) {
      throw new Error("User not authenticated");
    }

    if (!userId) {
      throw new Error("User ID is required");
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