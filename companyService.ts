import { getCompaniesByAdmin, updateCompanyStatus, getPendingCompanies, createCompany, getCompanyById, getAllCompanies, updateCompanySubscriptionId, deleteCompany } from './repos/firestoreCompanies';

// Re-export methods for convenience or add any wrappers if necessary
export {
  getCompaniesByAdmin,
  updateCompanyStatus,
  updateCompanySubscriptionId,
  getPendingCompanies,
  getAllCompanies,
  createCompany,
  getCompanyById,
  deleteCompany
};
