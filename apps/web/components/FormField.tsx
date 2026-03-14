import React from 'react';

export function FormField({ label, helper, error, children }: { label: string; helper?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid" style={{ gap: 6 }}>
      <strong>{label}</strong>
      {children}
      {helper && <span style={{ color: 'var(--muted)', fontSize: 13 }}>{helper}</span>}
      {error && <span style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</span>}
    </label>
  );
}
