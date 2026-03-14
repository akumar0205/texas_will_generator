import { RiskBanner } from '@/components/RiskBanner';

export default function ReviewPage() {
  return (
    <main className="grid">
      <h1>Review Choices</h1>
      <p>Human-readable summary of your will instructions.</p>
      <RiskBanner result="ELIGIBLE_WITH_WARNING" flags={["Blended family complexity"]} />
    </main>
  );
}
