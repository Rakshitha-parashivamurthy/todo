import { useState, useEffect } from 'react';
import {
  getCompanyInvites,
  deleteInvite,
  getCompanyUsers
} from '../../repos/firestoreInvites';
import {
  inviteUserToCompany,
  createUserDirectly,
  deleteUserFromCompany
} from '../../adminService';
import { Users, Mail, Trash2, Send, UserPlus } from 'lucide-react';

interface CompanyUser {
  uid: string;
  email: string;
  username: string;
  role: string;
  status: string;
}

interface PendingInvite {
  inviteId: string;
  email: string;
  status: string;
  createdAt: Date;
}

const ManageUsers = ({ companyId }: { companyId: string | null }) => {
  const [email, setEmail] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createUsername, setCreateUsername] = useState('');

  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [createMessage, setCreateMessage] = useState('');

  useEffect(() => {
    if (companyId) loadData();
  }, [companyId]);

  const loadData = async () => {
    if (!companyId) return;
    try {
      const [invitesData, usersData] = await Promise.all([
        getCompanyInvites(companyId),
        getCompanyUsers(companyId),
      ]);
      setInvites(invitesData as any);
      setUsers(usersData as CompanyUser[]);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ INVITE USER
  const handleInviteUser = async () => {
    if (!email) return setMessage('Enter email');
    if (!companyId) return;

    setIsLoading(true);
    try {
      await inviteUserToCompany(companyId, email);
      setMessage(`✓ Invite sent to ${email}`);
      setEmail('');
      loadData();
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ CREATE USER
  const handleCreateUser = async () => {
    if (!createEmail || !createPassword)
      return setCreateMessage('Enter email & password');

    setIsLoading(true);
    try {
      await createUserDirectly(companyId!, createEmail, createPassword, createUsername);
      setCreateMessage('✓ User created');
      setCreateEmail('');
      setCreatePassword('');
      setCreateUsername('');
      loadData();
    } catch (e: any) {
      setCreateMessage(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ DELETE USER (FIXED)
  const handleDeleteUser = async (user: CompanyUser) => {
    if (user.role === 'admin') {
      alert('Admin cannot be deleted');
      return;
    }

    if (!confirm(`Delete ${user.email}?`)) return;

    await deleteUserFromCompany(user.uid);
    loadData();
  };

  // ✅ DELETE INVITE
  const handleRemoveInvite = async (id: string) => {
    await deleteInvite(id);
    loadData();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <Users size={30} className="text-purple-600" />
        <h1 className="text-3xl font-bold">Manage Company Users</h1>
      </div>

      {/* INVITE SECTION */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-bold mb-3">Invite User</h2>

        <div className="flex gap-3">
          <input
            className="flex-1 border p-3 rounded"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            onClick={handleInviteUser}
            className="bg-purple-600 text-white px-5 rounded flex items-center gap-2"
          >
            <Send size={16} /> Invite
          </button>
        </div>

        <p className="mt-2 text-sm">{message}</p>
      </div>

      {/* CREATE USER */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-bold mb-3">Create User</h2>

        <div className="grid grid-cols-3 gap-3">
          <input
            placeholder="Username"
            className="border p-3 rounded"
            value={createUsername}
            onChange={(e) => setCreateUsername(e.target.value)}
          />

          <input
            placeholder="Email"
            className="border p-3 rounded"
            value={createEmail}
            onChange={(e) => setCreateEmail(e.target.value)}
          />

          <input
            placeholder="Password"
            className="border p-3 rounded"
            value={createPassword}
            onChange={(e) => setCreatePassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleCreateUser}
          className="mt-4 bg-green-600 text-white px-5 py-2 rounded flex items-center gap-2"
        >
          <UserPlus size={16} /> Create
        </button>

        <p className="mt-2 text-sm">{createMessage}</p>
      </div>

      {/* USERS LIST */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-bold mb-3">
          Active Users ({users.length})
        </h2>

        {users.map((user) => (
          <div
            key={user.uid}
            className="flex justify-between items-center p-3 border rounded mb-2"
          >
            <div>
              <p className="font-semibold">{user.username}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-xs">
                {user.role} • {user.status}
              </p>
            </div>

            {/* ✅ DELETE BUTTON FIXED */}
            <button
              onClick={() => handleDeleteUser(user)}
              className="text-red-600 hover:bg-red-100 p-2 rounded"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* INVITES LIST */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-3">
          Pending Invites ({invites.length})
        </h2>

        {invites.map((invite) => (
          <div
            key={invite.inviteId}
            className="flex justify-between items-center p-3 border rounded mb-2"
          >
            <div className="flex gap-2 items-center">
              <Mail size={16} />
              <div>
                <p>{invite.email}</p>
                <p className="text-xs text-gray-500">
                  {new Date(invite.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleRemoveInvite(invite.inviteId)}
              className="text-red-600 hover:bg-red-100 p-2 rounded"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ManageUsers;