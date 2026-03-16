'use client';

import { useMemo, useState } from 'react';

import { FormField } from '@/components/FormField';
import { LegalGuidancePanel } from '@/components/LegalGuidancePanel';
import { ProgressStepper } from '@/components/ProgressStepper';
import {
  downloadWillPdf,
  generateWill,
  saveIntakeAnswer,
  startIntake,
  type IntakePayload,
} from '@/lib/api';

const steps = ['About You', 'Executor', 'Beneficiary', 'Generate'];

export default function IntakePage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [county, setCounty] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married' | 'divorced' | 'widowed'>('single');
  const [executorName, setExecutorName] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [requiredError, setRequiredError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = useMemo(() => 100, []);

  const validateStep = () => {
    if (step === 0 && (!name || !dob || !address || !county)) {
      setRequiredError('Please complete all required fields in this section.');
      return false;
    }

    if (step === 1 && !executorName) {
      setRequiredError('Executor name is required.');
      return false;
    }

    if (step === 2 && !beneficiaryName) {
      setRequiredError('Primary beneficiary name is required.');
      return false;
    }

    setRequiredError('');
    return true;
  };

  const next = () => {
    if (!validateStep()) {
      return;
    }

    setStep((s) => Math.min(steps.length - 1, s + 1));
  };

  const buildPayload = (): IntakePayload => ({
    testator: {
      name,
      dob,
      address,
      county,
      marital_status: maritalStatus,
      state: 'TX',
    },
    capacity_confirmations: {
      age_18_plus: true,
      sound_mind: true,
      voluntary: true,
      revoke_prior_wills: true,
    },
    family: {
      spouse: null,
      children: [],
      descendants_of_deceased_children: false,
      has_minor_children: false,
      blended_family: false,
    },
    fiduciaries: {
      executor: {
        name: executorName,
        relationship: 'executor',
        age: 40,
        special_needs: false,
      },
      alternates: [],
      independent_administration: true,
      waive_bond: true,
    },
    guardians: {
      guardian_for_minors: null,
      alternate_guardian: null,
    },
    gifts: {
      specific_bequests: [],
      fallback_to_residuary: true,
    },
    residuary_beneficiaries: [
      {
        beneficiary: {
          name: beneficiaryName,
          relationship: 'beneficiary',
          age: 35,
          special_needs: false,
        },
        percentage: total,
      },
    ],
    special_clauses: {
      survivorship_days: 120,
      simultaneous_death_clause: true,
      disinheritance_flag: false,
      digital_assets: true,
    },
    execution_preferences: {
      two_witnesses_confirmed: true,
      self_proving_affidavit_intent: true,
    },
    complex_assets: [],
  });

  const handleGenerate = async () => {
    if (!validateStep()) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Submitting your answers and generating your Texas will PDF...');

    try {
      const payload = buildPayload();
      const started = await startIntake();
      await saveIntakeAnswer(started.session_id, payload);
      const generated = await generateWill(started.session_id);
      await downloadWillPdf(generated.will_id);

      setStatusMessage('Your Texas will PDF was generated and downloaded. Please review and execute with witnesses.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to generate will right now.';
      setStatusMessage(`Generation failed: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid">
      <h1>Guided Intake</h1>
      <ProgressStepper current={step} />
      <div className="grid grid-2">
        <div className="card grid">
          {step === 0 && (
            <>
              <FormField label="Full legal name" error={requiredError}>
                <input
                  aria-label="Full legal name"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormField>
              <FormField label="Date of birth" error={requiredError}>
                <input
                  aria-label="Date of birth"
                  className="input"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </FormField>
              <FormField label="Street address" error={requiredError}>
                <input
                  aria-label="Street address"
                  className="input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </FormField>
              <FormField label="Texas county" error={requiredError}>
                <input
                  aria-label="Texas county"
                  className="input"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                />
              </FormField>
              <FormField label="Marital status" helper="Used in core Texas will clauses">
                <select
                  aria-label="Marital status"
                  className="input"
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value as 'single' | 'married' | 'divorced' | 'widowed')}
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </FormField>
            </>
          )}

          {step === 1 && (
            <FormField label="Executor full name" error={requiredError} helper="Person who carries out your will">
              <input
                aria-label="Executor full name"
                className="input"
                value={executorName}
                onChange={(e) => setExecutorName(e.target.value)}
              />
            </FormField>
          )}

          {step === 2 && (
            <FormField label="Primary beneficiary full name" error={requiredError} helper="Receives 100% residuary estate in this simplified flow">
              <input
                aria-label="Primary beneficiary full name"
                className="input"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
              />
            </FormField>
          )}

          {step === 3 && (
            <div className="grid">
              <p>Review the answers, then generate and download your Texas will PDF.</p>
              <ul>
                <li>Testator: {name || '-'}</li>
                <li>Executor: {executorName || '-'}</li>
                <li>Primary beneficiary: {beneficiaryName || '-'}</li>
              </ul>
            </div>
          )}

          {statusMessage ? <p>{statusMessage}</p> : null}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={isSubmitting}
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button className="button" onClick={next} disabled={isSubmitting}>
                Next
              </button>
            ) : (
              <button className="button" onClick={handleGenerate} disabled={isSubmitting}>
                {isSubmitting ? 'Generating...' : 'Generate & Download PDF'}
              </button>
            )}
          </div>
        </div>

        <aside>
          <LegalGuidancePanel title="Before You Sign: Texas Execution Checklist" />
        </aside>
      </div>
    </main>
  );
}
