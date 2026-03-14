const steps = ['About You','Family','Executor & Guardians','Gifts & Beneficiaries','Special Clauses','Review'];

export function ProgressStepper({ current }: { current: number }) {
  return <div style={{ display: 'flex', gap: 6, flexWrap:'wrap' }}>{steps.map((s, i) => <span key={s} className="badge" style={{ background: i <= current ? '#bfdbfe' : '#e5e7eb' }}>{s}</span>)}</div>;
}
