interface LegalGuidancePanelProps {
  title?: string;
}

export function LegalGuidancePanel({
  title = 'Legal Disclaimer, Execution, and Next Steps',
}: LegalGuidancePanelProps) {
  return (
    <section className="card grid">
      <h3>{title}</h3>

      <div className="notice-block">
        <strong>Legal disclaimer</strong>
        <p>
          This app is document preparation software, not a law firm, and does not
          provide legal advice. Texas estate laws are fact-specific, and this draft
          may not fit complex estates, tax planning, special-needs planning, blended
          families, or business/mineral interests.
        </p>
      </div>

      <div className="notice-block">
        <strong>How to execute this will in Texas</strong>
        <ol>
          <li>Print the will and affidavit as a full packet without changing text.</li>
          <li>Sign the will in ink before two credible witnesses (age 14+).</li>
          <li>Have both witnesses sign in your presence and each other&apos;s presence.</li>
          <li>Complete the self-proving affidavit before a Texas notary.</li>
          <li>Store originals in a secure place and tell your executor where they are.</li>
        </ol>
      </div>

      <div className="notice-block">
        <strong>Next steps</strong>
        <ol>
          <li>Review all names, addresses, and beneficiary percentages for accuracy.</li>
          <li>Initial any handwritten corrections only if your attorney advises it.</li>
          <li>Share copies with your executor and keep one scanned backup copy.</li>
          <li>Revisit your will after major life events (marriage, divorce, births, deaths, relocation).</li>
          <li>Consider attorney review before signing if anything is uncertain.</li>
        </ol>
      </div>
    </section>
  );
}
