import React, { useState } from 'react';
import { KeyRound, Shield, Check, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { AdminCredentials } from '../../types';
import { BRAND } from '../../constants/brand';
import { ConfirmModal } from '../ConfirmModal';

interface SettingsManagerProps {
  credentials: AdminCredentials;
  onUpdateCredentials: (newCreds: AdminCredentials) => void;
  onResetData: () => void;
  onLogout: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  credentials,
  onUpdateCredentials,
  onResetData,
  onLogout,
}) => {
  const [currentUsername, setCurrentUsername] = useState(credentials.username);
  const [newUsername, setNewUsername] = useState('');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (currentPasswordInput !== credentials.password) {
      setStatusMessage({ type: 'error', text: 'Current password is incorrect.' });
      return;
    }

    const updatedUsername = newUsername.trim() ? newUsername.trim() : credentials.username;
    const updatedPassword = newPassword.trim() ? newPassword.trim() : credentials.password;

    if (newPassword && newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (newPassword && newPassword.length < 4) {
      setStatusMessage({ type: 'error', text: 'New password should be at least 4 characters long.' });
      return;
    }

    onUpdateCredentials({
      username: updatedUsername,
      password: updatedPassword,
    });

    setCurrentUsername(updatedUsername);
    setNewUsername('');
    setCurrentPasswordInput('');
    setNewPassword('');
    setConfirmPassword('');
    setStatusMessage({ type: 'success', text: 'Admin credentials updated successfully.' });
  };

  const handleResetExecute = () => {
    onResetData();
    setIsResetConfirmOpen(false);
    setStatusMessage({ type: 'success', text: 'Database reset to empty state.' });
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="pb-3 border-b border-blue-500/15">
        <h2 className="font-heading text-lg font-bold text-slate-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-400" />
          <span>{BRAND.name} Access & Security</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Credentials for accessing the /admin panel
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/50 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <Check className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="glass-card rounded-2xl p-5 space-y-3.5 border border-blue-500/15">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <KeyRound className="w-3.5 h-3.5 text-sky-400" />
          <span>Change Username & Password</span>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Current Username</label>
          <input
            type="text"
            disabled
            value={currentUsername}
            className="w-full glass-input rounded-lg px-3 py-2.5 text-base sm:text-xs text-slate-400 opacity-60 cursor-not-allowed"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300">New Username (Leave blank to keep)</label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Enter new username..."
            className="w-full glass-input rounded-lg px-3 py-2.5 text-base sm:text-xs text-slate-100 placeholder-slate-500"
          />
        </div>

        <div className="pt-2 border-t border-blue-500/15 space-y-2.5">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Current Password (Required) *</label>
            <input
              type="password"
              required
              value={currentPasswordInput}
              onChange={(e) => setCurrentPasswordInput(e.target.value)}
              placeholder="Enter current password..."
              className="w-full glass-input rounded-lg px-3 py-2.5 text-base sm:text-xs text-slate-100 placeholder-slate-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">New Password (Leave blank to keep)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password..."
              className="w-full glass-input rounded-lg px-3 py-2.5 text-base sm:text-xs text-slate-100 placeholder-slate-500"
            />
          </div>

          {newPassword && (
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Confirm New Password *</label>
              <input
                type="password"
                required={!!newPassword}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password..."
                className="w-full glass-input rounded-lg px-3 py-2.5 text-base sm:text-xs text-slate-100 placeholder-slate-500"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-4 min-h-[42px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </form>

      <div className="glass-card rounded-2xl p-4 space-y-2 border border-blue-500/15">
        <h3 className="text-xs font-semibold text-slate-200">Reset Content & Credentials</h3>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Reset all posts and news to empty and restore default credentials (<code className="text-sky-300">admin</code> / <code className="text-sky-300">admin123</code>).
        </p>
        <button
          type="button"
          onClick={() => setIsResetConfirmOpen(true)}
          className="px-3.5 py-2 rounded-lg glass-button text-xs font-medium text-rose-300 hover:text-white border-rose-500/20 hover:bg-rose-950/40 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Database</span>
        </button>
      </div>

      <div className="pt-1">
        <button
          onClick={onLogout}
          className="w-full py-2.5 px-4 rounded-xl glass-button text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
          <span>Sign Out</span>
        </button>
      </div>

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset Content & Database"
        message="Are you sure you want to clear all data and restore default admin credentials? All posts and news will be emptied."
        confirmLabel="Reset Everything"
        isDestructive={true}
        onConfirm={handleResetExecute}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
