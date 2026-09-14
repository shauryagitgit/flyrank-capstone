import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const examples = {
  meeting: `Team sync tomorrow at 11. Need a launch checklist, owners, and risks. We still need final copy, QA, and analytics verification.`,
  launch: `We are launching the new onboarding flow next week. Goal is to improve activation. Need experiments, success metrics, rollout plan, and support messaging.`,
  bug: `Checkout failures spiked after the payment form update. Investigate the likely causes, suggest immediate mitigation, and define what to monitor over the next 24 hours.`,
};

const initialBrief = {
  title: 'Team sync action brief',
  summary: 'Ready to turn the notes into a structured execution brief with concrete actions, owners, timing, and risks.',
  actions: [
    ['Draft the launch checklist', 'Product', 'Today'],
    ['Finish final copy', 'Content', 'Today'],
    ['Run QA pass', 'QA', 'Tomorrow'],
    ['Verify analytics events', 'Data', 'Tomorrow'],
  ],
  risks: ['QA gaps could delay launch readiness.', 'Missing analytics verification may make the launch hard to measure.'],
};

function App() {
  const [notes, setNotes] = useState(examples.meeting);
  const [brief, setBrief] = useState(initialBrief);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [source, setSource] = useState('ready');

  const chars = notes.length;
  const actionText = useMemo(() => brief.actions.map(([task, owner, when]) => `${task} — ${owner} — ${when}`).join('\n'), [brief]);

  async function generate() {
    setError('');
    setCopied(false);
    const cleanNotes = notes.trim();
    if (!cleanNotes) {
      setError('Add some notes before asking Briefly to organize them.');
      return;
    }
    if (cleanNotes.length < 24) {
      setError('Give Briefly a little more context (at least 24 characters).');
      return;
    }

    setBusy(true);
    try {
      const response = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: cleanNotes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not generate the brief.');
      setBrief(data);
      setSource(data.source || 'ai-gateway');
    } catch (err) {
      setError(err.message || 'Could not generate the brief.');
    } finally {
      setBusy(false);
    }
  }

  async function copyActions() {
    try {
      await navigator.clipboard?.writeText(actionText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError('Copy is unavailable in this browser.');
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">BRIEFLY<span>AI</span></div>
        <div className="top-status"><span className="status-dot" /> Production-ready demo</div>
      </header>

      <section className="hero">
        <div className="intro">
          <div className="eyebrow">FLYRANK / CAPSTONE</div>
          <h1>Turn messy notes into a brief your team can act on.</h1>
          <p>Briefly sends your notes through a server-side AI step and renders the result as structured actions, owners, timing, and delivery risks.</p>
          <div className="examples" aria-label="Example prompts">
            {Object.entries(examples).map(([key, value]) => (
              <button key={key} className="example" onClick={() => { setNotes(value); setError(''); }} aria-label={`Load ${key} example`}>
                {key}
              </button>
            ))}
          </div>
        </div>

        <section className="workspace" aria-label="Briefly AI workspace">
          <div className="panel input-panel">
            <div className="panel-head"><div><span className="kicker">1 / INPUT</span><h2>Paste the messy version.</h2></div><span className="counter">{chars} chars</span></div>
            <label htmlFor="notes">Project notes</label>
            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} aria-describedby="notes-help" />
            <div className="input-foot"><span id="notes-help">Your notes are sent to the server-side AI route; credentials never reach the browser.</span><button className="primary" onClick={generate} disabled={busy}>{busy ? 'Organizing…' : 'Generate brief →'}</button></div>
            {error && <div className="error" role="alert">{error}</div>}
          </div>

          <div className="panel output-panel">
            <div className="panel-head"><div><span className="kicker">2 / OUTPUT</span><h2>{brief.title}</h2></div><span className="ai-badge">{source === 'fallback' ? 'Fallback structured' : source === 'ready' ? 'Ready' : 'AI structured'}</span></div>
            <p className="summary">{brief.summary}</p>
            <div className="section-title">Next actions</div>
            <div className="action-list">
              {brief.actions.map(([task, owner, when], index) => (
                <div className="action" key={`${task}-${index}`}>
                  <div><strong>{task}</strong><span>{owner}</span></div><time>{when}</time>
                </div>
              ))}
            </div>
            <div className="section-title">Watch-outs</div>
            <ul className="risks">
              {brief.risks.map((risk, index) => <li key={`${risk}-${index}`}>{risk}</li>)}
            </ul>
            <div className="output-foot"><span>AI first, validated structured fallback when the model is unavailable.</span><button className="ghost" onClick={copyActions}>{copied ? 'Copied ✓' : 'Copy actions'}</button></div>
          </div>
        </section>
      </section>

      <footer>Server-side AI · input validation · structured output · resilient fallback · accessible controls · responsive UI</footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
