import {
  doc,
  runTransaction,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Registration,
  BranchCode,
  PriorKnowledgeLevel,
  BRANCH_TO_PIN_PREFIX,
} from '@/types';

export interface CreateRegistrationData {
  fullName: string;
  pin: string; // e.g. 26054-cs-038
  phoneNumber: string;
  branch: BranchCode;
  priorKnowledge: PriorKnowledgeLevel;
  learningExpectations?: string;
}

// PIN regex pattern validation (case-insensitive for prefixes: cs|ec|bm|mee|ei|es|cps|ai|ccb|sct)
export const PIN_REGEX = /^26054-(cs|ec|bm|mee|ei|es|cps|ai|ccb|sct)-0[0-9]{2}$/i;

export const validateBranchAndPin = (
  branch: BranchCode,
  pin: string
): { valid: boolean; error?: string } => {
  const normalizedPin = pin.trim().toLowerCase();

  if (!PIN_REGEX.test(normalizedPin)) {
    return {
      valid: false,
      error: 'Invalid PIN format. Expected format: 26054-[prefix]-0XX (e.g., 26054-cs-038)',
    };
  }

  const expectedPrefix = BRANCH_TO_PIN_PREFIX[branch];
  const expectedPattern = new RegExp(`^26054-${expectedPrefix}-0[0-9]{2}$`);

  if (!expectedPattern.test(normalizedPin)) {
    return {
      valid: false,
      error: `PIN prefix does not match selected branch (${branch.toUpperCase()}). Expected prefix: 26054-${expectedPrefix}-`,
    };
  }

  return { valid: true };
};

/**
 * Atomic registration creation & PIN reservation using Firestore transaction.
 */
export const registerStudent = async (
  uid: string,
  data: CreateRegistrationData
): Promise<Registration> => {
  const normalizedPin = data.pin.trim().toLowerCase();

  // Validate client side before attempting transaction
  const validation = validateBranchAndPin(data.branch, normalizedPin);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid PIN validation.');
  }

  const regRef = doc(db, 'registrations', uid);
  const pinRef = doc(db, 'pins', normalizedPin);

  await runTransaction(db, async (transaction) => {
    // 1. Check if PIN is already claimed
    const pinSnap = await transaction.get(pinRef);
    if (pinSnap.exists()) {
      throw new Error(`PIN '${normalizedPin}' has already been registered by another student.`);
    }

    // 2. Check if student registration already exists
    const regSnap = await transaction.get(regRef);
    if (regSnap.exists()) {
      throw new Error('You have already submitted a registration with this account.');
    }

    // 3. Atomically reserve PIN
    transaction.set(pinRef, {
      uid,
      createdAt: serverTimestamp(),
    });

    // 4. Atomically create Registration document
    transaction.set(regRef, {
      fullName: data.fullName.trim(),
      pin: normalizedPin,
      phoneNumber: data.phoneNumber.trim(),
      branch: data.branch,
      priorKnowledge: data.priorKnowledge,
      learningExpectations: (data.learningExpectations || '').trim(),
      paymentStatus: 'pending',
      registrationStatus: 'pending',
      ticketStatus: 'unissued',
      ticketId: null,
      attendance: {
        day1: { checkedIn: false, timestamp: null, scannerUid: null },
        day2: { checkedIn: false, timestamp: null, scannerUid: null },
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  // Fetch created doc to return clean state
  const createdSnap = await getDoc(regRef);
  return { id: createdSnap.id, ...createdSnap.data() } as Registration;
};

/**
 * Fetch current student's registration document.
 */
export const getStudentRegistration = async (uid: string): Promise<Registration | null> => {
  const regRef = doc(db, 'registrations', uid);
  const snap = await getDoc(regRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Registration;
};
