import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IntakePage from '@/app/intake/page';
import { RiskBanner } from '@/components/RiskBanner';
import ResultsPage from '@/app/results/page';

const createObjectUrlMock = jest.fn(() => 'blob:test-url');
const revokeObjectUrlMock = jest.fn();

describe('intake wizard', () => {
  beforeEach(() => {
    createObjectUrlMock.mockClear();
    revokeObjectUrlMock.mockClear();

    Object.defineProperty(window, 'URL', {
      writable: true,
      value: {
        createObjectURL: createObjectUrlMock,
        revokeObjectURL: revokeObjectUrlMock,
      },
    });

    global.fetch = jest.fn((url: RequestInfo | URL) => {
      const target = String(url);

      if (target.endsWith('/intake/start')) {
        return Promise.resolve(
          new Response(JSON.stringify({ session_id: 'session-1', status: 'IN_PROGRESS' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }

      if (target.endsWith('/intake/answer')) {
        return Promise.resolve(
          new Response(JSON.stringify({ status: 'saved' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }

      if (target.endsWith('/will/generate')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              will_id: 'will-1',
              result: 'ELIGIBLE',
              documents: { will: '/tmp/will.pdf' },
              clause_ids: ['TX-INTRO-001'],
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        );
      }

      if (target.includes('/will/will-1/download?doc=will')) {
        return Promise.resolve(new Response(new Blob(['pdf']), { status: 200 }));
      }

      return Promise.resolve(new Response('Not found', { status: 404 }));
    }) as jest.Mock;
  });

  test('wizard validates required fields and generates download', async () => {
    render(<IntakePage />);

    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Please complete all required fields in this section.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Full legal name'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText('Date of birth'), { target: { value: '1985-02-02' } });
    fireEvent.change(screen.getByLabelText('Street address'), { target: { value: '1 Main St' } });
    fireEvent.change(screen.getByLabelText('Texas county'), { target: { value: 'Travis' } });
    fireEvent.click(screen.getByText('Next'));

    fireEvent.change(screen.getByLabelText('Executor full name'), { target: { value: 'Alex Roe' } });
    fireEvent.click(screen.getByText('Next'));

    fireEvent.change(screen.getByLabelText('Primary beneficiary full name'), { target: { value: 'Taylor Roe' } });
    fireEvent.click(screen.getByText('Next'));

    fireEvent.click(screen.getByText('Generate & Download PDF'));

    await waitFor(() => {
      expect(screen.getByText(/was generated and downloaded/i)).toBeInTheDocument();
      expect(createObjectUrlMock).toHaveBeenCalled();
    });
  });
});

test('risk banner renders', () => {
  render(<RiskBanner result="ATTORNEY_REVIEW_REQUIRED" flags={['Complex asset planning required']} />);
  expect(screen.getByText('ATTORNEY_REVIEW_REQUIRED')).toBeInTheDocument();
});

test('results page eligible state', () => {
  render(<ResultsPage />);
  expect(screen.getByText('Texas Will Draft')).toBeInTheDocument();
  expect(screen.getByText(/After Download: Execute and Store Your Documents/i)).toBeInTheDocument();
  expect(screen.getByText(/How to execute this will in Texas/i)).toBeInTheDocument();
});

test('intake page shows legal disclaimer guidance', () => {
  render(<IntakePage />);
  expect(screen.getByText(/Before You Sign: Texas Execution Checklist/i)).toBeInTheDocument();
  expect(screen.getByText(/This app is document preparation software/i)).toBeInTheDocument();
  expect(screen.getByText(/Next steps/i)).toBeInTheDocument();
});
