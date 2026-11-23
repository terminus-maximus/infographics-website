/** Named replacements remain visible even with no observations; other summaries use usage order. */
export function visibleFlexOptions(team) {
  const options = team.flexAnalysis?.flex || team.flex;
  const featured = team.featuredReplacements || [];
  return featured.length
    ? featured.map(id => options.find(row => row.unit === id)).filter(Boolean)
    : options.filter(row => row.share !== null).slice(0, 5);
}
