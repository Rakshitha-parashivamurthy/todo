import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";

// --- type definitions ---
export interface TaskHistoryEntry {
  history_id: string;
  task_id: string;
  user_id: string;
  action_type: "Created" | "Updated" | "Deleted" | "Completed";
  old_status?: string | null;
  new_status?: string | null;
  action_time: string; // ISO string
}

export interface UserSettings {
  setting_id: string;
  user_id: string;
  theme: "light" | "dark";
  notification_enabled: boolean;
  default_priority: string;
}

export interface DailyTarget {
  target_id: string;
  user_id: string;
  target_date: string; // ISO date (yyyy-MM-dd)
  target_task_count: number;
  completed_task_count: number;
  target_status: "Achieved" | "Not Achieved";
  created_at: string;
}

// --- helpers for task history ---
export const addTaskHistory = async (entry: Omit<TaskHistoryEntry, "history_id" | "action_time">) => {
  if (!auth.currentUser) {
    console.error("❌ No user logged in for history");
    return;
  }

  try {
    const historyData = {
      ...entry,
      user_id: auth.currentUser.uid,
      action_time: new Date().toISOString(),
    };
    await addDoc(collection(db, "task_history"), historyData);
    console.log("✅ Task history recorded", historyData);
  } catch (error) {
    console.error("❌ Error recording task history:", error);
  }
};

// --- settings operations ---
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  const q = query(collection(db, "settings"), where("user_id", "==", userId));
  const snapshot = await getDoc(doc(db, "settings", userId));
  if (snapshot.exists()) {
    return { setting_id: snapshot.id, ...(snapshot.data() as any) } as UserSettings;
  }
  return null;
};

export const setUserSettings = async (settings: Partial<UserSettings> & { user_id: string }) => {
  try {
    const ref = doc(db, "settings", settings.user_id);
    await setDoc(ref, {
      ...settings,
      setting_id: settings.user_id,
    });
    console.log("✅ Settings stored", settings);
  } catch (error) {
    console.error("❌ Error saving settings:", error);
  }
};

export const updateUserSettings = async (userId: string, updates: Partial<Omit<UserSettings, "setting_id" | "user_id">>) => {
  try {
    const ref = doc(db, "settings", userId);
    // Use setDoc with merge so missing document is created
    await setDoc(ref, updates as any, { merge: true });
    console.log("✅ Settings updated", updates);
  } catch (error) {
    console.error("❌ Error updating settings:", error);
  }
};

// --- daily targets operations ---
export const addDailyTarget = async (target: Omit<DailyTarget, "target_id" | "created_at" | "user_id">) => {
  if (!auth.currentUser) {
    console.error("❌ No user logged in for target");
    return;
  }
  try {
    const data = {
      ...target,
      user_id: auth.currentUser.uid,
      created_at: new Date().toISOString(),
    };
    await addDoc(collection(db, "daily_targets"), data);
    console.log("✅ Daily target added", data);
  } catch (error) {
    console.error("❌ Error adding daily target:", error);
  }
};

export const updateDailyTarget = async (targetId: string, updates: Partial<DailyTarget>) => {
  try {
    const ref = doc(db, "daily_targets", targetId);
    await updateDoc(ref, updates as any);
    console.log("✅ Daily target updated", updates);
  } catch (error) {
    console.error("❌ Error updating daily target:", error);
  }
};

export const listenToDailyTargets = (
  userId: string,
  callback: (records: DailyTarget[]) => void
) => {
  const q = query(collection(db, "daily_targets"), where("user_id", "==", userId));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ target_id: doc.id, ...(doc.data() as any) })) as DailyTarget[];
    callback(data);
  });
};

export const listenToTaskHistory = (
  userId: string,
  callback: (entries: TaskHistoryEntry[]) => void
) => {
  const q = query(collection(db, "task_history"), where("user_id", "==", userId));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ history_id: doc.id, ...(doc.data() as any) })) as TaskHistoryEntry[];
    callback(data);
  });
};

export const listenToSettings = (
  userId: string,
  callback: (settings: UserSettings | null) => void
) => {
  const ref = doc(db, "settings", userId);
  return onSnapshot(ref, (snapshot) => {
    if (snapshot.exists()) {
      callback({ setting_id: snapshot.id, ...(snapshot.data() as any) } as UserSettings);
    } else {
      callback(null);
    }
  });
};