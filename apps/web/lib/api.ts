export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export interface IntakePayload {
  testator: {
    name: string;
    dob: string;
    address: string;
    county: string;
    marital_status: 'single' | 'married' | 'divorced' | 'widowed';
    state: string;
  };
  capacity_confirmations: {
    age_18_plus: boolean;
    sound_mind: boolean;
    voluntary: boolean;
    revoke_prior_wills: boolean;
  };
  family: {
    spouse: null;
    children: [];
    descendants_of_deceased_children: boolean;
    has_minor_children: boolean;
    blended_family: boolean;
  };
  fiduciaries: {
    executor: {
      name: string;
      relationship: string;
      age: number;
      special_needs: boolean;
    };
    alternates: [];
    independent_administration: boolean;
    waive_bond: boolean;
  };
  guardians: {
    guardian_for_minors: null;
    alternate_guardian: null;
  };
  gifts: {
    specific_bequests: [];
    fallback_to_residuary: boolean;
  };
  residuary_beneficiaries: Array<{
    beneficiary: {
      name: string;
      relationship: string;
      age: number;
      special_needs: boolean;
    };
    percentage: number;
  }>;
  special_clauses: {
    survivorship_days: number;
    simultaneous_death_clause: boolean;
    disinheritance_flag: boolean;
    digital_assets: boolean;
  };
  execution_preferences: {
    two_witnesses_confirmed: boolean;
    self_proving_affidavit_intent: boolean;
  };
  complex_assets: string[];
}

export interface GenerateResponse {
  will_id: string;
  result: 'ELIGIBLE' | 'ELIGIBLE_WITH_WARNING' | 'ATTORNEY_REVIEW_REQUIRED';
  documents: Record<string, string>;
  clause_ids: string[];
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const json = await response.json();
      detail = json?.detail ? JSON.stringify(json.detail) : detail;
    } catch {
      // ignore json parse error
    }
    throw new Error(detail);
  }

  return (await response.json()) as T;
}

export async function startIntake(): Promise<{ session_id: string }> {
  return apiRequest('/intake/start', { method: 'POST' });
}

export async function saveIntakeAnswer(sessionId: string, data: IntakePayload): Promise<void> {
  await apiRequest('/intake/answer', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId, data }),
  });
}

export async function generateWill(sessionId: string): Promise<GenerateResponse> {
  return apiRequest('/will/generate', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId }),
    headers: {
      'Idempotency-Key': `${sessionId}-${Date.now()}`,
    },
  });
}

export async function downloadWillPdf(willId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/will/${willId}/download?doc=will`);
  if (!response.ok) {
    throw new Error(`Unable to download will (${response.status})`);
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = `texas_will_${willId}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
}

export async function submitLead(email: string, source = 'landing_page'): Promise<{ id: number; email: string; created_at: string }> {
  return apiRequest('/leads', {
    method: 'POST',
    body: JSON.stringify({ email, source }),
  });
}
