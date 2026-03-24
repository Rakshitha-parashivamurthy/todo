import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";

// Add Tag
export const addTagToFirestore = async (tag: any, companyId: string) => {
  if (!auth.currentUser) {
    console.error("❌ No user logged in");
    return;
  }

  try {
    await setDoc(doc(db, "tags", tag.id), {
      ...tag,
      userId: auth.currentUser.uid,
      companyId,
      createdAt: tag.createdAt ? new Date(tag.createdAt) : new Date(),
    });

    console.log("✅ Tag added to Firestore with custom ID");
  } catch (error) {
    console.error("❌ Error adding tag:", error);
  }
};

// Listen to User Tags
export const listenToUserTags = (
  userId: string,
  companyId: string,
  callback: (tags: any[]) => void
) => {
  console.log("🔍 Setting up Firestore listener for user tags:", userId);
  const q = query(
    collection(db, "tags"),
    where("userId", "==", userId),
    where("companyId", "==", companyId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      console.log("📦 Firestore tags snapshot received, docs count:", snapshot.docs.length);
      const tags = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || new Date().toISOString(),
        };
      });

      console.log("📤 Tags to send to callback:", tags);
      callback(tags);
    },
    (error) => {
      console.error("❌ Firestore listener error:", error);
    }
  );
};

// Delete Tag
export const deleteTagFromFirestore = async (id: string) => {
  try {
    await deleteDoc(doc(db, "tags", id));
    console.log("✅ Tag deleted from Firestore:", id);
  } catch (error) {
    console.error("❌ Error deleting tag:", error);
  }
};

// Update Tag
export const updateTagInFirestore = async (id: string, data: any) => {
  const updateData = { ...data };

  if (updateData.createdAt && typeof updateData.createdAt === "string") {
    updateData.createdAt = new Date(updateData.createdAt);
  }

  try {
    console.log("⏳ Updating tag:", id, updateData);
    await setDoc(doc(db, "tags", id), updateData, { merge: true });
    console.log("✅ Tag updated in Firestore:", updateData);
  } catch (error) {
    console.error("❌ Error updating tag:", error);
  }
};
