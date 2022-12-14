import { Character, SlippiGame, Stage } from "@slippi/slippi-js";

import { SlippiReadError } from "./error";
import { Filter } from "./filter.interface";
import { getCharacters } from "./analysis/char";
    

/**
 * Check whether the given characters were used in the replay file. Used in the filter function.
 * @param slp - The Slippi replay file to be checked
 * @param chars - The list of characters searched for
 * @returns Boolean of whether the replay contains the given characters
 */
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

/**
 * Check for which stage the game was played on. To be used in the final filter function.
 * @param slp - The Slippi replay file to be checked
 * @param stage - The stage ID to be checked
 * @returns Boolean of whether the game was played on the correct stage
 */
function checkStage(slp: SlippiGame, stage: Stage): boolean {

    const settings = slp.getSettings();
    const stageId = settings?.stageId;

    // null == undefined
    // 
    if (stageId == null) throw new SlippiReadError();

    return stageId === stage;
}

/**
 * Check whether the replay file contains a certain number of players. Used as a part of the filter function. 
 * @param slp - Slippi replay file
 * @param num_players - The number of players in the game (Ex: 2 for 1v1)
 * @returns Boolean for whether the replay contains the same number of players
 */
function checkNumPlayers(slp: SlippiGame, num_players: number) {
    const settings = slp.getSettings();
    const players = settings?.players;

    if (players == null) throw new SlippiReadError();

    return players.length === num_players;
}

/**
 * Check whether provided replay file matches the filters
 * 
 * @param slp - Slippi replay file
 * @param filters - The object containing the filters used to check against the provided replay
 * @returns Boolean of whether the replay matches the filters
 */
export function checkFilters(slp: SlippiGame, filters: Filter): boolean {

    let final_bool = true;

    if (filters.chars !== undefined) final_bool = final_bool && checkCharacters(slp, filters.chars);
    if (filters.stage !== undefined) final_bool = final_bool && checkStage(slp, filters.stage);
    if (filters.numPlayers !== undefined) final_bool = final_bool && checkNumPlayers(slp, filters.numPlayers);

    return final_bool
}

/**
 * Convenience function to find similar games to the provided filter_game. Filters on the basis of characters, stage, and number of players.
 * 
 * @param slp_list - The list of slp files to filter from
 * @param filter_game - The game the filter is based on
 * 
 * @returns Filtered list of slp files
 * 
 */
export function filterGames(slp_list: SlippiGame[], filter_game: SlippiGame): SlippiGame[] {

    const chars = getCharacters(filter_game)
    const settings = filter_game.getSettings();
    const stage = settings?.stageId;
    const numPlayers = settings?.players.length;


    if (stage == null || numPlayers === undefined) {
        throw new SlippiReadError();
    }

    const filter: Filter = {
        chars: chars,
        stage: stage,
        numPlayers: numPlayers
    };

    const filtered_games = slp_list.filter(slp => checkFilters(slp, filter));

    return filtered_games
}
