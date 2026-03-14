import { render, screen, fireEvent } from '@testing-library/react';
import IntakePage from '@/app/intake/page';
import { RiskBanner } from '@/components/RiskBanner';
import ResultsPage from '@/app/results/page';

test('wizard step navigation and required field validation', () => {
  render(<IntakePage />);
  fireEvent.click(screen.getByText('Next'));
  expect(screen.getByText('Name is required')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Full legal name'), { target: { value: 'Jane Doe' } });
  fireEvent.click(screen.getByText('Next'));
  expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
});

test('risk banner renders', () => {
  render(<RiskBanner result="ATTORNEY_REVIEW_REQUIRED" flags={['Complex asset planning required']} />);
  expect(screen.getByText('ATTORNEY_REVIEW_REQUIRED')).toBeInTheDocument();
});

test('results page eligible state', () => {
  render(<ResultsPage />);
  expect(screen.getByText('Texas Will Draft')).toBeInTheDocument();
});
