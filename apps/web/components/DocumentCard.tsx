export function DocumentCard({ title, href }: { title: string; href?: string }) {
  return <div className="card"><h3>{title}</h3>{href ? <a href={href}>Download</a> : <span>Unavailable</span>}</div>;
}
