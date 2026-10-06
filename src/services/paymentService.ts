import {
  doc,
  collection,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDoc,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { SUPABASE_FUNCTIONS_URL } from '@/lib/supabase';
import { PaymentAttempt, WORKSHOP_FEE, PaymentConfig } from '@/types';

export interface SubmitPaymentParams {
  utr: string;
  file: File;
}

/**
 * Submit manual UPI payment evidence for ₹70.
 * 1. Get Firebase ID token
 * 2. Generate signed upload URL from Supabase Deno Edge Function
 * 3. Upload PNG/JPEG screenshot directly to Supabase Storage
 * 4. Create immutable payment attempt document in Firestore
 * 5. Update parent registration paymentStatus to 'submitted'
 */
export const submitPaymentEvidence = async (
  uid: string,
  params: SubmitPaymentParams
): Promise<PaymentAttempt> => {
  const normalizedUtr = params.utr.trim();
  if (normalizedUtr.length < 8) {
    throw new Error('UTR / Transaction ID must be at least 8 characters long.');
  }

  const file = params.file;
  if (!file) {
    throw new Error('Please select a payment screenshot image file.');
  }

  // Max 5 MB check
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size exceeds the 5 MB limit. Please compress or select a smaller image.');
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    throw new Error('Only PNG and JPEG file formats are supported.');
  }

  const extension = file.type.split('/')[1]?.toLowerCase() === 'png' ? 'png' : 'jpg';

  // 1. Get Firebase ID Token
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User authentication session expired. Please sign in again.');
  }
  const idToken = await currentUser.getIdToken();

  // Create unique attempt ID
  const attemptCollectionRef = collection(db, 'registrations', uid, 'paymentAttempts');
  const newAttemptDocRef = doc(attemptCollectionRef);
  const attemptId = newAttemptDocRef.id;

  // 2. Call Supabase Edge Function to get signed upload URL
  const uploadFunctionEndpoint = `${SUPABASE_FUNCTIONS_URL}/generate-payment-upload-url`;
  
  const edgeResponse = await fetch(uploadFunctionEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      attemptId,
      extension,
      contentType: file.type,
    }),
  });

  const edgeData = await edgeResponse.json();
  if (!edgeResponse.ok) {
    throw new Error(edgeData.error || 'Failed to generate payment upload URL from server.');
  }

  const { signedUrl, path } = edgeData;

  // 3. Upload file directly to Supabase Storage using signed URL
  const uploadResponse = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload payment screenshot to storage. (Status ${uploadResponse.status})`);
  }

  // 4. Create immutable payment attempt document in Firestore
  await setDoc(newAttemptDocRef, {
    utr: normalizedUtr,
    screenshotRef: path,
    expectedAmount: WORKSHOP_FEE, // FIXED AT 70
    status: 'submitted',
    submittedAt: serverTimestamp(),
  });

  // 5. Update parent registration paymentStatus
  const regRef = doc(db, 'registrations', uid);
  await updateDoc(regRef, {
    paymentStatus: 'submitted',
    lastPaymentSubmittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: attemptId,
    utr: normalizedUtr,
    screenshotRef: path,
    expectedAmount: WORKSHOP_FEE,
    status: 'submitted',
    submittedAt: new Date().toISOString(),
  };
};

/**
 * Fetch all payment attempts for a student.
 */
export const getPaymentAttempts = async (uid: string): Promise<PaymentAttempt[]> => {
  const attemptsRef = collection(db, 'registrations', uid, 'paymentAttempts');
  const q = query(attemptsRef, orderBy('submittedAt', 'desc'));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as PaymentAttempt[];
};

/**
 * Fetch payment config (UPI ID, QR Code image URL, expectedAmount 70).
 */
export const getPaymentConfig = async (): Promise<PaymentConfig | null> => {
  const configRef = doc(db, 'config', 'payment');
  const snap = await getDoc(configRef);
  if (!snap.exists()) return null;
  return snap.data() as PaymentConfig;
};

/**
 * Request admin signed view URL for screenshot preview.
 */
export const getAdminViewUrl = async (screenshotRef: string): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required.');
  }

  const idToken = await currentUser.getIdToken();
  const endpoint = `${SUPABASE_FUNCTIONS_URL}/generate-admin-view-url`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ screenshotRef }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate screenshot preview URL.');
  }

  return data.signedUrl;
};
