const milestones = { S1:'Silver I', G1:'Gold I', D1:'Diamond I', D3:'Diamond III', A2:'Adamantine II' };

/** Use one benchmark from the entire relevant roster, including frozen editions. */
export function popularityBenchmark(heroes) {
  let benchmark = null;
  for (const hero of heroes) {
    for (const [milestone, label] of Object.entries(milestones)) {
      const count = hero.assessments.popularity.counts?.[milestone];
      if (Number.isFinite(count) && count > (benchmark?.count ?? 0)) {
        benchmark = { count, hero:hero.name, milestone, label };
      }
    }
  }
  return benchmark;
}

/** Presentation only: percentages do not change the independently normalized score. */
export function popularityInsight(assessment, benchmark) {
  if (!benchmark || !['G1','D3','A2'].every(key => Number.isFinite(assessment.counts?.[key]))) {
    return 'Assessment pending';
  }
  const percentage = count => {
    const value = count / benchmark.count * 100;
    return value > 0 && value < 0.1 ? '<0.1%' : `${value.toFixed(1)}%`;
  };
  return `Planner investment: ${percentage(assessment.counts.G1)} at Gold I or higher, ${percentage(assessment.counts.D3)} at Diamond III or higher and ${percentage(assessment.counts.A2)} at Adamantine II.`;
}
