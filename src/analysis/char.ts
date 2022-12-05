import { SlippiGame } from "@slippi/slippi-js";
import { SlippiReadError } from "../error";

const CHARACTER_MAP: Record<number, string> = {
    0: "Captain Falcon",
    1: "Donkey Kong",
    2: "Fox",
    3: "Mr. Game & Watch",
    4: "Kirby",
    5: "Bowser",
    6: "Link",
    7: "Luigi",
    8: "Mario",
    9: "Marth",
    10: "Mewtwo",
    11: "Ness",
    12: "Peach",
    13: "Pikachu",
    14: "Ice Climbers",
    15: "Jigglypuff",
    16: "Samus",
    17: "Yoshi",
    18: "Zelda",
    19: "Sheik",
    20: "Falco",
    21: "Young Link",
    22: "Dr. Mario",
    23: "Roy",
    24: "Pichu",
    25: "Ganondorf"
}





export function findPlayerByChar(slp: SlippiGame, char: number): number {

    const players = slp.getSettings()?.players;
    if (players === undefined) {
        throw new SlippiReadError();
    }

    for (let i=0; i < players.length; i++) {     
        const player_char = players[i].characterId;
        
        if (player_char === char) {
            return i;
        }
    }

    // If no player played that character
    throw new Error(`No player played ${CHARACTER_MAP[char]}`)
}
