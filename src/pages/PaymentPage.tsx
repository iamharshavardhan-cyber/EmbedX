import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getStudentRegistration } from '@/services/registrationService';
import {
  submitPaymentEvidence,
  getPaymentAttempts,
  getPaymentConfig,
} from '@/services/paymentService';
import { Registration, PaymentAttempt, PaymentConfig, WORKSHOP_FEE } from '@/types';
import {
  CreditCard,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  QrCode as QrCodeIcon,
  ArrowRight,
  ShieldCheck,
  IndianRupee,
} from 'lucide-react';

export const PaymentPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [attempts, setAttempts] = useState<PaymentAttempt[]>([]);
  const [config, setConfig] = useState<PaymentConfig | null>(null);

  const [loading, setLoading] = useState(true);
  const [utr, setUtr] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      try {
        const reg = await getStudentRegistration(currentUser.uid);
        setRegistration(reg);

        if (reg) {
          const attemptList = await getPaymentAttempts(currentUser.uid);
          setAttempts(attemptList);
        }

        const paymentCfg = await getPaymentConfig();
        setConfig(paymentCfg);
      } catch (err) {
        console.error('Error loading payment data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Selected image exceeds 5 MB limit. Please select a smaller screenshot.');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setError('Only PNG and JPEG file formats are accepted.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!currentUser) {
      setError('Authentication session missing. Please log in.');
      return;
    }

    if (!selectedFile) {
      setError('Please select a payment screenshot image file.');
      return;
    }

    if (utr.trim().length < 8) {
      setError('Please enter a valid 12-digit UPI UTR / Transaction Reference Number.');
      return;
    }

    setSubmitting(true);
    try {
      const newAttempt = await submitPaymentEvidence(currentUser.uid, {
        utr,
        file: selectedFile,
      });

      setSuccessMsg('Payment evidence submitted successfully! Admin will verify your payment shortly.');
      setAttempts((prev) => [newAttempt, ...prev]);

      if (registration) {
        setRegistration({
          ...registration,
          paymentStatus: 'submitted',
        });
      }

      setUtr('');
      setSelectedFile(null);
      setFilePreview(null);
    } catch (err: any) {
      console.error('Payment submission error:', err);
      setError(err.message || 'Failed to submit payment evidence.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'verified') return 'badge badge-success';
    if (status === 'submitted') return 'badge badge-warning';
    if (status === 'rejected') return 'badge badge-error';
    return 'badge badge-neutral';
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p className="text-sm text-gray-400">Loading payment details...</p>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="page-wrap flex items-center justify-center bg-[#050508]">
        <div className="page-narrow w-full">
          <div className="card-elevated p-10 text-center space-y-6 border border-[#242436] bg-[#0f0f16]">
            <AlertCircle className="w-12 h-12 text-[#FF2D2D] mx-auto" />
            <h1 className="text-2xl font-black text-white">Registration required first</h1>
            <p className="text-sm text-gray-400">
              You must register your student identity and college PIN before submitting payment
              evidence.
            </p>
            <button onClick={() => navigate('/register')} className="btn-pill inline-flex">
              <span>Go to Registration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap bg-[#050508]">
      <div className="page-wide">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF2D2D]/10 text-[#FF2D2D] text-xs font-bold uppercase tracking-wider mb-3 border border-[#FF2D2D]/30">
            Step 2 of 2 — Workshop Fee
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Payment Verification</h1>
          <p className="text-gray-400 mt-2">Complete your workshop registration with UPI payment.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="card-elevated p-6 space-y-4 border border-[#242436] bg-[#0f0f16]">
              <span className="form-label text-gray-400">Workshop Fee</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">₹{WORKSHOP_FEE}</span>
                <span className="text-xs text-gray-400">/ student</span>
              </div>
              <div className="text-sm text-gray-300 space-y-2 pt-4 border-t border-[#1f1f2e]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF2D2D] shrink-0" />
                  <span>Hands-on PCB Design Workshop</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF2D2D] shrink-0" />
                  <span>Physical Board & Components</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF2D2D] shrink-0" />
                  <span>Verification QR Entry Ticket</span>
                </div>
              </div>
            </div>

            <div className="card-elevated p-6 space-y-4 text-center border border-[#242436] bg-[#0f0f16]">
              <h3 className="text-sm font-bold text-white flex items-center justify-center gap-2">
                <QrCodeIcon className="w-4 h-4 text-[#FF2D2D]" />
                <span>Scan UPI QR Code</span>
              </h3>

              {config?.qrImageUrl ? (
                <div className="p-3 bg-white rounded-xl border border-gray-200 inline-block mx-auto">
                  <img
                    src={config.qrImageUrl}
                    alt="UPI QR Code"
                    className="w-44 h-44 object-contain mx-auto"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 bg-[#0a0a10] border border-dashed border-[#2a2a3e] rounded-xl flex flex-col items-center justify-center p-4 mx-auto text-gray-400 space-y-2">
                  <IndianRupee className="w-8 h-8 text-[#FF2D2D]" />
                  <p className="text-xs font-mono text-white">UPI ID: {config?.upiId || 'embedx@upi'}</p>
                  <span className="text-[10px] text-gray-500">
                    Scan using GPay, PhonePe, Paytm or Cred
                  </span>
                </div>
              )}

              <div className="text-xs font-mono bg-[#09090e] p-3 rounded-lg border border-[#222234] break-all">
                <span className="text-gray-500 block text-[10px] uppercase mb-1">UPI ID</span>
                <span className="text-white">{config?.upiId || 'embedx@upi'}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="card-elevated p-6 flex items-center justify-between gap-4 flex-wrap border border-[#242436] bg-[#0f0f16]">
              <div>
                <span className="form-label mb-1 text-gray-400">Registration Status</span>
                <h3 className="text-lg font-bold text-white">
                  PIN: <span className="font-mono text-[#FF2D2D]">{registration.pin}</span>
                </h3>
              </div>
              <span className={statusBadge(registration.paymentStatus)}>
                Payment {registration.paymentStatus}
              </span>
            </div>

            {registration.paymentStatus === 'verified' ? (
              <div className="card-elevated p-10 text-center space-y-6 border border-[#242436] bg-[#0f0f16]">
                <ShieldCheck className="w-12 h-12 text-[#FF2D2D] mx-auto" />
                <h2 className="text-2xl font-black text-white">Payment verified & ticket issued</h2>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  Your workshop payment has been approved. Your digital ticket and attendance QR code
                  are now available.
                </p>
                <button onClick={() => navigate('/ticket')} className="btn-pill inline-flex">
                  <span>View My Ticket & QR</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="card-elevated p-6 sm:p-8 space-y-6 border border-[#242436] bg-[#0f0f16]">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#FF2D2D]" />
                    <span>Submit Payment Evidence</span>
                  </h2>
                  <p className="text-sm text-gray-400 mt-2">
                    After paying via UPI, enter your UTR transaction ID and upload a PNG/JPEG
                    screenshot.
                  </p>
                </div>

                {error && (
                  <div className="alert-error">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="alert-success">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="form-label text-gray-400">
                      UPI UTR / Transaction Reference Number
                    </label>
                    <input
                      type="text"
                      required
                      minLength={8}
                      value={utr}
                      onChange={(e) => setUtr(e.target.value)}
                      placeholder="e.g. 427389102456"
                      className="input-clean font-mono bg-[#09090e] border-[#222234] text-white focus:border-[#FF2D2D]"
                    />
                  </div>

                  <div>
                    <label className="form-label text-gray-400">Payment Screenshot (PNG/JPEG, Max 5 MB)</label>
                    <div className="upload-zone border-[#222234] bg-[#09090e] hover:border-[#FF2D2D]">
                      <input
                        type="file"
                        required
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileSelect}
                      />
                      {filePreview ? (
                        <div className="space-y-3">
                          <img
                            src={filePreview}
                            alt="Screenshot Preview"
                            className="h-40 max-w-full object-contain mx-auto rounded-lg border border-[#2a2a3e]"
                          />
                          <p className="text-xs font-medium text-white">{selectedFile?.name}</p>
                          <span className="text-[10px] text-gray-400">Click or drag to replace file</span>
                        </div>
                      ) : (
                        <div className="space-y-2 py-4">
                          <div className="w-12 h-12 rounded-full bg-[#14141f] border border-[#2a2a3e] flex items-center justify-center mx-auto">
                            <Upload className="w-6 h-6 text-[#FF2D2D]" />
                          </div>
                          <p className="text-sm font-medium text-white">Click to upload payment screenshot</p>
                          <p className="text-xs text-gray-400">PNG or JPEG format up to 5 MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button type="submit" disabled={submitting} className="btn-pill w-full">
                    {submitting ? (
                      <span>Uploading evidence...</span>
                    ) : (
                      <>
                        <span>Submit Payment Evidence</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {attempts.length > 0 && (
              <div className="card-elevated p-6 space-y-4 border border-[#242436] bg-[#0f0f16]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF2D2D]" />
                  <span>Submitted Payment History</span>
                </h3>
                <div className="space-y-3">
                  {attempts.map((att) => (
                    <div
                      key={att.id}
                      className="p-4 rounded-xl bg-[#09090e] border border-[#222234] flex items-center justify-between text-xs flex-wrap gap-2"
                    >
                      <div>
                        <p className="font-mono font-semibold text-white">UTR: {att.utr}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Ref: {att.screenshotRef}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white block">₹{att.expectedAmount}</span>
                        <span className="badge badge-warning mt-1">{att.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
