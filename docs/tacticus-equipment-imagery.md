# Tacticus Planner equipment imagery

This note records how the Tacticus Planner builds its small, hex-framed equipment images and how to reproduce the same visual treatment on Terminus Maximus. It is based on the deployed Planner equipment page, the complete compatibility export for the 24 guide characters, and the revised website assets in `public/images/equipment`.

## The image is a stack, not one flattened graphic

The Planner composes an equipment badge from separate transparent images:

1. **Equipment art** — the weapon, armor, booster, or other item, including its blue hexagonal background.
2. **Rarity frame** — a transparent frame placed over the equipment art. Its border color communicates rarity.
3. **Relic overlay, when applicable** — an additional transparent decoration placed above the normal rarity frame.

The stacking order is therefore:

```text
top     optional relic overlay
        rarity frame
bottom  equipment art and blue hex background
```

On the Planner, the outer badge is approximately `48 × 48` CSS pixels. The equipment layer is approximately 70% of that size (`33.6 × 33.6` pixels), centered inside it. The rarity frame fills the `48 × 48` box. A relic overlay also fills the outer box.

The source images are not consistently square. The Planner explicitly assigns both a CSS width and height, so the browser fits each layer into its square display box. To mimic the Planner closely, do the same rather than relying on each file's natural dimensions.

## Revised Terminus Maximus assets

The guide assets live at:

```text
/public/images/equipment
```

The folder currently contains:

- 504 transparent WebP equipment images covering all 24 profile characters.
- Four equipment rarity groups: Uncommon, Rare, Epic, and Legendary, with 126 files in each group.
- Six reusable frames in `/public/images/equipment/frames`: Common, Uncommon, Rare, Epic, Legendary, and Mythic.
- Equipment art with variable natural dimensions, all using RGBA transparency.
- Frames with a natural size of `111 × 128`, also using RGBA transparency.

The renamed WebP files and frames are pixel-equivalent to their corresponding source PNGs in the samples checked. The extension and naming have changed, but the art has not been flattened together. The item and frame should still be rendered as separate layers.

### Equipment filename grammar

```text
{terminus_name}-{slot_number}-{rarity}-{hyphenated-equipment-name}.webp
```

Examples:

```text
Tiggy-1-Legendary-Grand-Combat-Knife.webp
Tiggy-2-Rare-Sanctified-MK-X-Pauldron.webp
Tiggy-3-Epic-Frag-Grenades.webp
```

The four fields mean:

| Field | Meaning |
| --- | --- |
| `terminus_name` | The short character key from `Char_XREF`, such as `Tiggy`, `Abrax`, or `Calandis`. |
| `slot_number` | The character's equipment position: `1`, `2`, or `3`. It is not itself a universal equipment type. |
| `rarity` | The title-cased rarity used to select the frame. |
| Equipment name | The display name with spaces replaced by hyphens. It can contain several hyphen-separated words. |

A suitable parser for this specific asset set is:

```regex
^(?<character>[^-]+)-(?<slot>[123])-(?<rarity>Uncommon|Rare|Epic|Legendary)-(?<equipment>.+)\.webp$
```

Do not split the entire filename on hyphens and assume a fixed number of pieces; equipment names such as `Battle-Hardened-Frag-Grenades` and `MK-X-Pauldron` contain their own hyphens.

### Frame filename grammar

```text
/images/equipment/frames/frame-{lowercase-rarity}.webp
```

For example, a Legendary item uses:

```text
/images/equipment/frames/frame-legendary.webp
```

Even though `frame-common.webp` and `frame-mythic.webp` are present, the current character-specific equipment set contains only Uncommon through Legendary item files.

## Slot numbers and site labels

The number in the revised filename is the slot's position on the character. It must be mapped through character metadata to obtain the label shown by the Planner.

| Character | Slot 1 | Slot 2 | Slot 3 |
| --- | --- | --- | --- |
| Abrax | Crit | Block | Crit Booster |
| Aethana | Crit | Block | Block Booster |
| Aleph | Crit | Defensive | Crit Booster |
| Angrax | Crit | Block | Block Booster |
| Archi | Crit | Block | Crit Booster |
| Bella | Crit | Defensive | Crit Booster |
| Boss | Crit | Block | Block Booster |
| Burchard | Crit | Defensive | Crit Booster |
| Calandis | Crit | Crit | Crit Booster |
| Certus | Crit | Defensive | Crit Booster |
| Eldy | Crit | Block | Block Booster |
| Gibba | Crit | Defensive | Crit Booster |
| Godswyl | Crit | Defensive | Crit Booster |
| Haarken | Crit | Block | Crit Booster |
| Imo | Crit | Defensive | Crit Booster |
| Kut | Crit | Defensive | Defensive |
| Makho | Crit | Defensive | Crit Booster |
| Sibyll | Crit | Defensive | Crit Booster |
| Snappa | Crit | Defensive | Crit Booster |
| Thad | Crit | Defensive | Crit Booster |
| Thoread | Crit | Defensive | Crit Booster |
| Tiggy | Crit | Defensive | Crit Booster |
| Toth | Crit | Block | Block Booster |
| Yaz | Crit | Defensive | Crit Booster |

The two important exceptions to a simplistic `1/2/3 = Crit/Defensive/Booster` assumption are Calandis, who has two Crit slots, and Kut, who has two Defensive slots. Other characters also use Block and Block Booster instead of Defensive and Crit Booster.

## Recommended Astro markup

Keep the equipment identity in data and derive both image paths from it. Do not bake the rarity frame into every equipment file.

```astro
---
interface Props {
  src: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  name: string;
  relic?: boolean;
  size?: number;
}

const {
  src,
  rarity,
  name,
  relic = false,
  size = 48,
} = Astro.props;

const frameSrc = `/images/equipment/frames/frame-${rarity.toLowerCase()}.webp`;
---

<span
  class="equipment-badge"
  style={`--equipment-size: ${size}px`}
  role="img"
  aria-label={`${rarity} ${name}`}
>
  <img class="equipment-badge__item" src={src} alt="" loading="lazy" decoding="async" />
  <img class="equipment-badge__frame" src={frameSrc} alt="" aria-hidden="true" />

  {relic && (
    <img
      class="equipment-badge__relic"
      src="/images/equipment/frames/frame-relic.webp"
      alt=""
      aria-hidden="true"
    />
  )}
</span>

<style>
  .equipment-badge {
    position: relative;
    display: inline-block;
    width: var(--equipment-size);
    height: var(--equipment-size);
    flex: 0 0 auto;
  }

  .equipment-badge > img {
    position: absolute;
    display: block;
    object-fit: fill;
    pointer-events: none;
    user-select: none;
  }

  .equipment-badge__item {
    z-index: 1;
    width: 70%;
    height: 70%;
    left: 15%;
    top: 15%;
  }

  .equipment-badge__frame,
  .equipment-badge__relic {
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .equipment-badge__frame { z-index: 2; }
  .equipment-badge__relic { z-index: 3; }
</style>
```

Example use for Tiggy:

```astro
<EquipmentBadge
  src="/images/equipment/Tiggy-1-Legendary-Grand-Combat-Knife.webp"
  rarity="Legendary"
  name="Grand Combat Knife"
/>
```

If comparison against the Planner reveals that a particular browser renders the item a pixel too high or low, adjust the item layer only, such as `top: 14%`. Keep the frame fixed at the full outer size.

## Data-model recommendation

The filename is convenient for static delivery, but the page should not treat it as the sole database. Store explicit fields and generate the filename or full path during the build:

```ts
type EquipmentOption = {
  character: string;       // "Tiggy"
  slotNumber: 1 | 2 | 3;
  slotLabel: 'Crit' | 'Defensive' | 'Block' | 'Crit Booster' | 'Block Booster';
  rarity: 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  equipmentName: string;   // "Grand Combat Knife"
  imagePath: string;       // complete public URL
  relic: boolean;
};
```

This avoids fragile reverse-parsing and preserves labels such as `MK-X` exactly. It also lets the guide filter by character, slot label, rarity, or equipment name without consulting the user's Planner inventory.

## Relics and current asset gaps

The Planner treats a relic as a third layer rather than a different rarity-frame replacement. The inspected source set used a normal Mythic frame plus a separate relic overlay.

The revised website folder currently has `frame-mythic.webp`, but it does **not** have `frame-relic.webp`. It also does not contain a character-specific Mythic Helspear image for Haarken. To show the known Haarken relic with the full Planner treatment, add equivalents of:

```text
/images/equipment/Haarken-1-Mythic-Helspear.webp
/images/equipment/frames/frame-relic.webp
```

Until those exist, the component should either omit relic entries or provide a deliberate fallback. It should not silently display a Legendary frame for a Mythic relic.

## Practical implementation rules

- Use a fixed square outer container so every badge aligns consistently in grids and tables.
- Center the equipment art at 70% of the outer size and place the frame above it at 100%.
- Use `object-fit: fill` if the goal is close Planner parity; the source layers have variable natural dimensions.
- Select the frame from structured rarity data, not by attempting to infer color from the equipment art.
- Treat slot number as character-specific position metadata, not as a universal slot label.
- Keep decorative layers out of accessibility output. Give the composite wrapper one useful label.
- Use `loading="lazy"` and `decoding="async"` when displaying many equipment options.
- Preserve the WebP images as transparent assets. Adding an opaque CSS background behind the inner item can change the intended hex-edge appearance.
- For crisp results, keep source files at their current resolution and resize them with CSS rather than creating separate tiny files.

## Scope and provenance

The compatibility list should come from the complete Planner equipment definitions and character metadata. The Planner's visible equipment page can be narrowed by a user's current inventory, so page visibility alone is not proof that an item is the only possible option. The 24-character export used to prepare these assets deliberately separates complete compatibility from the `visible_in_current_inventory_scoped_page` flag.

The deployed asset bundle filenames on `tacticusplanner.app` are build-hashed and can change after a deployment. Terminus Maximus should serve its own stable paths shown above rather than hotlinking the Planner's hashed URLs.
