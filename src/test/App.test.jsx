import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../main';


describe('Briefly capstone', () => {
  it('renders the main workspace', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Turn messy notes into a brief/i })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Project notes' })).toBeVisible();
  });

  it('shows an accessible action button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Generate brief/i })).toBeEnabled();
  });

  it('loads an example prompt', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Load launch example' }));
    expect(screen.getByRole('textbox', { name: 'Project notes' })).toHaveValue(expect.stringContaining('onboarding flow'));
  });

  it('validates short input without generating', async () => {
    const user = userEvent.setup();
    render(<App />);
    const notes = screen.getByRole('textbox', { name: 'Project notes' });
    await user.clear(notes);
    await user.type(notes, 'too short');
    await user.click(screen.getByRole('button', { name: /Generate brief/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/at least 24 characters/i);
  });

  it('generates a structured incident brief', async () => {
    const user = userEvent.setup();
    render(<App />);
    const notes = screen.getByRole('textbox', { name: 'Project notes' });
    await user.clear(notes);
    await user.type(notes, 'Checkout failures are increasing after the payment form update. Investigate causes and mitigation.');
    await user.click(screen.getByRole('button', { name: /Generate brief/i }));
    expect(await screen.findByRole('heading', { name: 'Checkout recovery plan' })).toBeVisible();
    expect(screen.getByText('Reproduce the failure')).toBeVisible();
  });

  it('generates launch actions', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Load launch example' }));
    await user.click(screen.getByRole('button', { name: /Generate brief/i }));
    expect(await screen.findByText('Define activation metric')).toBeVisible();
    expect(screen.getByText('Support')).toBeVisible();
  });

  it('copies the generated actions', async () => {
    const user = userEvent.setup();
    Object.assign(navigator, { clipboard: { writeText: async () => {} } });
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Copy actions/i }));
    expect(await screen.findByRole('button', { name: /Copied/i })).toBeVisible();
  });
});
