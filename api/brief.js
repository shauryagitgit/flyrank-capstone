import { generateText } from 'ai';

export const fallback = (notes) => {
  const text = notes.trim();
  const lower = text.toLowerCase();
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const focus = sentences[0]?.replace(/[.!?]+$/, '') || 'the project';
  const type = /bug|error|failure|incident|outage|broken|issue/.test(lower)
    ? 'incident'
    : /launch|release|ship|rollout|deploy/.test(lower)
      ? 'launch'
      : /design|ui|ux|frontend|website|page|component/.test(lower)
        ? 'product'
        : 'plan';

  const actionSeeds = sentences.slice(1, 5).map((s) => s.replace(/[.!?]+$/, '')).filter(Boolean);
  const defaults = type === 'incident'
    ? [['Reproduce and isolate the issue','Engineering','Today'],['Confirm the likely cause','Engineering','Today'],['Apply and verify the safest mitigation','Engineering','Next 2h'],['Share status and next check-in','Owner','Today']]
    : type === 'launch'
      ? [['Confirm launch scope and success criteria','Product','Today'],['Finish remaining implementation and QA','Engineering','Tomorrow'],['Verify analytics and monitoring','Data','Before launch'],['Prepare rollout and rollback plan','Product','Before launch']]
      : type === 'product'
        ? [['Clarify the user outcome','Product','Today'],['Implement the highest-impact change','Engineering','Tomorrow'],['Review UX and accessibility','Design','Tomorrow'],['Validate with a realistic user flow','QA','Before release']]
        : [['Turn the notes into a concrete next action list','Owner','Today'],['Assign owners to the highest-priority work','Team','Today'],['Validate dependencies and timing','Project lead','Tomorrow'],['Review progress against the stated goal','Team','Next check-in']];

  return {
    title: `${focus.slice(0, 52)} — action brief`,
    summary: `A structured plan built from the provided notes, focused on ${type === 'incident' ? 'stabilizing the issue and reducing risk' : type === 'launch' ? 'shipping with clear readiness checks' : type === 'product' ? 'turning the product request into an executable plan' : 'turning the notes into accountable next steps'}.`,
    actions: actionSeeds.length >= 2
      ? actionSeeds.slice(0, 4).map((s, i) => [s.slice(0, 72), defaults[Math.min(i, defaults.length - 1)][1], defaults[Math.min(i, defaults.length - 1)][2]])
      : defaults,
    risks: [
      `${type === 'incident' ? 'The underlying issue' : 'The stated goal'} may remain unresolved without a concrete owner and checkpoint.`,
      'Missing dependencies or unclear success criteria could delay the next step.',
    ],
    source: 'fallback',
  };
};

export function validateBrief(value) {
  if (!value || typeof value !== 'object') return null;
  if (typeof value.title !== 'string' || typeof value.summary !== 'string') return null;
  if (!Array.isArray(value.actions) || value.actions.length === 0 || value.actions.some((a) => !Array.isArray(a) || a.length < 3)) return null;
  if (!Array.isArray(value.risks) || value.risks.length === 0) return null;
  return {
    title: value.title.slice(0, 100),
    summary: value.summary.slice(0, 500),
    actions: value.actions.slice(0, 5).map((a) => [String(a[0]).slice(0, 100), String(a[1]).slice(0, 40), String(a[2]).slice(0, 40)]),
    risks: value.risks.slice(0, 4).map((r) => String(r).slice(0, 180)),
    source: 'ai-gateway',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const notes = typeof req.body?.notes === 'string' ? req.body.notes.trim() : '';
    if (!notes) return res.status(400).json({ error: 'Add some notes before generating a brief.' });
    if (notes.length < 24) return res.status(400).json({ error: 'Give Briefly a little more context (at least 24 characters).' });
    if (notes.length > 12000) return res.status(400).json({ error: 'Please keep the notes under 12,000 characters.' });

    try {
      const result = await generateText({
        model: 'openai/gpt-5.6-sol',
        system: `You are Briefly, an AI project-briefing assistant. Turn rough project notes into a concise execution brief. Return ONLY valid JSON with this exact shape: {"title":"string","summary":"string","actions":[["task","owner","timing"]],"risks":["string"]}. Extract concrete details from the user's notes. Do not invent people, dates, metrics, or facts. Use 3-5 actions and 2-3 risks.`,
        prompt: notes,
      });

      const cleaned = result.text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = validateBrief(JSON.parse(cleaned));
      if (parsed) return res.status(200).json(parsed);
    } catch (aiError) {
      console.error('AI generation failed; using fallback:', aiError?.message || aiError);
    }

    return res.status(200).json(fallback(notes));
  } catch (error) {
    console.error('Brief API error:', error);
    return res.status(500).json({ error: 'Could not generate a brief right now.' });
  }
}
