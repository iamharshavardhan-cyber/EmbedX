import {
  collection,
  doc,
  getDocs,
  updateDoc,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Registration, UserRole, WORKSHOP_FEE } from '@/types';

/**
 * Fetch all student registrations for Admin review.
 */
export const getAllRegistrations = async (): Promise<Registration[]> => {
  const regRef = collection(db, 'registrations');
  const q = query(regRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Registration[];
};

/**
 * Generate cryptographically robust unique Ticket ID.
 * Avoids weak 4-digit collision schemes.
 * Format: EMBEDX-2026-[BRANCH]-[HASH]
 */
export const generateUniqueTicketId = (branch: string): string => {
  const randomHash = Array.from(crypto.getRandomValues(new Uint8Array(5)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  return `EMBEDX-2026-${branch.toUpperCase()}-${randomHash}`;
};

/**
 * Approve submitted payment and issue unique ticket ID.
 * Writes UTR to usedUtrs/{utr} to prevent re-use.
 */
export const approvePaymentAndIssueTicket = async (
  userId: string,
  branch: string,
  utr?: string
): Promise<string> => {
  const regRef = doc(db, 'registrations', userId);
  const ticketId = generateUniqueTicketId(branch);

  await updateDoc(regRef, {
    paymentStatus: 'verified',
    registrationStatus: 'verified',
    ticketStatus: 'issued',
    ticketId: ticketId,
    updatedAt: serverTimestamp(),
  });

  if (utr && utr.trim()) {
    const normalizedUtr = utr.trim().toUpperCase();
    const usedUtrRef = doc(db, 'usedUtrs', normalizedUtr);
    await setDoc(
      usedUtrRef,
      {
        uid: userId,
        verifiedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  return ticketId;
};

/**
 * Reject submitted payment with optional reason.
 */
export const rejectPayment = async (userId: string, reason?: string): Promise<void> => {
  const regRef = doc(db, 'registrations', userId);

  await updateDoc(regRef, {
    paymentStatus: 'rejected',
    registrationStatus: 'rejected',
    rejectionReason: reason?.trim() || '',
    updatedAt: serverTimestamp(),
  });
};

/**
 * Super Admin: Update user role in roles/{targetUid}.
 */
export const updateUserRole = async (targetUid: string, role: UserRole): Promise<void> => {
  const roleRef = doc(db, 'roles', targetUid);
  await setDoc(roleRef, {
    role,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

/**
 * Super Admin: Update payment config in config/payment.
 */
export const updatePaymentConfig = async (
  upiId: string,
  payeeName: string,
  amount: number,
  qrImageUrl?: string
): Promise<void> => {
  const configRef = doc(db, 'config', 'payment');
  await setDoc(configRef, {
    upiId: upiId.trim(),
    payeeName: payeeName.trim() || 'EMBEDX PCB WORKSHOP',
    amount: amount || WORKSHOP_FEE,
    expectedAmount: amount || WORKSHOP_FEE,
    currency: 'INR',
    note: 'PCB Workshop 2026 Registration',
    qrImageUrl: qrImageUrl?.trim() || '',
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

/**
 * Export registrations list as CSV download.
 */
export const exportRegistrationsCSV = (registrations: Registration[]) => {
  const headers = [
    'UID',
    'Full Name',
    'PIN',
    'Branch',
    'Phone',
    'Payment Status',
    'Registration Status',
    'Ticket Status',
    'Ticket ID',
    'Day 1 Checked In',
    'Day 2 Checked In',
  ];

  const rows = registrations.map((r) => [
    r.id,
    `"${r.fullName.replace(/"/g, '""')}"`,
    r.pin,
    r.branch.toUpperCase(),
    r.phoneNumber,
    r.paymentStatus,
    r.registrationStatus,
    r.ticketStatus,
    r.ticketId || 'N/A',
    r.attendance?.day1?.checkedIn ? 'YES' : 'NO',
    r.attendance?.day2?.checkedIn ? 'YES' : 'NO',
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `EmbedX_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
