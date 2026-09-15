import { describe, expect, it } from 'vitest';
import { fallback, validateBrief } from './brief.js';

describe('Briefly structured output', () => {
  it('creates a useful fallback from arbitrary project notes', () => {
    const result = fallback('Checkout errors increased after the payment update. Investigate the root cause. Prepare a safe rollback. Monitor failures for the next 24 hours.');

    expect(result.source).toBe('fallback');
    expect(result.title).toContain('action brief');
    expect(result.actions.length).toBeGreaterThanOrEqual(3);
    expect(result.risks.length).toBeGreaterThanOrEqual(2);
  });

  it('accepts valid structured AI output and clamps fields', () => {
    const result = validateBrief({
      title: 'Launch brief',
      summary: 'Prepare the release.',
      actions: [['Finish QA', 'Engineering', 'Tomorrow']],
      risks: ['QA may uncover blockers.'],
    });

    expect(result).not.toBeNull();
    expect(result.source).toBe('ai-gateway');
  });

  it('rejects malformed structured output', () => {
    expect(validateBrief({ title: 'Bad', summary: 'Missing actions', risks: [] })).toBeNull();
    expect(validateBrief(null)).toBeNull();
  });
});
