import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, QrCode as QrIcon, RefreshCw, Trash2 } from 'lucide-react';
import { downloadBlob } from '../../../utils/fileHelpers';
import { SITE_URL } from '../../../config/site';

export function QrCodeGenerator() {
  const [qrType, setQrType] = useState<'url' | 'text' | 'wifi' | 'email' | 'phone'>('url');
  const [urlVal, setUrlVal] = useState<string>(SITE_URL);
  const [textVal, setTextVal] = useState<string>('Hello from ToolNest!');
  const [wifiSsid, setWifiSsid] = useState<string>('MyHomeWiFi');
  const [wifiPass, setWifiPass] = useState<string>('SuperSecret123');
  const [wifiType, setWifiType] = useState<string>('WPA');
  const [emailTo, setEmailTo] = useState<string>('hello@example.com');
  const [emailSubject, setEmailSubject] = useState<string>('Inquiry');
  const [phoneVal, setPhoneVal] = useState<string>('+15551234567');

  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const getPayload = (): string => {
    switch (qrType) {
      case 'url':
        if (!urlVal.trim()) return '';
        return urlVal.startsWith('http://') || urlVal.startsWith('https://') ? urlVal : `https://${urlVal}`;
      case 'text':
        return textVal;
      case 'wifi':
        return `WIFI:T:${wifiType};S:${wifiSsid};P:${wifiPass};;`;
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}`;
      case 'phone':
        return `tel:${phoneVal}`;
      default:
        return urlVal;
    }
  };

  useEffect(() => {
    const payload = getPayload();
    if (!payload.trim()) {
      setQrDataUrl('');
      return;
    }

    QRCode.toDataURL(payload, {
      width: 400,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('QR code generation error', err);
      });
  }, [qrType, urlVal, textVal, wifiSsid, wifiPass, wifiType, emailTo, emailSubject, phoneVal, fgColor, bgColor]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    downloadBlob(qrDataUrl, `qrcode-${qrType}.png`);
  };

  const handleCopy = async () => {
    if (!qrDataUrl) return;
    try {
      const parts = qrDataUrl.split(',');
      const byteString = atob(parts[1]);
      const mimeString = parts[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      navigator.clipboard.writeText(getPayload());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setUrlVal('');
    setTextVal('');
    setWifiSsid('');
    setWifiPass('');
    setEmailTo('');
    setEmailSubject('');
    setPhoneVal('');
    setFgColor('#000000');
    setBgColor('#ffffff');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Types Bar & Reset */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 gap-2 pb-4">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: 'url', label: 'Website URL' },
            { id: 'text', label: 'Plain Text' },
            { id: 'wifi', label: 'Wi-Fi Network' },
            { id: 'email', label: 'Email' },
            { id: 'phone', label: 'Phone Number' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setQrType(t.id as any)}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                qrType === t.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          title="Reset Inputs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear / Reset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Configuration */}
        <div className="space-y-4 lg:col-span-2">
          {qrType === 'url' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Website URL
              </label>
              <input
                type="text"
                value={urlVal}
                onChange={(e) => setUrlVal(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          )}

          {qrType === 'text' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Text Content
              </label>
              <textarea
                rows={4}
                value={textVal}
                onChange={(e) => setTextVal(e.target.value)}
                placeholder="Enter any text message..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          )}

          {qrType === 'wifi' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Network SSID (Name)
                </label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="e.g. Home_Network"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="text"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  placeholder="Wi-Fi Password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Security
                </label>
                <select
                  value={wifiType}
                  onChange={(e) => setWifiType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  <option value="WPA">WPA / WPA2 / WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None (Open Network)</option>
                </select>
              </div>
            </div>
          )}

          {qrType === 'email' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Subject line"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
          )}

          {qrType === 'phone' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneVal}
                onChange={(e) => setPhoneVal(e.target.value)}
                placeholder="+1 555 123 4567"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          )}

          {/* Color Settings */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-semibold text-slate-700 mb-2">QR Code Colors</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Foreground Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 p-0.5 border border-slate-300 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-600">{fgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 p-0.5 border border-slate-300 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-600">{bgColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Preview & Download */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          {qrDataUrl ? (
            <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200 mb-4">
              <img
                src={qrDataUrl}
                alt="Generated QR Code"
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
              />
            </div>
          ) : (
            <div className="w-48 h-48 bg-slate-200/80 rounded-xl flex items-center justify-center text-slate-400 text-xs mb-4">
              Enter content above to generate QR code
            </div>
          )}

          <div className="w-full space-y-2">
            <button
              type="button"
              disabled={!qrDataUrl}
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>

            <button
              type="button"
              disabled={!qrDataUrl}
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard' : 'Copy Image'}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-3">
            Generated locally in your browser • Never expires
          </p>
        </div>
      </div>
    </div>
  );
}

function RotateCcw(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
