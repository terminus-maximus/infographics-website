import rawData from "../data/campaign-events/guides.json";
import requiredHeroCsv from "../data/campaign-events/required-heroes.csv?raw";
import { assembleCampaignEvents } from "./campaign-events-editorial.mjs";
import type { CampaignEventData, CampaignEventGuide, ClearObservation } from "../data/campaign-events/types";
import { observationCoverage, qualifiesForThreshold, validateCampaignEvents } from "./campaign-events-validation.mjs";

export const campaignEventData = assembleCampaignEvents(rawData, requiredHeroCsv) as CampaignEventData;
const errors = validateCampaignEvents(campaignEventData);
if (errors.length) throw new Error(`Invalid Campaign Event content:\n${errors.join("\n")}`);

export const campaignEvents = [...campaignEventData.events].sort((a, b) => a.displayTitle.localeCompare(b.displayTitle, "en"));
export const eventCharacters = campaignEventData.characters;
export const eventSnapshot = campaignEventData.snapshot;
export const guideHref = (guide: CampaignEventGuide) => `/campaign-event/${guide.slug}/`;
export const qualifiesForThreeMedal = (observation: ClearObservation, requiredHeroIds: string[]) =>
  qualifiesForThreshold(observation, requiredHeroIds);
export { qualifiesForThreshold };

/** Counts describe distinct original clears, never uploads or population win rates. */
export function coverage(guide: CampaignEventGuide, heroId?: string) {
  return observationCoverage(guide, heroId);
}
