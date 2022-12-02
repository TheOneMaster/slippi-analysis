import { readdir } from "fs/promises";
import { SlippiGame } from "@slippi/slippi-js";
import path from "path";

import { SlippiReadError } from "./error";

export async function readDirectory(dir: string): Promise<SlippiGame[]> {

    const files = await readdir(dir);
    const slp_files = files.map(file => new SlippiGame(path.join(dir, file)));

    return slp_files;
}

export function getCharacters(slp: SlippiGame): number[]  {

    const settings = slp.getSettings();    
    const players = settings?.players;

    if (!players) throw new SlippiReadError();

    const chars = players?.map(player => player.characterId ?? -1);

    return chars
}
