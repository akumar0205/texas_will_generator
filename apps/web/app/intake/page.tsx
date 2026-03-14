'use client';
import { useMemo, useState } from 'react';
import { FormField } from '@/components/FormField';
import { ProgressStepper } from '@/components/ProgressStepper';
import { BeneficiarySplitEditor } from '@/components/BeneficiarySplitEditor';

const steps = ['About You','Family','Executor','Gifts','Special','Review'];

export default function IntakePage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [state, setState] = useState('TX');
  const [requiredError, setRequiredError] = useState('');

  const total = useMemo(() => 100, []);

  const next = () => {
    if (step === 0 && !name) {
      setRequiredError('Name is required');
      return;
    }
    setRequiredError('');
    setStep((s) => Math.min(steps.length - 1, s + 1));
  };

  return (
    <main className="grid">
      <h1>Guided Intake</h1>
      <ProgressStepper current={step} />
      <div className="grid grid-2">
        <div className="card grid">
          {step === 0 && <>
            <FormField label="Full legal name" error={requiredError}><input aria-label="Full legal name" className="input" value={name} onChange={(e) => setName(e.target.value)} /></FormField>
            <FormField label="State" helper="Texas-only workflow"><input aria-label="State" className="input" value={state} onChange={(e) => setState(e.target.value)} /></FormField>
          </>}
          {step === 3 && <BeneficiarySplitEditor total={total} />}
          {step === 5 && <p>Review your selections before generation.</p>}
          <div style={{ display:'flex', gap:8 }}>
            <button className="button" onClick={() => setStep((s) => Math.max(0, s - 1))}>Back</button>
            <button className="button" onClick={next}>Next</button>
          </div>
        </div>
        <aside className="card">
          <h3>Ask assistant</h3>
          <p>Plain-English clarification panel (LangChain-backed in API).</p>
        </aside>
      </div>
    </main>
  );
}
