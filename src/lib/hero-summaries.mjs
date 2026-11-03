import summarySource from '../data/heroes/overall-summaries.json' with { type: 'json' };

/** Editorial bands use the full overall score, never the ordinal roster rank. */
export function summaryTone(score) {
  if (score === null) return 'pending';
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 1 || score > 10) throw new Error(`Invalid overall summary score: ${score}`);
  if (score >= 8) return 'powerful';
  if (score >= 6) return 'optimistic';
  if (score >= 5) return 'measured';
  if (score >= 4) return 'cautious';
  if (score >= 3) return 'guarded';
  if (score >= 2) return 'weak';
  return 'poor';
}

/** @type {Record<string,{tone:string,text:string}>} */
export const overallSummaries = summarySource.summaries;

export function overallSummary(unitId, score) {
  const summary = overallSummaries[unitId];
  if (!summary?.text?.trim() || summary.text.trim().split(/\s+/u).length > 15) throw new Error(`Overall summary must contain 1–15 words: ${unitId}`);
  if (summary.tone !== summaryTone(score)) throw new Error(`Review overall summary after score band change: ${unitId}`);
  return summary.text;
}
