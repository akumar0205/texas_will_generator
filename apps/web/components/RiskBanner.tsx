export function RiskBanner({ result, flags }: { result: string; flags: string[] }) {
  if (result === 'ELIGIBLE') return null;
  const color = result === 'ATTORNEY_REVIEW_REQUIRED' ? 'var(--danger)' : 'var(--warn)';
  return <div className="card" style={{ borderLeft: `4px solid ${color}` }}><strong>{result}</strong><ul>{flags.map((f) => <li key={f}>{f}</li>)}</ul></div>;
}
