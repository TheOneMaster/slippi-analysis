import { Character, SlippiGame, Stage } from "@slippi/slippi-js";
import { SlippiReadError } from "./error";

import { Filter } from "./filter.interfaces";
import { getCharacters } from "./helper";
    


function checkCharacters(slp: SlippiGame, chars: Character[]): boolean {

    const slp_chars = getCharacters(slp);

    while (chars.length !== 0) {
        const char = chars[0];
        if (!slp_chars.includes(char)) {
            return false
        } else {
            const slp_index = slp_chars.indexOf(char);
            const char_index = chars.indexOf(char);
            slp_chars.splice(slp_index, 1);
            chars.splice(char_index, 1);
        }
    }


    return true;
}

function checkStage(slp: SlippiGame, stage: Stage): boolean {

    const settings = slp.getSettings();
    const stageId = settings?.stageId;

    // null == undefined
    // 
    if (stageId == null) throw new SlippiReadError();

    return stageId === stage;
}

function checkNumPlayers(slp: SlippiGame, num_players: number) {
    const settings = slp.getSettings();
    const players = settings?.players;

    if (players == null) throw new SlippiReadError();

    return players.length === num_players;
}


export function checkFilters(slp: SlippiGame, filters: Filter) {

    let final_bool = true;

    if (filters.chars !== undefined) final_bool = final_bool && checkCharacters(slp, filters.chars);
    if (filters.stage !== undefined) final_bool = final_bool && checkStage(slp, filters.stage);
    if (filters.numPlayers !== undefined) final_bool = final_bool && checkNumPlayers(slp, filters.numPlayers);

    return final_bool
}
