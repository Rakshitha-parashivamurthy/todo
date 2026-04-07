import { useEffect, useState } from 'react';
import { getAllCompanies, updateCompanyStatus, deleteCompany } from './companyService';
import { getSubscriptionsByCompany, updateSubscriptionStatus, deleteSubscription } from './repos/firestoreSubscriptions';
import { getAllUsers, updateUserStatus, deleteUser } from './repos/firestoreUsers';

interface Company {
  companyId: string;
  companyName: string;
  adminId: string;
  status: string;
  subscriptionId?: string;
}

interface UserInfo {
  uid: string;
  email?: string;
  username?: string;
  role?: string;
  status?: string;
  companyId?: string;
}

const SuperAdminDashboard = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const companyData = await getAllCompanies();
      setCompanies(companyData as Company[]);

      const userData = await getAllUsers();
      setUsers(userData as UserInfo[]);
    } catch (error) {
      console.error('Error fetching super admin data', error);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const handleExportCompanies = () => {
    exportToCSV(companies, `companies-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportUsers = () => {
    exportToCSV(users, `users-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const approveCompany = async (company: Company) => {
    try {
      await updateCompanyStatus(company.companyId, 'active');

      const subs = await getSubscriptionsByCompany(company.companyId);
      if (subs && subs.length > 0) {
        for (const sub of subs) {
          await updateSubscriptionStatus(sub.subscriptionId, 'active');
        }
      }

      await updateUserStatus(company.adminId, 'active');

      alert('Company approved and user activated.');
      fetchData();
    } catch (error) {
      console.error('Error approving', error);
      alert('Error approving.');
    }
  };

  const deleteCompanyData = async (company: Company) => {
    if (!confirm(`Are you sure you want to delete company "${company.companyName}"? This action cannot be undone and will also delete all associated subscriptions.`)) {
      return;
    }

    try {
      // Delete associated subscriptions first
      const subs = await getSubscriptionsByCompany(company.companyId);
      if (subs && subs.length > 0) {
        for (const sub of subs) {
          await deleteSubscription(sub.subscriptionId);
        }
      }

      await deleteCompany(company.companyId);
      alert('Company and associated subscriptions deleted successfully.');
      fetchData();
    } catch (error) {
      console.error('Error deleting company', error);
      alert('Error deleting company.');
    }
  };

  const deleteUserData = async (user: UserInfo) => {
    if (!confirm(`Are you sure you want to delete user "${user.username || user.email}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteUser(user.uid);
      alert('User deleted successfully.');
      fetchData();
    } catch (error) {
      console.error('Error deleting user', error);
      alert('Error deleting user.');
    }
  };

  return (
    <div className="p-8 pb-32 max-w-6xl mx-auto dark:text-white">
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight dark:text-white">Super Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage companies, admins, and users with clear roles and permissions.</p>
      </header>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold dark:text-white">Companies</h2>
          <button
            onClick={handleExportCompanies}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition"
          >
            Export CSV
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.map((company) => (
            <div key={company.companyId} className="rounded-2xl border bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 p-5 shadow-sm hover:shadow-md transition">
              <p className="text-lg font-semibold dark:text-white">{company.companyName}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Company ID: {company.companyId}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Admin ID: {company.adminId}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Status: {company.status}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Subscription: {company.subscriptionId || 'N/A'}</p>

              <div className="mt-4 flex gap-2">
                <button
                  className="px-3 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition"
                  onClick={() => approveCompany(company)}
                >
                  Approve
                </button>
                <button
                  className="px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
                  onClick={() => deleteCompanyData(company)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {companies.length === 0 && <p className="text-slate-500 dark:text-slate-400">No companies found.</p>}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold dark:text-white">All Users</h2>
          <button
            onClick={handleExportUsers}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition"
          >
            Export CSV
          </button>
        </div>
        <div className="overflow-auto rounded-2xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900">
              <tr>
                <th className="px-4 py-3 text-slate-900 dark:text-white font-semibold">Username</th>
                <th className="px-4 py-3 text-slate-900 dark:text-white font-semibold">Email</th>
                <th className="px-4 py-3 text-slate-900 dark:text-white font-semibold">Role</th>
                <th className="px-4 py-3 text-slate-900 dark:text-white font-semibold">Status</th>
                <th className="px-4 py-3 text-slate-900 dark:text-white font-semibold">Company ID</th>
                <th className="px-4 py-3 text-slate-900 dark:text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.uid} className="border-b border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-700 transition">
                  <td className="px-4 py-3 text-slate-900 dark:text-white">{user.username || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-900 dark:text-white">{user.email || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-900 dark:text-white capitalize">{user.role || 'user'}</td>
                  <td className="px-4 py-3 text-slate-900 dark:text-white capitalize">{user.status || 'unknown'}</td>
                  <td className="px-4 py-3 text-slate-900 dark:text-white">{user.companyId || '-'}</td>
                  <td className="px-4 py-3">
                    <button
                      className="px-3 py-1 rounded bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition"
                      onClick={() => deleteUserData(user)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default SuperAdminDashboard;