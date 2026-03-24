const { doc, setDoc, updateDoc, getDoc, collection, query, where, getDocs } = require("firebase/firestore");
const { db } = require("../firebase");

const createSubscription = async (subscription) => {
  console.log('createSubscription db:', db && db._app && db._app.options ? 'ok' : db);
  const subRef = doc(db, "subscriptions", subscription.subscriptionId);
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);
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

const getSubscriptionById = async (subscriptionId) => {
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

const updateSubscriptionStatus = async (subscriptionId, status) => {
  const subRef = doc(db, "subscriptions", subscriptionId);
  try {
    await updateDoc(subRef, { status });
    console.log("✅ Subscription status updated:", subscriptionId);
  } catch (error) {
    console.error("❌ Error updating subscription status:", error);
  }
};

const getSubscriptionsByCompany = async (companyId) => {
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

module.exports = { createSubscription, getSubscriptionById, updateSubscriptionStatus, getSubscriptionsByCompany };