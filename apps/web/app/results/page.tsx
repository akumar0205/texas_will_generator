import { DocumentCard } from '@/components/DocumentCard';
import { LegalGuidancePanel } from '@/components/LegalGuidancePanel';
import { RiskBanner } from '@/components/RiskBanner';

export default function ResultsPage() {
  const result = 'ELIGIBLE';
  const escalated = false;

  return (
    <main className="grid">
      <h1>Results</h1>
      <RiskBanner result={result} flags={[]} />
      {!escalated ? (
        <div className="grid">
          <div className="grid grid-2">
            <DocumentCard title="Texas Will Draft" href="#" />
            <DocumentCard title="Self-Proving Affidavit" href="#" />
            <DocumentCard title="Signing Instructions" href="#" />
          </div>
          <LegalGuidancePanel title="After Download: Execute and Store Your Documents" />
        </div>
      ) : (
        <div className="card"><strong>ATTORNEY_REVIEW_REQUIRED</strong><p>Your intake requires attorney review before document generation.</p></div>
      )}
    </main>
  );
}
