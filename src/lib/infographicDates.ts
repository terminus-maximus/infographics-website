import revisions from '../data/infographicRevisions.json';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

export function formatInfographicDate(isoDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) throw new Error(`Invalid infographic date: ${isoDate}`);
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(`${isoDate}T12:00:00Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== isoDate) {
    throw new Error(`Invalid infographic date: ${isoDate}`);
  }
  return `${months[month - 1]} ${day}, ${year}`;
}

export function getInfographicRevision(imageSrc: string) {
  const revision = (revisions as Record<string, { updatedOn: string; commit: string }>)[imageSrc];
  if (!revision) throw new Error(`Missing PNG revision date for ${imageSrc}; update src/data/infographicRevisions.json from Git history.`);
  return { ...revision, formattedDate: formatInfographicDate(revision.updatedOn) };
}
