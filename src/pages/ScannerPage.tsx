import React, { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { useAuth } from '@/context/AuthContext';
import {
  lookupRegistrationByTicketId,
  recordAttendanceAtomically,
} from '@/services/scannerService';
import { Registration } from '@/types';
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
} from 'lucide-react';

export const ScannerPage: React.FC = () => {
  const { currentUser, role } = useAuth();
  const [selectedDay, setSelectedDay] = useState<'day1' | 'day2'>('day1');

  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [processing, setProcessing] = useState(false);

  const [scanResult, setScanResult] = useState<{
    type: 'success' | 'already' | 'error';
    message: string;
    registration?: Registration;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setScanning(false);
  };

  const startCamera = async () => {
    setScanResult(null);
    if (!codeReaderRef.current || !videoRef.current) return;

    setScanning(true);
    try {
      const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
      if (videoInputDevices.length === 0) {
        throw new Error('No camera video input device found on this device.');
      }

      const backCamera = videoInputDevices.find(
        (dev) =>
          dev.label.toLowerCase().includes('back') ||
          dev.label.toLowerCase().includes('rear') ||
          dev.label.toLowerCase().includes('environment')
      );
      const selectedDeviceId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId;

      await codeReaderRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result) => {
          if (result) {
            const scannedText = result.getText();
            stopCamera();
            handleProcessScannedTicket(scannedText);
          }
        }
      );
    } catch (err: any) {
      console.error('Camera access error:', err);
      setScanResult({
        type: 'error',
        message: err.message || 'Unable to access camera feed.',
      });
      setScanning(false);
    }
  };

  const handleProcessScannedTicket = async (ticketId: string) => {
    if (!currentUser) return;
    setProcessing(true);
    setScanResult(null);

    try {
      const reg = await lookupRegistrationByTicketId(ticketId);
      const res = await recordAttendanceAtomically(reg.id, selectedDay, currentUser.uid);

      if (res.alreadyCheckedIn) {
        setScanResult({
          type: 'already',
          message: res.message,
          registration: res.registration,
        });
      } else {
        setScanResult({
          type: 'success',
          message: res.message,
          registration: res.registration,
        });
      }
    } catch (err: any) {
      console.error('Attendance processing error:', err);
      setScanResult({
        type: 'error',
        message: err.message || 'Failed to process ticket attendance.',
      });
    } finally {
      setProcessing(false);
      setManualInput('');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleProcessScannedTicket(manualInput.trim());
  };

  const resultAlertClass =
    scanResult?.type === 'success'
      ? 'alert-success'
      : scanResult?.type === 'already'
      ? 'alert-warning'
      : 'alert-error';

  return (
    <div className="page-wrap bg-[#050508] text-white">
      <div className="page-medium space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="step-badge mb-3">
              <QrCode className="w-3 h-3 text-[#FF2D2D]" />
              Attendance Scanner ({role})
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight">QR Code Ticket Scanner</h1>
          </div>

          <div className="tab-pill-group bg-[#0f0f16] border-[#242436]">
            <button
              type="button"
              onClick={() => {
                setSelectedDay('day1');
                setScanResult(null);
              }}
              className={`tab-pill ${selectedDay === 'day1' ? 'active' : ''}`}
            >
              Day 1
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedDay('day2');
                setScanResult(null);
              }}
              className={`tab-pill ${selectedDay === 'day2' ? 'active' : ''}`}
            >
              Day 2
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card-elevated p-6 flex flex-col items-center space-y-6 border border-[#242436] bg-[#0f0f16]">
            <div className="relative w-full aspect-square max-w-[320px] bg-[#09090e] rounded-2xl border border-[#222234] overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${scanning ? 'block' : 'hidden'}`}
              />

              {!scanning && (
                <div className="text-center p-6 space-y-3">
                  <Camera className="w-12 h-12 text-[#FF2D2D] opacity-60 mx-auto" />
                  <p className="text-xs text-gray-500">Camera feed inactive</p>
                </div>
              )}

              {scanning && (
                <div className="absolute inset-0 border-2 border-[#FF2D2D]/40 m-8 rounded-xl pointer-events-none">
                  <div className="w-full h-0.5 bg-[#FF2D2D] animate-pulse mt-12 shadow-[0_0_10px_#FF2D2D]" />
                </div>
              )}
            </div>

            {scanning ? (
              <button onClick={stopCamera} className="btn-pill-danger w-full max-w-[320px]">
                Stop Camera
              </button>
            ) : (
              <button onClick={startCamera} className="btn-pill w-full max-w-[320px]">
                <Camera className="w-4 h-4" />
                <span>Start Camera Scanner</span>
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div className="card-elevated p-6 space-y-4 border border-[#242436] bg-[#0f0f16]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-[#FF2D2D]" />
                <span>Manual Ticket ID Lookup</span>
              </h3>

              <form onSubmit={handleManualSubmit} className="space-y-3">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="e.g. EMBEDX-2026-CSE-8A2F1B9C"
                  className="input-clean font-mono text-xs bg-[#09090e] border-[#222234] text-white focus:border-[#FF2D2D]"
                />
                <button
                  type="submit"
                  disabled={processing || !manualInput.trim()}
                  className="btn-pill-secondary w-full disabled:opacity-50"
                >
                  {processing
                    ? 'Verifying Ticket...'
                    : `Mark ${selectedDay === 'day1' ? 'Day 1' : 'Day 2'} Attendance`}
                </button>
              </form>
            </div>

            {scanResult && (
              <div className={`card-elevated p-6 space-y-4 border border-[#242436] bg-[#0f0f16] ${resultAlertClass}`}>
                <div className="flex items-start gap-3">
                  {scanResult.type === 'success' ? (
                    <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
                  ) : scanResult.type === 'already' ? (
                    <Clock className="w-6 h-6 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                  )}

                  <div>
                    <h4 className="text-sm font-bold">
                      {scanResult.type === 'success'
                        ? 'Attendance Recorded'
                        : scanResult.type === 'already'
                        ? 'Already Checked In'
                        : 'Scan Validation Error'}
                    </h4>
                    <p className="text-xs mt-1 opacity-90">{scanResult.message}</p>
                  </div>
                </div>

                {scanResult.registration && (
                  <div className="pt-3 border-t border-current/20 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="form-label mb-1 opacity-70">Student</span>
                      <span className="font-bold block">{scanResult.registration.fullName}</span>
                    </div>
                    <div>
                      <span className="form-label mb-1 opacity-70">PIN</span>
                      <span className="font-mono font-bold block">{scanResult.registration.pin}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
