import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';

describe('App Component', () => {
  beforeEach(() => {
    // Reset any mocks before each test
  });

  it('renders the app title', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/PTE Pronunciation/i)).toBeInTheDocument();
    });
  });

  it('renders the Progress button', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Progress/i })).toBeInTheDocument();
    });
  });

  it('renders the AI Tutor button', async () => {
    render(<App />);
    await waitFor(() => {
      const buttons = screen.getAllByRole('button', { name: /AI Tutor/i });
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('renders the Insights button', async () => {
    render(<App />);
    await waitFor(() => {
      const buttons = screen.getAllByRole('button', { name: /Insights/i });
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('renders the Score button', async () => {
    render(<App />);
    await waitFor(() => {
      const buttons = screen.getAllByRole('button', { name: /Score/i });
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('renders the Settings button', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Settings/i })).toBeInTheDocument();
    });
  });

  it('displays the app version in footer', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/v\d+\.\d+\.\d+/i)).toBeInTheDocument();
    });
  });
});
