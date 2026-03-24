import { doc, setDoc, updateDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const createSubscription = async (subscription: { subscriptionId: string; companyId: string; planName: string; price: number; paymentMethod: string }) => {
  const subRef = doc(db, "subscriptions", subscription.subscriptionId);
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
  try {
    await setDoc(subRef, {
      companyId: subscription.companyId,
      planName: subscription.planName,
      price: subscription.price,
      paymentMethod: subscription.paymentMethod,
      startDate,
      endDate,
      status: 'pending_approval',
    });
    console.log("✅ Subscription created:", subscription.subscriptionId);
  } catch (error) {
    console.error("❌ Error creating subscription:", error);
  }
};

export const getSubscriptionById = async (subscriptionId: string) => {
  const subRef = doc(db, "subscriptions", subscriptionId);
  try {
    const docSnap = await getDoc(subRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such subscription!");
      return null;
    }
  } catch (error) {
    console.error("Error getting subscription:", error);
    return null;
  }
};

export const updateSubscriptionStatus = async (subscriptionId: string, status: 'pending_approval' | 'active' | 'expired') => {
  const subRef = doc(db, "subscriptions", subscriptionId);
  try {
    await updateDoc(subRef, { status });
    console.log("✅ Subscription status updated:", subscriptionId);
  } catch (error) {
    console.error("❌ Error updating subscription status:", error);
  }
};

export const getSubscriptionsByCompany = async (companyId: string) => {
  const q = query(collection(db, "subscriptions"), where("companyId", "==", companyId));
  try {
    const querySnapshot = await getDocs(q);
    const subscriptions = [];
    querySnapshot.forEach((doc) => {
      subscriptions.push({ subscriptionId: doc.id, ...doc.data() });
    });
    return subscriptions;
  } catch (error) {
    console.error("Error getting subscriptions by company:", error);
    return [];
  }
};