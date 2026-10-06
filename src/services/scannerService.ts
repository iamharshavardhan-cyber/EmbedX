import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Registration } from '@/types';

export interface AttendanceResult {
  alreadyCheckedIn: boolean;
  registration: Registration;
  message: string;
}

/**
 * Lookup registration doc by ticket ID.
 * Must verify that ticket is present and ticketStatus == 'issued'.
 */
export const lookupRegistrationByTicketId = async (ticketId: string): Promise<Registration> => {
  const cleanId = ticketId.trim();
  if (!cleanId) {
    throw new Error('Ticket ID cannot be empty.');
  }

  const regRef = collection(db, 'registrations');
  const q = query(regRef, where('ticketId', '==', cleanId));
  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error(`No registration found matching Ticket ID '${cleanId}'.`);
  }

  const docSnap = snap.docs[0];
  const reg = { id: docSnap.id, ...docSnap.data() } as Registration;

  if (reg.ticketStatus !== 'issued') {
    throw new Error(`Ticket '${cleanId}' is not in an issued state (Current status: ${reg.ticketStatus}).`);
  }

  return reg;
};

/**
 * Record Day 1 or Day 2 attendance atomically.
 * Ensures scanner UID is recorded and preserves the other day's state.
 */
export const recordAttendanceAtomically = async (
  registrationId: string,
  day: 'day1' | 'day2',
  scannerUid: string
): Promise<AttendanceResult> => {
  if (!scannerUid) {
    throw new Error('Scanner user authentication UID is required.');
  }

  const regRef = doc(db, 'registrations', registrationId);
  const snap = await getDoc(regRef);

  if (!snap.exists()) {
    throw new Error('Registration record not found.');
  }

  const currentReg = { id: snap.id, ...snap.data() } as Registration;

  if (currentReg.ticketStatus !== 'issued') {
    throw new Error('Cannot mark attendance for an unissued ticket.');
  }

  const dayAttendance = currentReg.attendance?.[day];

  // Check if already checked in
  if (dayAttendance?.checkedIn) {
    return {
      alreadyCheckedIn: true,
      registration: currentReg,
      message: `Student '${currentReg.fullName}' was already checked in for ${day === 'day1' ? 'Day 1' : 'Day 2'}.`,
    };
  }

  // Update specified day attendance atomically while preserving other day
  const updatedAttendance = {
    ...currentReg.attendance,
    [day]: {
      checkedIn: true,
      timestamp: new Date().toISOString(),
      scannerUid: scannerUid,
    },
  };

  await updateDoc(regRef, {
    [`attendance.${day}.checkedIn`]: true,
    [`attendance.${day}.timestamp`]: serverTimestamp(),
    [`attendance.${day}.scannerUid`]: scannerUid,
    updatedAt: serverTimestamp(),
  });

  const updatedReg: Registration = {
    ...currentReg,
    attendance: updatedAttendance,
  };

  return {
    alreadyCheckedIn: false,
    registration: updatedReg,
    message: `Successfully checked in '${currentReg.fullName}' for ${day === 'day1' ? 'Day 1' : 'Day 2'}!`,
  };
};
