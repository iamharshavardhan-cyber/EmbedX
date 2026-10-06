import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/context/AuthContext';
import { getStudentRegistration } from '@/services/registrationService';
import { Registration } from '@/types';
import {
  Ticket as TicketIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Hash,
  BookOpen,
} from 'lucide-react';

export const TicketPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const fetchTicketData = async () => {
      try {
        const reg = await getStudentRegistration(currentUser.uid);
        setRegistration(reg);
      } catch (err) {
        console.error('Error fetching ticket data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTicketData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p className="text-sm text-gray-400">Loading entry ticket details...</p>
      </div>
    );
  }

  if (!registration || registration.ticketStatus !== 'issued' || !registration.ticketId) {
    return (
      <div className="page-wrap flex items-center justify-center bg-[#050508]">
        <div className="page-narrow w-full">
          <div className="card-elevated p-10 text-center space-y-6 border border-[#242436] bg-[#0f0f16]">
            <AlertCircle className="w-12 h-12 text-[#FF2D2D] mx-auto" />
            <h1 className="text-2xl font-black text-white">Ticket pending approval</h1>
            <p className="text-sm text-gray-400">
              {registration?.paymentStatus === 'submitted'
                ? 'Your payment evidence has been submitted and is currently being verified by the workshop admin team.'
                : 'Please complete your registration and submit payment evidence to receive your workshop ticket.'}
            </p>
            <button onClick={() => navigate('/payment')} className="btn-pill inline-flex">
              Check Payment Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  const day1Checked = registration.attendance?.day1?.checkedIn;
  const day2Checked = registration.attendance?.day2?.checkedIn;

  return (
    <div className="page-wrap bg-[#050508]">
      <div className="page-medium">
        <div className="card-elevated overflow-hidden border border-[#242436] bg-[#0f0f16]">
          <div className="p-8 sm:p-10 border-b border-[#1f1f2e] text-center bg-[#09090e]">
            <span className="badge badge-neutral mb-4 bg-[#FF2D2D]/10 text-[#FF2D2D] border border-[#FF2D2D]/30">
              <TicketIcon className="w-3 h-3" />
              Verified Entry Pass
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              EmbedX PCB Workshop Ticket
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-2">Ticket ID: {registration.ticketId}</p>
          </div>

          <div className="p-8 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-white rounded-2xl border-4 border-[#FF2D2D] shadow-[0_0_25px_rgba(255,45,45,0.3)]">
                <QRCodeSVG value={registration.ticketId} size={200} level="H" includeMargin={false} />
              </div>
              <p className="text-xs text-gray-400 font-mono text-center max-w-xs">
                Present this QR code at the venue scanner desk for Day 1 & Day 2 attendance.
              </p>
            </div>

            <div className="space-y-5 md:border-l md:border-[#1f1f2e] md:pl-10 pt-6 md:pt-0 border-t md:border-t-0 border-[#1f1f2e]">
              <div>
                <span className="form-label mb-1 text-gray-400">Student Name</span>
                <p className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-[#FF2D2D]" />
                  {registration.fullName}
                </p>
              </div>

              <div>
                <span className="form-label mb-1 text-gray-400">College PIN</span>
                <p className="text-sm font-mono font-bold text-white flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#FF2D2D]" />
                  {registration.pin}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="form-label mb-1 text-gray-400">Branch</span>
                  <p className="text-sm font-bold text-white flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#FF2D2D]" />
                    {registration.branch.toUpperCase()}
                  </p>
                </div>
                <div>
                  <span className="form-label mb-1 text-gray-400">Eligibility</span>
                  <p className="text-sm font-bold text-[#FF2D2D]">1st Year Only</p>
                </div>
              </div>

              <div>
                <span className="form-label mb-1 text-gray-400">Fee Verification</span>
                <span className="badge badge-success">Paid & Verified</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 border-t border-[#1f1f2e] bg-[#09090e] grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-[#0f0f16] border border-[#222234] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#FF2D2D]" />
                <div>
                  <h4 className="text-sm font-bold text-white">Day 1 Attendance</h4>
                  <p className="text-xs text-gray-400">Workshop Kickoff & CAD Routing</p>
                </div>
              </div>
              {day1Checked ? (
                <span className="badge badge-success">
                  <CheckCircle2 className="w-3 h-3" /> Checked In
                </span>
              ) : (
                <span className="badge badge-neutral">
                  <Clock className="w-3 h-3" /> Pending
                </span>
              )}
            </div>

            <div className="p-5 rounded-xl bg-[#0f0f16] border border-[#222234] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#FF2D2D]" />
                <div>
                  <h4 className="text-sm font-bold text-white">Day 2 Attendance</h4>
                  <p className="text-xs text-gray-400">Etching & Live Soldering</p>
                </div>
              </div>
              {day2Checked ? (
                <span className="badge badge-success">
                  <CheckCircle2 className="w-3 h-3" /> Checked In
                </span>
              ) : (
                <span className="badge badge-neutral">
                  <Clock className="w-3 h-3" /> Pending
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
