import Link from 'next/link';

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function HeroVisual() {
  return (
    <div className="hero-visual">
      <div className="hero-paper-stack">
        <div className="hero-paper">
          <div className="hero-paper-line" />
          <div className="hero-paper-line" />
          <div className="hero-paper-line short" />
          <div className="hero-paper-line" />
          <div className="hero-paper-line short" />
        </div>
        <div className="hero-paper">
          <div className="hero-paper-line" />
          <div className="hero-paper-line" />
          <div className="hero-paper-line short" />
          <div className="hero-paper-line" />
          <div className="hero-paper-line" />
          <div className="hero-paper-line short" />
        </div>
        <div className="hero-paper">
          <div className="hero-paper-line" />
          <div className="hero-paper-line" />
          <div className="hero-paper-line" />
          <div className="hero-paper-line short" />
          <div className="hero-paper-line" />
        </div>
        <div className="hero-stamp">TX</div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* Nav */}
      <nav className="landing-nav">
        <Link href="/" className="landing-nav-brand">
          Texas Will Generator
        </Link>
        <span className="badge" style={{ fontSize: 13 }}>
          Coming soon
        </span>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-layout">
          <div>
            <span className="badge" style={{ marginBottom: 20, display: 'inline-block' }}>
              Texas-only
            </span>
            <h1>
              Get your will done.
              <br />
              Properly.
            </h1>
            <p className="subtitle">
              Create a complete Texas last will and testament, self-proving affidavit,
              and signing instructions in one sitting. No legal jargon. No appointments.
              Just your documents, ready to print and sign.
            </p>
            <div className="hero-cta-group">
              <span className="cta-primary" style={{ cursor: 'default', opacity: 0.6 }}>
                Start Your Will — Coming Soon
              </span>
              <a className="cta-secondary" href="#how-it-works">
                How it works
              </a>
            </div>
            <div className="trust-pill">
              <CheckIcon />
              Texas-law formatted documents
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* Benefits */}
      <section className="landing-section" style={{ background: 'var(--bg-alt)', padding: '80px 24px' }}>
        <div className="section-header">
          <p className="section-label">What you get</p>
          <h2 className="section-title">A complete will packet, ready to sign.</h2>
        </div>
        <div className="benefit-row">
          <h3 className="benefit-title">Last Will and Testament</h3>
          <p className="benefit-desc">
            A typed attested will that names your executor, beneficiaries, and guardians
            for minor children. Formatted to meet Texas Probate Code execution
            requirements from the start.
          </p>
        </div>
        <div className="benefit-row">
          <h3 className="benefit-title">Self-Proving Affidavit</h3>
          <p className="benefit-desc">
            Included to streamline probate. Your executor can settle your estate faster
            with fewer court appearances and less paperwork after you are gone.
          </p>
        </div>
        <div className="benefit-row">
          <h3 className="benefit-title">Signing Checklist</h3>
          <p className="benefit-desc">
            Step-by-step instructions on how many witnesses you need, how to attach the
            affidavit, and where to store the final documents so they are found when
            needed.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-section" id="how-it-works">
        <div className="section-header">
          <p className="section-label">Process</p>
          <h2 className="section-title">Three steps. No confusion.</h2>
        </div>
        <div className="grid grid-3">
          <div style={{ paddingTop: 24, borderTop: '2px solid var(--text)' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Step 01
            </p>
            <h3 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 700 }}>Answer the questions</h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 15, lineHeight: 1.6 }}>
              We ask about your family, assets, and wishes. Most people finish in under
              ten minutes.
            </p>
          </div>
          <div style={{ paddingTop: 24, borderTop: '2px solid var(--text)' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Step 02
            </p>
            <h3 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 700 }}>Download your PDF</h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 15, lineHeight: 1.6 }}>
              Your answers are combined with precise legal language and returned as a
              customized, printable document.
            </p>
          </div>
          <div style={{ paddingTop: 24, borderTop: '2px solid var(--text)' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Step 03
            </p>
            <h3 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 700 }}>Sign and finalize</h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 15, lineHeight: 1.6 }}>
              Print, sign in front of two witnesses, and have the affidavit notarized.
              Your will is now legally binding in Texas.
            </p>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="landing-section">
        <div className="section-header">
          <p className="section-label">Why us</p>
          <h2 className="section-title">Built for Texas. Built for clarity.</h2>
          <p className="section-subtitle">
            Estate planning should be accessible to everyone. We strip out the confusion
            so you can focus on what matters.
          </p>
        </div>
        <div className="grid grid-2" style={{ gap: 16 }}>
          <div style={{ padding: '24px 0', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>No legal jargon</h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 15, lineHeight: 1.6 }}>
              Plain-language questions. You answer in English, we handle the legal
              formatting.
            </p>
          </div>
          <div style={{ padding: '24px 0', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>Complex cases flagged</h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 15, lineHeight: 1.6 }}>
              Blended families, business ownership, or multi-state assets trigger a
              recommendation to speak with a Texas attorney.
            </p>
          </div>
          <div style={{ padding: '24px 0', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>Private by default</h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 15, lineHeight: 1.6 }}>
              Your data is used only to generate your documents. We do not sell or share
              your personal information.
            </p>
          </div>
          <div style={{ padding: '24px 0', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>Texas probate formatted</h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 15, lineHeight: 1.6 }}>
              Clauses and execution instructions are written specifically for Texas
              probate courts, not generic templates.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="landing-section">
        <div className="section-header">
          <p className="section-label">FAQ</p>
          <h2 className="section-title">Common questions.</h2>
        </div>
        <div className="faq-list">
          <div className="faq-item">
            <h4>Is an online will valid in Texas?</h4>
            <p>
              Yes. A will created online is valid in Texas as long as it meets state
              requirements: you must be at least 18 and of sound mind, and the will must
              be signed by you and two competent witnesses. Our documents include a
              self-proving affidavit to help streamline probate.
            </p>
          </div>
          <div className="faq-item">
            <h4>Do I need a lawyer to write a will in Texas?</h4>
            <p>
              No. You have the right to create your own will in Texas. However, if you
              have a blended family, significant assets, own a business, or expect your
              will to be contested, consulting a Texas estate attorney is recommended.
            </p>
          </div>
          <div className="faq-item">
            <h4>What is a self-proving affidavit?</h4>
            <p>
              A self-proving affidavit is a sworn statement attached to your will that
              confirms it was properly signed and witnessed. In Texas, this can speed up
              probate because the court may not need to contact the witnesses later.
            </p>
          </div>
          <div className="faq-item">
            <h4>How do I make my will legally binding?</h4>
            <p>
              After downloading your will packet, print it and sign it in the presence
              of two witnesses who are at least 14 years old. The self-proving affidavit
              should be signed in front of a notary public. Store your will in a safe,
              accessible place.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-section" style={{ paddingTop: 16 }}>
        <div className="cta-banner">
          <h2>Protect what matters most.</h2>
          <p>
            Start your Texas last will and testament today. It takes minutes and gives
            you and your family peace of mind.
          </p>
          <span className="cta-primary" style={{ cursor: 'default', opacity: 0.6 }}>
            Start Your Will — Coming Soon
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p className="disclaimer">
          <strong>Not legal advice.</strong> Texas Will Generator is a document-preparation
          workflow. Complex cases are routed to attorney review. By using this service,
          you agree that no attorney-client relationship is formed. Always consult a
          licensed Texas attorney for complex estate planning needs.
        </p>
        <p style={{ marginTop: 16 }}>
          © {new Date().getFullYear()} Texas Will Generator
        </p>
      </footer>
    </>
  );
}
