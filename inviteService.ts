import { auth } from './firebase';
import { API_URL } from './apiConfig';

export interface Invite {
  inviteId: string;
  companyId: string;
  email: string;
  invitedBy: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

// ✅ Get pending invites
export const getPendingInvites = async (email: string): Promise<Invite[]> => {
  try {
    if (!email) return [];

    const response = await fetch(
      `${API_URL}/users/invites?email=${encodeURIComponent(email)}`
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to fetch invites");
    }

    const data = await response.json();
    return data.invites || [];
  } catch (error) {
    console.error("❌ Error fetching invites:", error);
    return [];
  }
};

// ✅ Accept invite
export const acceptInvite = async (inviteId: string) => {
  try {
    if (!inviteId) {
      throw new Error("Invite ID is required");
    }

    if (!auth.currentUser?.uid) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(`${API_URL}/users/accept-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        uid: auth.currentUser.uid,
      },
      body: JSON.stringify({ inviteId }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to accept invite");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("❌ Accept invite error:", error);
    throw new Error(error.message || "Something went wrong");
  }
};