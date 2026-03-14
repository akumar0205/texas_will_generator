export function BeneficiarySplitEditor({ total }: { total: number }) {
  const ok = total === 100;
  return <p style={{ color: ok ? 'green' : 'var(--danger)' }}>Residuary total: {total}% {ok ? '✓' : '(must equal 100%)'}</p>;
}
