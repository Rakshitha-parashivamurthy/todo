import { useEffect, useState } from 'react';
import { getPendingCompanies, updateCompanyStatus } from './companyService';
import { getSubscriptionsByCompany, updateSubscriptionStatus } from './repos/firestoreSubscriptions';
import { updateUserStatus } from './repos/firestoreUsers';

interface Company {
  companyId: string;
  companyName: string;
  adminId: string;
  status: string;
}

const SuperAdminDashboard = () => {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    fetchPendingCompanies();
  }, []);

  const fetchPendingCompanies = async () => {
    try {
      const data = await getPendingCompanies();
      setCompanies(data as Company[]);
    } catch (error) {
      console.error('Error fetching companies');
    }
  };

  const approveCompany = async (company: Company) => {
    try {
      // 1. Update company status
      await updateCompanyStatus(company.companyId, 'active');
      
      // 2. Update subscription status
      const subs = await getSubscriptionsByCompany(company.companyId);
      if (subs && subs.length > 0) {
        // usually only one
        for (const sub of subs) {
          await updateSubscriptionStatus(sub.subscriptionId, 'active');
        }
      }

      // 3. Update admin user status
      await updateUserStatus(company.adminId, 'active');

      alert('Company approved!');
      fetchPendingCompanies();
    } catch (error) {
      console.error('Error approving', error);
      alert('Error approving');
    }
  };

  return (
    <div className="p-8 pb-32 max-w-5xl mx-auto">
      <h1 className="text-3xl font-black mb-6 tracking-tight">Super Admin Dashboard</h1>
      <h2 className="text-xl font-bold mb-4 text-neutral-600">Pending Companies</h2>
      {companies.length === 0 ? (
        <p className="text-neutral-500">No companies pending approval.</p>
      ) : (
        <ul className="space-y-4">
          {companies.map((company) => (
            <li key={company.companyId} className="flex justify-between items-center p-6 border rounded-2xl bg-white shadow-sm hover:shadow transition-shadow">
              <div>
                <p className="text-lg font-bold">{company.companyName}</p>
                <p className="text-sm text-neutral-500">Admin ID: {company.adminId}</p>
              </div>
              <button
                onClick={() => approveCompany(company)}
                className="bg-emerald-500 text-white px-6 py-3 font-bold rounded-xl shadow-lg hover:bg-emerald-600 hover:scale-105 transition-all"
              >
                Approve
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SuperAdminDashboard;