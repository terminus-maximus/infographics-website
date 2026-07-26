export type LreCharacter = "Lucius" | "Uthar" | "Farsight" | "Lysander";

export function getLreBasicsContent(character: LreCharacter): string {
  return `
## Event Overview

${character} is unlocked through a Legendary Release Event, where players earn points by clearing battles across multiple tracks and requirements.

## Event Goal

The goal is to earn enough points to unlock ${character}.

If you do not unlock ${character} during the current event, your progress is saved and will continue when the event returns.

## Requirements and Tracks

Each event is divided into multiple tracks with different enemy types, restrictions, and scoring opportunities.

Common requirements include:

* Faction restrictions
* Damage type restrictions
* Trait restrictions
* Rarity or character limitations
* Survival-based scoring

Each battle also awards **Defeat All** points simply for clearing the stage and defeating every enemy, regardless of which listed requirements your team satisfies. Do not abandon a track just because you cannot meet its requirements.

Newer players should use their strongest reliable team to push every track as far as possible and collect these points, then return with specialized teams to pursue additional requirement points.

Even when your roster cannot complete many requirements yet, Defeat All points provide meaningful progress that carries into future appearances of the event.

The best teams usually balance:

* Requirement coverage
* Survivability
* Damage output
* Character availability
* Long-term roster value

## Team Planning

Some strong teams stack multiple requirements at once, while others focus on high-value single requirements with reliable characters.

This guide prioritizes practical teams that newer and mid-game players are more likely to build and survive with, without relying only on perfect end-game rosters.

## Long-Term Strategy

Legendary Release Events reward preparation.

Investing in flexible characters, healers, durable tanks, summoners, and commonly reused damage types can improve performance across multiple future events and other modes.
`;
}
