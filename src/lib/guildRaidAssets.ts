import { existsSync } from "node:fs";
import { resolve } from "node:path";

export function guildRaidImageExists(imagePath?: string) {
  return Boolean(imagePath && existsSync(resolve(process.cwd(), "public", imagePath.replace(/^\//, ""))));
}
