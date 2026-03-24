const { doc, setDoc, updateDoc, getDoc, collection, query, where, getDocs } = require("firebase/firestore");
const { db } = require("../firebase");

const createCompany = async (company) => {
  const companyRef = doc(db, "companies", company.companyId);
  try {
    await setDoc(companyRef, {
      companyName: company.companyName,
      adminId: company.adminId,
      subscriptionId: company.subscriptionId,
      createdAt: new Date(),
      status: 'pending',
    });
    console.log("✅ Company created (pending approval):", company.companyId);
  } catch (error) {
    console.error("❌ Error creating company:", error);
  }
};

const getCompanyById = async (companyId) => {
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

const updateCompanyStatus = async (companyId, status) => {
  const companyRef = doc(db, "companies", companyId);
  try {
    await updateDoc(companyRef, { status });
    console.log("✅ Company status updated:", companyId);
  } catch (error) {
    console.error("❌ Error updating company status:", error);
  }
};

const getCompaniesByAdmin = async (adminId) => {
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

const getPendingCompanies = async () => {
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

module.exports = { createCompany, getCompanyById, updateCompanyStatus, getCompaniesByAdmin, getPendingCompanies };