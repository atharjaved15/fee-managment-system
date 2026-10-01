import React, { useState } from 'react';
import { CollegeConfig } from '../types';
import { updateCollegeSettings } from '../services/dbService';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import { Settings, Save, RotateCcw, Building2, Phone, MapPin, Globe, Mail, Landmark, CheckCircle2 } from 'lucide-react';
import { CollegeLogo } from './CollegeLogo';
import { TPCLogo } from './TPCLogo';

interface SettingsViewProps {
  config: CollegeConfig;
  onUpdateConfig: (newConfig: CollegeConfig) => void;
  onShowToast: (message: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  onUpdateConfig,
  onShowToast
}) => {
  const [universityName, setUniversityName] = useState<string>(config.universityName || 'Sarhad University SSC Mailsi');
  const [collegeName, setCollegeName] = useState<string>(config.collegeName || 'The Physio College Mailsi');
  const [phone, setPhone] = useState<string>(config.phone || '0323 8091599');
  const [address, setAddress] = useState<string>(config.address || 'Faddah Chungi Chowk, Vehari Road, Mailsi, 61200');
  const [email, setEmail] = useState<string>(config.email || 'thephysiocollegemailsi@gmail.com');
  const [website, setWebsite] = useState<string>(config.website || 'www.thephysiocollege.edu.pk');
  const [bankName, setBankName] = useState<string>(config.bankName || 'The Bank of Punjab / Allied Bank Mailsi');
  const [accountTitle, setAccountTitle] = useState<string>(config.accountTitle || 'The Physio College Mailsi');
  const [accountNumber, setAccountNumber] = useState<string>(config.accountNumber || '6580-00129384-001');
  const [footerNote, setFooterNote] = useState<string>(config.footerNote || '');

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const newConfig: CollegeConfig = {
        ...config,
        universityName: universityName.trim(),
        collegeName: collegeName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        email: email.trim(),
        website: website.trim(),
        bankName: bankName.trim(),
        accountTitle: accountTitle.trim(),
        accountNumber: accountNumber.trim(),
        footerNote: footerNote.trim()
      };

      await updateCollegeSettings(newConfig);
      onUpdateConfig(newConfig);
      setIsSaving(false);
      onShowToast('College branding and settings saved successfully.');
    } catch {
      setIsSaving(false);
      onShowToast('Failed to save settings.');
    }
  };

  const handleReset = () => {
    if (confirm('Reset branding to default Sarhad University SSC & The Physio College Mailsi configuration?')) {
      setUniversityName(COLLEGE_CONFIG.universityName);
      setCollegeName(COLLEGE_CONFIG.collegeName);
      setPhone(COLLEGE_CONFIG.phone);
      setAddress(COLLEGE_CONFIG.address);
      setEmail(COLLEGE_CONFIG.email);
      setWebsite(COLLEGE_CONFIG.website);
      setBankName(COLLEGE_CONFIG.bankName || '');
      setAccountTitle(COLLEGE_CONFIG.accountTitle || '');
      setAccountNumber(COLLEGE_CONFIG.accountNumber || '');
      setFooterNote(COLLEGE_CONFIG.footerNote || '');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-400" />
            <span>College Configuration &amp; Branding</span>
          </h2>
          <p className="text-xs text-slate-400">
            Institutional names, contact credentials, bank account info, and challan printing policies
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* College Preview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="bg-white p-2.5 rounded-xl shadow-xs border border-slate-700/60 shrink-0">
          <TPCLogo variant="full" size="md" className="h-10 sm:h-12" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-500/30">
            Live Challan &amp; Receipt Header
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-tight">{universityName}</h3>
          <h4 className="text-sm font-semibold text-orange-400 leading-tight">{collegeName}</h4>
          <p className="text-xs text-slate-400 mt-1">
            {address} &bull; Ph: {phone}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 text-xs">
        {/* Section 1: Institution Names */}
        <div>
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Institutional Identity</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                University Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                required
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Default: Sarhad University SSC Mailsi
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                College Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                required
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Default: The Physio College Mailsi
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Location */}
        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <span>Contact &amp; Location Details</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Official Phone Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                required
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Default: 0323 8091599
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Campus Postal Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                required
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Default: Faddah Chungi Chowk, Vehari Road, Mailsi, 61200
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">College Website</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Bank Account for Challans */}
        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-400" />
            <span>Bank Account Details (Printed on Challans)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Designated Bank</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Account Title</label>
              <input
                type="text"
                value={accountTitle}
                onChange={(e) => setAccountTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Account Number / IBAN</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Footer / Policy text */}
        <div className="pt-4 border-t border-slate-800">
          <label className="block text-slate-300 font-semibold mb-1">Document Footer Notice</label>
          <textarea
            rows={2}
            value={footerNote}
            onChange={(e) => setFooterNote(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
          />
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save College Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
