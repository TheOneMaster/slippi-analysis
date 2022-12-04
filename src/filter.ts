import { Character, SlippiGame, Stage } from "@slippi/slippi-js";

import { SlippiReadError } from "./error";
import { Filter, FilterOptions } from "./filter.interface";
import { getCharacters } from "./helper";
    


function checkCharacters(slp: SlippiGame, chars: Character[]): boolean {

    const slp_chars = getCharacters(slp);
    const filter_chars = chars.slice();

    while (filter_chars.length !== 0) {
        const char = filter_chars[0];
        if (!slp_chars.includes(char)) {
            return false
        } else {
            const slp_index = slp_chars.indexOf(char);
            const char_index = filter_chars.indexOf(char);
            slp_chars.splice(slp_index, 1);
            filter_chars.splice(char_index, 1);
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


export function checkFilters(slp: SlippiGame, filters: Filter): boolean {

    let final_bool = true;

    if (filters.chars !== undefined) final_bool = final_bool && checkCharacters(slp, filters.chars);
    if (filters.stage !== undefined) final_bool = final_bool && checkStage(slp, filters.stage);
    if (filters.numPlayers !== undefined) final_bool = final_bool && checkNumPlayers(slp, filters.numPlayers);

    return final_bool
}

export function filterGames(slp_list: SlippiGame[], filter_game: SlippiGame, filter_options?: FilterOptions): SlippiGame[] {

    const chars = getCharacters(filter_game)
    const settings = filter_game.getSettings();
    const stage = settings?.stageId;
    const numPlayers = settings?.players.length;


    if (stage == null || numPlayers === undefined) {
        throw new SlippiReadError();
    }

    const filter: Filter = {};

    if (filter_options) {
        if (filter_options.chars) filter.chars = chars;
        if (filter_options.stage) filter.stage = stage;
        if (filter_options.numPlayers) filter.numPlayers = numPlayers;
    } else {
        filter.chars = chars;
        filter.stage = stage;
        filter.numPlayers = numPlayers;
    }

    const filtered_games = slp_list.filter(slp => checkFilters(slp, filter));

    return filtered_games
}
