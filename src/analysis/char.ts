import { SlippiGame } from "@slippi/slippi-js";
import { getCharacterName } from "../base/helper";
import { SlippiReadError } from "../error";

export function findPlayerByChar(slp: SlippiGame, char: number): number {

    const players = slp.getSettings()?.players;
    if (players === undefined) {
        throw new SlippiReadError(slp);
    }

    for (let i=0; i < players.length; i++) {     
        const player_char = players[i].characterId;
        
        if (player_char === char) {
            return i;
        }
    }

    // If no player played that character
    throw new Error(`No player played ${getCharacterName(char)}`)
}


export function getCharacters(slp: SlippiGame): number[]  {

    const settings = slp.getSettings();    
    const players = settings?.players;

    if (!players) throw new SlippiReadError(slp);

    const chars = players?.map(player => player.characterId ?? -1);

    return chars
}
