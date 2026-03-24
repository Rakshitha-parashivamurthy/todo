import { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { AlertDialog } from './AlertDialog';
import { Mail, CheckCircle } from 'lucide-react';

interface Invite {
  inviteId: string;
  email: string;
  companyId: string;
  invitedBy: string;
}

interface InvitePromptProps {
  email: string | null | undefined;
  onInviteAccepted?: () => void;
}

const API_URL = "http://localhost:5000/api";

const InvitePrompt = ({ email, onInviteAccepted }: InvitePromptProps) => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (email) {
      loadInvites();
    }
  }, [email]);

  // ✅ FETCH INVITES FROM BACKEND
  const loadInvites = async () => {
    try {
      const res = await fetch(`${API_URL}/users/invites?email=${email}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setInvites(data.invites || []);
      setSelectedInvite(data.invites?.[0] || null);
    } catch (error) {
      console.error("❌ Error loading invites:", error);
    }
  };

  // ✅ ACCEPT INVITE (BACKEND)
  const handleAcceptInvite = async () => {
    if (!selectedInvite) return;

    setIsAccepting(true);
    try {
      const res = await fetch(`${API_URL}/users/accept-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          uid: auth.currentUser?.uid || "",
        },
        body: JSON.stringify({
          inviteId: selectedInvite.inviteId,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // ✅ remove accepted invite safely
      const updatedInvites = invites.filter(
        (i) => i.inviteId !== selectedInvite.inviteId
      );

      setInvites(updatedInvites);
      setSelectedInvite(updatedInvites[0] || null);

      onInviteAccepted?.();

    } catch (error) {
      console.error("❌ Error accepting invite:", error);
      alert("Failed to accept invite. Try again.");
    } finally {
      setIsAccepting(false);
    }
  };

  // ✅ SKIP INVITE
  const handleSkip = () => {
    if (!selectedInvite) return;

    const updatedInvites = invites.filter(
      (i) => i.inviteId !== selectedInvite.inviteId
    );

    setInvites(updatedInvites);
    setSelectedInvite(updatedInvites[0] || null);
  };

  if (!selectedInvite) return null;

  return (
    <AlertDialog
      isOpen={true}
      title="Company Invitation"
      message={
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-neutral-700">
            <Mail size={20} className="text-purple-600" />
            <span>You’ve been invited to join a company!</span>
          </div>

          <p className="text-sm text-neutral-600">
            Invited by:{" "}
            <span className="font-semibold">
              {selectedInvite.invitedBy}
            </span>
          </p>

          <p className="text-sm text-neutral-500">
            Accept this invitation to access your company workspace.
          </p>
        </div>
      }
      onConfirm={handleAcceptInvite}
      onCancel={handleSkip}
      confirmText={isAccepting ? "Accepting..." : "Accept Invitation"}
      cancelText="Maybe Later"
      confirmIcon={<CheckCircle size={20} />}
    />
  );
};

export default InvitePrompt;