import Link from 'next/link';

export default function Landing() {
  return (
    <main>
      <div className="card grid">
        <span className="badge">Texas-only</span>
        <h1>Prepare a Texas Will Packet</h1>
        <p>Complete a guided intake to prepare a typed attested will, self-proving affidavit, and signing checklist.</p>
        <p><strong>Not legal advice.</strong> Complex cases are routed to attorney review.</p>
        <Link className="button" href="/intake">Start intake</Link>
      </div>
    </main>
  );
}
