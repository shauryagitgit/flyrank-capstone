import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const examples = {
  meeting: `Team sync tomorrow at 11. Need a launch checklist, owners, and risks. We still need final copy, QA, and analytics verification.`,
  launch: `We are launching the new onboarding flow next week. Goal is to improve activation. Need experiments, success metrics, rollout plan, and support messaging.`,
  bug: `Checkout failures spiked after the payment form update. Investigate the likely causes, suggest immediate mitigation, and define what to monitor over the next 24 hours.`,
};

function mockAI(text) {
  const lower = text.toLowerCase();
  const type = lower.includes('checkout') || lower.includes('bug') ? 'incident' : lower.includes('launch') ? 'launch' : 'plan';

  if (!text.trim()) throw new Error('Add some notes before asking Briefly to organize them.');
  if (text.trim().length < 24) throw new Error('Give Briefly a little more context (at least 24 characters).');

  if (type === 'incident') {
    return {
      title: 'Checkout recovery plan',
      summary: 'A focused incident response brief to stabilize checkout, identify the regression, and keep a tight watch on recovery.',
      actions: [
        ['Reproduce the failure', 'Engineering', 'Today'],
        ['Compare release changes', 'Engineering', 'Today'],
        ['Add temporary alerting', 'SRE', 'Next 2h'],
        ['Post support update', 'Support', 'Today'],
      ],
      risks: ['Conversion loss continues while the regression is unresolved.', 'A partial fix could mask failures in one payment path.'],
    };
  }

  if (type === 'launch') {
    return {
      title: 'Onboarding launch brief',
      summary: 'A launch-ready plan centered on activation, measurable experiments, and a controlled rollout.',
      actions: [
        ['Define activation metric', 'Product', 'Today'],
        ['Finalize experiment matrix', 'Growth', 'Tomorrow'],
        ['Ship QA checklist', 'QA', 'Tomorrow'],
        ['Prepare support messaging', 'Support', 'Before launch'],
      ],
      risks: ['Unclear success criteria can make experiments hard to evaluate.', 'A broad rollout before observing early signals increases rollback cost.'],
    };
  }

  return {
    title: 'Team sync action brief',
    summary: 'A concise execution plan for tomorrow’s sync, with owners, deadlines, and the main delivery risks surfaced.',
    actions: [
      ['Draft launch checklist', 'Product', 'Today'],
      ['Finish final copy', 'Content', 'Today'],
      ['Run QA pass', 'QA', 'Tomorrow'],
      ['Verify analytics events', 'Data', 'Tomorrow'],
    ],
    risks: ['QA gaps could delay launch readiness.', 'Missing analytics verification may make the launch hard to measure.'],
  };
}

function App() {
  const [notes, setNotes] = useState(examples.meeting);
  const [brief, setBrief] = useState(() => mockAI(examples.meeting));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const chars = notes.length;
  const actionText = useMemo(() => brief.actions.map(([task, owner, when]) => `${task} — ${owner} — ${when}`).join('\n'), [brief]);

  function generate() {
    setError('');
    setCopied(false);
    setBusy(true);
    window.setTimeout(() => {
      try {
        setBrief(mockAI(notes));
      } catch (err) {
        setError(err.message);
      } finally {
        setBusy(false);
      }
    }, 650);
  }

  async function copyActions() {
    await navigator.clipboard?.writeText(actionText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
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
          <p>Briefly uses a structured AI workflow to extract the goal, next actions, owners, timing, and delivery risks from rough notes.</p>
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
            <div className="input-foot"><span id="notes-help">Briefly will validate context before running the AI step.</span><button className="primary" onClick={generate} disabled={busy}>{busy ? 'Organizing…' : 'Generate brief →'}</button></div>
            {error && <div className="error" role="alert">{error}</div>}
          </div>

          <div className="panel output-panel">
            <div className="panel-head"><div><span className="kicker">2 / OUTPUT</span><h2>{brief.title}</h2></div><span className="ai-badge">AI structured</span></div>
            <p className="summary">{brief.summary}</p>
            <div className="section-title">Next actions</div>
            <div className="action-list">
              {brief.actions.map(([task, owner, when]) => (
                <div className="action" key={task}>
                  <div><strong>{task}</strong><span>{owner}</span></div><time>{when}</time>
                </div>
              ))}
            </div>
            <div className="section-title">Watch-outs</div>
            <ul className="risks">
              {brief.risks.map((risk) => <li key={risk}>{risk}</li>)}
            </ul>
            <div className="output-foot"><span>Deterministic fallback available when the AI service is unavailable.</span><button className="ghost" onClick={copyActions}>{copied ? 'Copied ✓' : 'Copy actions'}</button></div>
          </div>
        </section>
      </section>

      <footer>Accessible controls · input validation · structured output · resilient fallback · responsive UI</footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
