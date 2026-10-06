import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  registerStudent,
  getStudentRegistration,
  validateBranchAndPin,
} from '@/services/registrationService';
import {
  BranchCode,
  PriorKnowledgeLevel,
  Registration,
  BRANCH_TO_PIN_PREFIX,
} from '@/types';
import {
  User,
  Phone,
  Hash,
  BookOpen,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [existingReg, setExistingReg] = useState<Registration | null>(null);
  const [fetchingReg, setFetchingReg] = useState(true);

  const [fullName, setFullName] = useState(currentUser?.displayName || '');
  const [pin, setPin] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [branch, setBranch] = useState<BranchCode>('cse');
  const [priorKnowledge, setPriorKnowledge] = useState<PriorKnowledgeLevel>('none');
  const [learningExpectations, setLearningExpectations] = useState('');

  const [pinValidationError, setPinValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    const fetchExisting = async () => {
      try {
        const reg = await getStudentRegistration(currentUser.uid);
        if (reg) {
          setExistingReg(reg);
        }
      } catch (err) {
        console.error('Failed to check existing registration:', err);
      } finally {
        setFetchingReg(false);
      }
    };
    fetchExisting();
  }, [currentUser]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPin(val);
    if (val.length >= 6) {
      const res = validateBranchAndPin(branch, val);
      setPinValidationError(res.valid ? null : res.error || 'Invalid PIN');
    } else {
      setPinValidationError(null);
    }
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBranch = e.target.value as BranchCode;
    setBranch(newBranch);
    if (pin.length >= 6) {
      const res = validateBranchAndPin(newBranch, pin);
      setPinValidationError(res.valid ? null : res.error || 'Invalid PIN');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!currentUser) {
      setSubmitError('User session invalid. Please log in again.');
      return;
    }

    const validation = validateBranchAndPin(branch, pin);
    if (!validation.valid) {
      setPinValidationError(validation.error || 'Invalid PIN validation');
      return;
    }

    setSubmitting(true);
    try {
      await registerStudent(currentUser.uid, {
        fullName,
        pin,
        phoneNumber,
        branch,
        priorKnowledge,
        learningExpectations,
      });
      navigate('/payment');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setSubmitError(err.message || 'Failed to complete registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentBadgeClass = (status: string) => {
    if (status === 'verified') return 'badge badge-success';
    if (status === 'submitted') return 'badge badge-warning';
    return 'badge badge-neutral';
  };

  if (fetchingReg) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p className="text-sm text-gray-400">Loading registration details...</p>
      </div>
    );
  }

  if (existingReg) {
    return (
      <div className="page-wrap bg-[#050508]">
        <div className="page-medium">
          <div className="card-elevated p-8 sm:p-10 space-y-8 border border-[#242436] bg-[#0f0f16]">
            <div className="flex items-start gap-4 pb-6 border-b border-[#1f1f2e]">
              <div className="p-3 rounded-full bg-[#FF2D2D]/10 border border-[#FF2D2D]/30">
                <CheckCircle2 className="w-6 h-6 text-[#FF2D2D]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Registration already complete</h1>
                <p className="text-sm text-gray-400 mt-1">
                  PIN reserved: <span className="font-mono font-bold text-[#FF2D2D]">{existingReg.pin}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 card-surface p-6 bg-[#0a0a10] border-[#222234]">
              <div>
                <span className="form-label mb-1 text-gray-400">Student Name</span>
                <span className="font-semibold text-white">{existingReg.fullName}</span>
              </div>
              <div>
                <span className="form-label mb-1 text-gray-400">Branch</span>
                <span className="font-semibold text-white">
                  {existingReg.branch.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="form-label mb-1 text-gray-400">Phone Number</span>
                <span className="font-semibold text-white">{existingReg.phoneNumber}</span>
              </div>
              <div>
                <span className="form-label mb-1 text-gray-400">Payment Status</span>
                <span className={paymentBadgeClass(existingReg.paymentStatus)}>
                  {existingReg.paymentStatus}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/payment')} className="btn-pill flex-1">
                <span>Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {existingReg.ticketStatus === 'issued' && (
                <button onClick={() => navigate('/ticket')} className="btn-pill-outline flex-1 border-[#2e2e42] hover:border-white">
                  View Ticket & QR Code
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const expectedPrefix = BRANCH_TO_PIN_PREFIX[branch];

  return (
    <div className="page-wrap bg-[#050508]">
      <div className="page-medium">
        <div className="card-elevated p-8 sm:p-10 border border-[#242436] bg-[#0f0f16]">
          <div className="mb-10 pb-8 border-b border-[#1f1f2e]">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="step-badge">Step 1 of 2 — Student Identity</span>
              <span className="text-xs font-bold text-[#FF2D2D] bg-[#FF2D2D]/10 px-3 py-1 rounded-full border border-[#FF2D2D]/30">
                For 1st Year Students Only
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
              Workshop registration
            </h1>
            <p className="text-sm text-gray-400 mt-3">
              Provide your college identity details and reserve your unique PIN for entry.
            </p>
          </div>

          {submitError && (
            <div className="alert-error mb-6">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="form-label text-gray-400">Full Name (as per College ID)</label>
                <div className="input-with-icon">
                  <User className="input-icon text-gray-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="input-clean bg-[#09090e] border-[#222234] text-white focus:border-[#FF2D2D]"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-gray-400">Branch / Department</label>
                <select value={branch} onChange={handleBranchChange} className="input-clean bg-[#09090e] border-[#222234] text-white focus:border-[#FF2D2D]">
                  <option value="cse">Computer Science Engineering (CSE)</option>
                  <option value="ece">Electronics and Communication Engineering (ECE)</option>
                  <option value="bme">Biomedical Engineering (BME)</option>
                  <option value="mee">Multimedia Electronics Engineering (MEE)</option>
                  <option value="ei">Electronics and Instrumentation Engineering (EI)</option>
                  <option value="es">Embedded Systems Engineering (ES)</option>
                  <option value="cps">Cyber Physical Systems and Security (CPS)</option>
                  <option value="aiml">Artificial Intelligence and Machine Learning (AIML)</option>
                  <option value="ccb">Cloud Computing and Big Data (CCB)</option>
                  <option value="sct">Semi-Conductor Technology (SCT)</option>
                </select>
              </div>

              <div>
                <label className="form-label text-gray-400">College PIN Number</label>
                <p className="text-xs text-gray-400 mb-2 font-mono">
                  Pattern for {branch.toUpperCase()}:{' '}
                  <span className="font-bold text-[#FF2D2D]">26054-{expectedPrefix}-0XX</span> (case free)
                </p>
                <div className="input-with-icon">
                  <Hash className="input-icon text-gray-500" />
                  <input
                    type="text"
                    required
                    value={pin}
                    onChange={handlePinChange}
                    placeholder={`26054-${expectedPrefix}-038`}
                    className={`input-clean bg-[#09090e] border-[#222234] text-white font-mono focus:border-[#FF2D2D] ${pinValidationError ? 'input-error' : ''}`}
                  />
                </div>
                {pinValidationError && (
                  <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{pinValidationError}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="form-label text-gray-400">Phone Number (WhatsApp)</label>
                <div className="input-with-icon">
                  <Phone className="input-icon text-gray-500" />
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="9876543210"
                    className="input-clean bg-[#09090e] border-[#222234] text-white focus:border-[#FF2D2D]"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-gray-400">Prior Electronics / PCB Knowledge</label>
                <div className="input-with-icon">
                  <BookOpen className="input-icon text-gray-500" />
                  <select
                    value={priorKnowledge}
                    onChange={(e) => setPriorKnowledge(e.target.value as PriorKnowledgeLevel)}
                    className="input-clean bg-[#09090e] border-[#222234] text-white focus:border-[#FF2D2D]"
                  >
                    <option value="none">None (Complete Beginner)</option>
                    <option value="basic">Basic (Circuit theory / Breadboard)</option>
                    <option value="intermediate">Intermediate (Designed schematic before)</option>
                    <option value="advanced">Advanced (Fabricated custom PCBs)</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="form-label text-gray-400">
                  Learning Expectations & Project Ideas <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <div className="input-with-icon">
                  <HelpCircle className="input-icon text-gray-500" />
                  <textarea
                    rows={3}
                    value={learningExpectations}
                    onChange={(e) => setLearningExpectations(e.target.value)}
                    placeholder="Tell us what hardware or PCB projects you want to build during the workshop (optional)..."
                    className="input-clean bg-[#09090e] border-[#222234] text-white focus:border-[#FF2D2D]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#1f1f2e] flex justify-end">
              <button
                type="submit"
                disabled={submitting || !!pinValidationError}
                className="btn-pill w-full sm:w-auto"
              >
                {submitting ? (
                  <span>Reserving PIN & Registering...</span>
                ) : (
                  <>
                    <span>Save Registration & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
