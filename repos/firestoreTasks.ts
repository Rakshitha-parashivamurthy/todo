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

// Add Task

export const addTaskToFirestore = async (task: any) => {
  if (!auth.currentUser) {
    console.error("❌ No user logged in");
    return;
  }

  try {
    await setDoc(doc(db, "tasks", task.id), {
      ...task,
      userId: auth.currentUser.uid,
      createdAt: task.createdAt
        ? new Date(task.createdAt)
        : new Date(),
    });

    console.log("✅ Task added to Firestore with custom ID");
  } catch (error) {
    console.error("❌ Error adding task:", error);
  }
};

// Listen to User Tasks
export const listenToUserTasks = (
  userId: string,
  callback: (tasks: any[]) => void
) => {
  console.log("🔍 Setting up Firestore listener for user tasks:", userId);
  const q = query(
    collection(db, "tasks"),
    where("userId", "==", userId)   // ✅ MUST be string UID
  );

  return onSnapshot(q, (snapshot) => {
    console.log("📦 Firestore snapshot received, docs count:", snapshot.docs.length);
    const tasks = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamps to ISO strings
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || new Date().toISOString(),
        dueDate: data.dueDate?.toDate?.()?.toISOString?.() || data.dueDate || null,
        completedAt: data.completedAt?.toDate?.()?.toISOString?.() || data.completedAt || null,
      };
    });

    console.log("📤 Tasks to send to callback:", tasks);
    callback(tasks);
  }, (error) => {
    console.error("❌ Firestore listener error:", error);
  });
};

// Delete Task
export const deleteTaskFromFirestore = async (id: string) => {
  await deleteDoc(doc(db, "tasks", id));
};

// Update Task
export const updateTaskInFirestore = async (id: string, data: any) => {
  const updateData = { ...data };
  
  // Convert ISO string dates to Firestore-compatible Date objects
  if (updateData.completedAt && typeof updateData.completedAt === 'string') {
    updateData.completedAt = new Date(updateData.completedAt);
  }
  if (updateData.dueDate && typeof updateData.dueDate === 'string') {
    updateData.dueDate = new Date(updateData.dueDate);
  }
  if (updateData.createdAt && typeof updateData.createdAt === 'string') {
    updateData.createdAt = new Date(updateData.createdAt);
  }
  
  try {
    console.log("⏳ Updating task:", id, updateData);
    // Use setDoc with merge to create-or-update (handles both new and existing docs)
    await setDoc(doc(db, "tasks", id), updateData, { merge: true });
    console.log("✅ Task updated in Firestore:", updateData);
  } catch (error) {
    console.error("❌ Error updating task:", error);
  }
};