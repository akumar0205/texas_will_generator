export function PersonCard({ name, relationship }: { name: string; relationship?: string }) {
  return <div className="card"><strong>{name}</strong><div style={{ color: 'var(--muted)' }}>{relationship ?? 'No relationship listed'}</div></div>;
}
