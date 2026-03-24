import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { Invite } from '../types';

// Create an invite for a user to join a company
export const createInvite = async (companyId: string, email: string, invitedBy: string): Promise<string> => {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Invite expires in 7 days

    const docRef = await addDoc(collection(db, 'invites'), {
      companyId,
      email,
      invitedBy,
      status: 'pending',
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating invite:', error);
    throw error;
  }
};

// Get pending invites for a company
export const getCompanyInvites = async (companyId: string): Promise<Invite[]> => {
  try {
    const q = query(collection(db, 'invites'), where('companyId', '==', companyId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      inviteId: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      expiresAt: doc.data().expiresAt?.toDate?.() || new Date(),
    })) as Invite[];
  } catch (error) {
    console.error('Error fetching company invites:', error);
    throw error;
  }
};

// Get pending invites for a user's email
export const getPendingInvitesForEmail = async (email: string): Promise<Invite[]> => {
  try {
    const q = query(
      collection(db, 'invites'),
      where('email', '==', email),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      inviteId: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      expiresAt: doc.data().expiresAt?.toDate?.() || new Date(),
    })) as Invite[];
  } catch (error) {
    console.error('Error fetching invites for email:', error);
    throw error;
  }
};

// Accept an invite and add user to company
export const acceptInvite = async (inviteId: string, userId: string): Promise<void> => {
  try {
    const inviteRef = doc(db, 'invites', inviteId);
    await updateDoc(inviteRef, {
      status: 'accepted',
      acceptedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error accepting invite:', error);
    throw error;
  }
};

// Reject an invite
export const rejectInvite = async (inviteId: string): Promise<void> => {
  try {
    const inviteRef = doc(db, 'invites', inviteId);
    await updateDoc(inviteRef, {
      status: 'rejected',
      rejectedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error rejecting invite:', error);
    throw error;
  }
};

// Delete an invite (for admins)
export const deleteInvite = async (inviteId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'invites', inviteId));
  } catch (error) {
    console.error('Error deleting invite:', error);
    throw error;
  }
};

// Get all users in a company
export const getCompanyUsers = async (companyId: string): Promise<any[]> => {
  try {
    const q = query(collection(db, 'users'), where('companyId', '==', companyId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching company users:', error);
    throw error;
  }
};
