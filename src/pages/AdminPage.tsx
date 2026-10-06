import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getAllRegistrations,
  approvePaymentAndIssueTicket,
  rejectPayment,
  updateUserRole,
  updatePaymentConfig,
  exportRegistrationsCSV,
} from '@/services/adminService';
import { getAdminViewUrl, getPaymentAttempts, getPaymentConfig } from '@/services/paymentService';
import { Registration, PaymentAttempt, UserRole } from '@/types';
import {
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  UserCheck,
  CreditCard,
  AlertCircle,
  RefreshCw,
  X,
  ExternalLink,
  Users,
  Check,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'registrations' | 'superadmin'>('registrations');

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  // Evidence Modal State
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [attempts, setAttempts] = useState<PaymentAttempt[]>([]);
  const [previewSignedUrl, setPreviewSignedUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Super Admin Tab State
  const [targetUid, setTargetUid] = useState('');
  const [targetRole, setTargetRole] = useState<UserRole>('admin');
  const [roleMsg, setRoleMsg] = useState<string | null>(null);

  const [upiId, setUpiId] = useState('');
  const [payeeName, setPayeeName] = useState('EMBEDX PCB WORKSHOP');
  const [amount, setAmount] = useState(70);
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [configMsg, setConfigMsg] = useState<string | null>(null);
  const [updatingConfig, setUpdatingConfig] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllRegistrations();
      setRegistrations(data);

      const cfg = await getPaymentConfig();
      if (cfg) {
        setUpiId(cfg.upiId || '');
        setPayeeName(cfg.payeeName || 'EMBEDX PCB WORKSHOP');
        setAmount(cfg.amount || cfg.expectedAmount || 70);
        setQrImageUrl(cfg.qrImageUrl || '');
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEvidenceModal = async (reg: Registration) => {
    setSelectedReg(reg);
    setPreviewSignedUrl(null);
    setPreviewError(null);
    setLoadingPreview(true);

    try {
      const studentAttempts = await getPaymentAttempts(reg.id);
      setAttempts(studentAttempts);

      if (studentAttempts.length > 0 && studentAttempts[0].screenshotRef) {
        const signedUrl = await getAdminViewUrl(studentAttempts[0].screenshotRef);
        setPreviewSignedUrl(signedUrl);
      } else {
        setPreviewError('No uploaded payment screenshot evidence found for this student.');
      }
    } catch (err: any) {
      console.error('Failed to load signed evidence URL:', err);
      setPreviewError(err.message || 'Failed to fetch signed screenshot URL from server.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleApprove = async (reg: Registration) => {
    try {
      const studentAttempts = await getPaymentAttempts(reg.id);
      const utr = studentAttempts.length > 0 ? studentAttempts[0].utr : undefined;
      const newTicketId = await approvePaymentAndIssueTicket(reg.id, reg.branch, utr);
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === reg.id
            ? {
                ...r,
                paymentStatus: 'verified',
                registrationStatus: 'verified',
                ticketStatus: 'issued',
                ticketId: newTicketId,
              }
            : r
        )
      );
      if (selectedReg?.id === reg.id) {
        setSelectedReg(null);
      }
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleReject = async (reg: Registration) => {
    const reason = prompt(`Optional rejection reason for ${reg.fullName} (e.g. Invalid UTR / Screenshot blurry):`) || '';

    try {
      await rejectPayment(reg.id, reason);
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === reg.id
            ? {
                ...r,
                paymentStatus: 'rejected',
                registrationStatus: 'rejected',
                rejectionReason: reason,
              }
            : r
        )
      );
      if (selectedReg?.id === reg.id) {
        setSelectedReg(null);
      }
    } catch (err: any) {
      alert(`Rejection error: ${err.message}`);
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoleMsg(null);
    if (!targetUid.trim()) return;

    try {
      await updateUserRole(targetUid.trim(), targetRole);
      setRoleMsg(`Successfully updated role for User ID '${targetUid}' to '${targetRole}'.`);
      setTargetUid('');
    } catch (err: any) {
      setRoleMsg(`Error: ${err.message}`);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigMsg(null);
    setUpdatingConfig(true);

    try {
      await updatePaymentConfig(upiId, payeeName, Number(amount), qrImageUrl);
      setConfigMsg('Payment display configuration updated successfully.');
    } catch (err: any) {
      setConfigMsg(`Error: ${err.message}`);
    } finally {
      setUpdatingConfig(false);
    }
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter((r) => {
    const matchesQuery =
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.pin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phoneNumber.includes(searchQuery) ||
      (r.ticketId && r.ticketId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || r.paymentStatus === statusFilter;

    const matchesBranch =
      branchFilter === 'all' || r.branch === branchFilter;

    return matchesQuery && matchesStatus && matchesBranch;
  });

  const pendingCount = registrations.filter((r) => r.paymentStatus === 'submitted').length;
  const verifiedCount = registrations.filter((r) => r.paymentStatus === 'verified').length;
  const rejectedCount = registrations.filter((r) => r.paymentStatus === 'rejected').length;
  const totalCount = registrations.length;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 max-w-7xl mx-auto bg-[#050508] text-white">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF2D2D]/10 border border-[#FF2D2D]/30 text-[#FF2D2D] text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Control Panel ({role})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            EmbedX PCB Workshop Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportRegistrationsCSV(registrations)}
            className="px-4 py-2 rounded-full bg-[#161622] hover:bg-[#1f1f2e] border border-[#2a2a3e] text-white font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-[#FF2D2D]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 rounded-full bg-[#161622] hover:bg-[#1f1f2e] border border-[#2a2a3e] text-gray-400 hover:text-white transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#1f1f2e] mb-6">
        <button
          onClick={() => setActiveTab('registrations')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'registrations'
              ? 'border-[#FF2D2D] text-white'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registrations ({totalCount})</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-extrabold border border-amber-500/30">
              {pendingCount} Pending
            </span>
          )}
        </button>

        {role === 'super_admin' && (
          <button
            onClick={() => setActiveTab('superadmin')}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'superadmin'
                ? 'border-[#FF2D2D] text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Super Admin Settings</span>
          </button>
        )}
      </div>

      {activeTab === 'registrations' ? (
        <div className="space-y-6">
          {/* Stats Bar (Submitted / Verified / Rejected / Total) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-surface p-5 rounded-2xl border border-[#242436] bg-[#0f0f16] flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block uppercase font-bold">Submitted</span>
                <span className="text-2xl font-black text-amber-400">{pendingCount}</span>
              </div>
              <CreditCard className="w-8 h-8 text-amber-400 opacity-80" />
            </div>

            <div className="card-surface p-5 rounded-2xl border border-[#242436] bg-[#0f0f16] flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block uppercase font-bold">Verified</span>
                <span className="text-2xl font-black text-emerald-400">{verifiedCount}</span>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-80" />
            </div>

            <div className="card-surface p-5 rounded-2xl border border-[#242436] bg-[#0f0f16] flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block uppercase font-bold">Rejected</span>
                <span className="text-2xl font-black text-red-400">{rejectedCount}</span>
              </div>
              <XCircle className="w-8 h-8 text-red-400 opacity-80" />
            </div>

            <div className="card-surface p-5 rounded-2xl border border-[#242436] bg-[#0f0f16] flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block uppercase font-bold">Total Registrations</span>
                <span className="text-2xl font-black text-white">{totalCount}</span>
              </div>
              <Users className="w-8 h-8 text-[#FF2D2D] opacity-80" />
            </div>
          </div>

          {/* Search & Filters */}
          <div className="card-surface p-4 rounded-2xl border border-[#242436] bg-[#0f0f16] flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Name, PIN, Phone, or Ticket ID..."
                className="input-clean pl-10 bg-[#09090e] border-[#222234] text-white focus:border-[#FF2D2D]"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-clean bg-[#09090e] border-[#222234] text-white focus:border-[#FF2D2D] text-xs"
              >
                <option value="all">All Payment Statuses</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted (Needs Review)</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="input-clean bg-[#09090e] border-[#222234] text-white focus:border-[#FF2D2D] text-xs"
              >
                <option value="all">All Branches</option>
                <option value="cse">CSE</option>
                <option value="ece">ECE</option>
                <option value="bme">BME</option>
                <option value="mee">MEE</option>
                <option value="ei">EI</option>
                <option value="es">ES</option>
                <option value="cps">CPS</option>
                <option value="aiml">AIML</option>
                <option value="ccb">CCB</option>
                <option value="sct">SCT</option>
              </select>
            </div>
          </div>

          {/* Registrations Data Table */}
          <div className="card-surface rounded-2xl border border-[#242436] bg-[#0f0f16] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Name & Phone</th>
                    <th>Branch</th>
                    <th>PIN</th>
                    <th>Payment Status</th>
                    <th>Ticket ID</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        Loading registrations list...
                      </td>
                    </tr>
                  ) : filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        No registrations match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <tr key={reg.id}>
                        <td>
                          <p className="font-bold text-white text-sm">{reg.fullName}</p>
                          <p className="text-gray-400 text-[11px]">{reg.phoneNumber}</p>
                        </td>
                        <td className="font-mono">
                          <span className="font-bold text-[#FF2D2D]">{reg.branch.toUpperCase()}</span>
                          <span className="text-gray-500 block text-[10px]">1st Year</span>
                        </td>
                        <td className="font-mono font-semibold text-gray-200">{reg.pin}</td>
                        <td>
                          <span
                            className={`badge ${
                              reg.paymentStatus === 'verified'
                                ? 'badge-success'
                                : reg.paymentStatus === 'submitted'
                                ? 'badge-warning'
                                : reg.paymentStatus === 'rejected'
                                ? 'badge-error'
                                : 'badge-neutral'
                            }`}
                          >
                            {reg.paymentStatus}
                          </span>
                        </td>
                        <td className="font-mono text-[11px]">
                          {reg.ticketId ? (
                            <span className="text-purple-400 font-semibold">{reg.ticketId}</span>
                          ) : (
                            <span className="text-gray-600">Unissued</span>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEvidenceModal(reg)}
                              className="p-2 rounded-full bg-[#161622] hover:bg-[#202030] text-[#FF2D2D] transition-colors border border-[#2a2a3e]"
                              title="Review Evidence Screenshot"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {reg.paymentStatus === 'submitted' && (
                              <>
                                <button
                                  onClick={() => handleApprove(reg)}
                                  className="px-3 py-1.5 rounded-full bg-[#FF2D2D] hover:bg-[#E02222] text-white font-bold transition-colors flex items-center gap-1 text-xs"
                                  title="Approve & Issue Ticket"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleReject(reg)}
                                  className="p-1.5 rounded-full bg-red-500/15 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-colors"
                                  title="Reject Payment"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Super Admin Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Role Management Card */}
          <div className="card-surface p-6 rounded-2xl border border-[#242436] bg-[#0f0f16] space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#FF2D2D]" />
                <span>User Role Management</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">Assign student, scanner, admin, or super_admin roles to users by Firebase UID.</p>
            </div>

            {roleMsg && (
              <div className="alert-info">
                <span>{roleMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="form-label text-gray-400">Target User Firebase UID</label>
                <input
                  type="text"
                  required
                  value={targetUid}
                  onChange={(e) => setTargetUid(e.target.value)}
                  placeholder="Paste Firebase auth User UID..."
                  className="input-clean bg-[#09090e] border-[#222234] text-white font-mono focus:border-[#FF2D2D]"
                />
              </div>

              <div>
                <label className="form-label text-gray-400">Select Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as UserRole)}
                  className="input-clean bg-[#09090e] border-[#222234] text-white focus:border-[#FF2D2D]"
                >
                  <option value="student">student (Default)</option>
                  <option value="scanner">scanner (Attendance scanner app)</option>
                  <option value="admin">admin (Registrations & Payment approval)</option>
                  <option value="super_admin">super_admin (Full website administration)</option>
                </select>
              </div>

              <button type="submit" className="btn-pill w-full">
                Save Role Assignment
              </button>
            </form>
          </div>

          {/* Payment Display Configuration Card */}
          <div className="card-surface p-6 rounded-2xl border border-[#242436] bg-[#0f0f16] space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#FF2D2D]" />
                <span>Payment Display Configuration</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">Configure workshop UPI ID and QR code image URL shown to students (Fee locked at ₹70).</p>
            </div>

            {configMsg && (
              <div className="alert-success">
                <span>{configMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="form-label text-gray-400">UPI Receiver ID</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. embedxworkshop@upi"
                  className="input-clean bg-[#09090e] border-[#222234] text-white font-mono focus:border-[#FF2D2D]"
                />
              </div>

              <div>
                <label className="form-label text-gray-400">Payee Name</label>
                <input
                  type="text"
                  required
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  placeholder="e.g. EMBEDX PCB WORKSHOP"
                  className="input-clean bg-[#09090e] border-[#222234] text-white focus:border-[#FF2D2D]"
                />
              </div>

              <div>
                <label className="form-label text-gray-400">Workshop Registration Fee Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="70"
                  className="input-clean bg-[#09090e] border-[#222234] text-[#FF2D2D] font-bold focus:border-[#FF2D2D]"
                />
              </div>

              <div>
                <label className="form-label text-gray-400">UPI Payment QR Code Image URL (Optional)</label>
                <input
                  type="url"
                  value={qrImageUrl}
                  onChange={(e) => setQrImageUrl(e.target.value)}
                  placeholder="https://example.com/qr-code.png"
                  className="input-clean bg-[#09090e] border-[#222234] text-white font-mono focus:border-[#FF2D2D]"
                />
              </div>

              <button
                type="submit"
                disabled={updatingConfig}
                className="btn-pill w-full"
              >
                {updatingConfig ? 'Updating Configuration...' : 'Save Payment Configuration'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Evidence Preview Modal */}
      {selectedReg && (
        <div className="modal-overlay">
          <div className="modal-panel max-w-2xl w-full border border-[#242436] bg-[#0f0f16]">
            <div className="p-6 border-b border-[#1f1f2e] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Payment Evidence Review</h3>
                <p className="text-xs text-gray-400">Student: {selectedReg.fullName} ({selectedReg.pin})</p>
              </div>
              <button
                onClick={() => setSelectedReg(null)}
                className="p-1 rounded-lg hover:bg-[#1a1a26] text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {attempts.length > 0 && (
                <div className="p-3 bg-[#09090e] rounded-xl border border-[#222234] flex items-center justify-between text-xs font-mono">
                  <span>Submitted UTR: <strong className="text-[#FF2D2D]">{attempts[0].utr}</strong></span>
                  <span>Amount: <strong className="text-emerald-400">₹{attempts[0].expectedAmount}</strong></span>
                </div>
              )}

              {loadingPreview ? (
                <div className="p-12 text-center text-gray-400 space-y-2">
                  <div className="spinner mx-auto" />
                  <p className="text-xs">Fetching signed screenshot URL...</p>
                </div>
              ) : previewError ? (
                <div className="alert-error">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{previewError}</span>
                </div>
              ) : previewSignedUrl ? (
                <div className="space-y-[#222234] text-center space-y-3">
                  <div className="max-h-[350px] overflow-auto rounded-xl border border-[#222234] bg-[#050508] p-2">
                    <img src={previewSignedUrl} alt="Payment Screenshot Evidence" className="max-w-full h-auto mx-auto rounded-lg object-contain" />
                  </div>
                  <a
                    href={previewSignedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#FF2D2D] hover:underline font-semibold"
                  >
                    <span>Open full image in new window</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : null}
            </div>

            <div className="p-6 border-t border-[#1f1f2e] flex items-center justify-end gap-3 bg-[#09090e]">
              <button
                onClick={() => setSelectedReg(null)}
                className="btn-pill-secondary"
              >
                Close
              </button>

              {selectedReg.paymentStatus === 'submitted' && (
                <>
                  <button
                    onClick={() => handleReject(selectedReg)}
                    className="btn-pill-danger"
                  >
                    Reject Payment
                  </button>

                  <button
                    onClick={() => handleApprove(selectedReg)}
                    className="btn-pill"
                  >
                    Approve Payment & Issue Ticket
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
