import { doc, setDoc, updateDoc, getDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export const createCompany = async (company: { companyId: string; companyName: string; adminId: string; subscriptionId: string }) => {
  const companyRef = doc(db, "companies", company.companyId);
  try {
    await setDoc(companyRef, {
      companyName: company.companyName,
      adminId: company.adminId,
      subscriptionId: company.subscriptionId,
      createdAt: new Date(),
      status: 'pending',
    });
    console.log("✅ Company created (pending):", company.companyId);
  } catch (error) {
    console.error("❌ Error creating company:", error);
  }
};

export const getCompanyById = async (companyId: string) => {
  const companyRef = doc(db, "companies", companyId);
  try {
    const docSnap = await getDoc(companyRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such company!");
      return null;
    }
  } catch (error) {
    console.error("Error getting company:", error);
    return null;
  }
};

export const updateCompanyStatus = async (companyId: string, status: 'pending' | 'pending_approval' | 'active') => {
  const companyRef = doc(db, "companies", companyId);
  try {
    await updateDoc(companyRef, { status });
    console.log("✅ Company status updated:", companyId);
  } catch (error) {
    console.error("❌ Error updating company status:", error);
  }
};

export const updateCompanySubscriptionId = async (companyId: string, subscriptionId: string) => {
  const companyRef = doc(db, "companies", companyId);
  try {
    await updateDoc(companyRef, { subscriptionId });
    console.log("✅ Company subscriptionId updated:", companyId, subscriptionId);
  } catch (error) {
    console.error("❌ Error updating company subscriptionId:", error);
  }
};

export const getCompaniesByAdmin = async (adminId: string) => {
  const q = query(collection(db, "companies"), where("adminId", "==", adminId));
  try {
    const querySnapshot = await getDocs(q);
    const companies = [];
    querySnapshot.forEach((doc) => {
      companies.push({ companyId: doc.id, ...doc.data() });
    });
    return companies;
  } catch (error) {
    console.error("Error getting companies by admin:", error);
    return [];
  }
};

export const getPendingCompanies = async () => {
  const q = query(collection(db, "companies"), where("status", "==", "pending_approval"));
  try {
    const querySnapshot = await getDocs(q);
    const companies = [];
    querySnapshot.forEach((doc) => {
      companies.push({ companyId: doc.id, ...doc.data() });
    });
    return companies;
  } catch (error) {
    console.error("Error getting pending companies:", error);
    return [];
  }
};

export const getAllCompanies = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "companies"));
    const companies: any[] = [];
    querySnapshot.forEach((doc) => {
      companies.push({ companyId: doc.id, ...doc.data() });
    });
    return companies;
  } catch (error) {
    console.error("Error getting all companies:", error);
    return [];
  }
};

export const deleteCompany = async (companyId: string) => {
  const companyRef = doc(db, "companies", companyId);
  try {
    await deleteDoc(companyRef);
    console.log("✅ Company deleted:", companyId);
  } catch (error) {
    console.error("❌ Error deleting company:", error);
    throw error;
  }
};