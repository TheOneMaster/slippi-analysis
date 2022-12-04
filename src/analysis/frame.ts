import { FrameEntryType, SlippiGame } from "@slippi/slippi-js"

import { roundToDecimal } from "../helper";
import { FrameData, FramePlayerData } from "./pos.interface";

export class Frame {


    public index: number
    public players: FramePlayerData[]
    public chars: number[]
    

    constructor(frame: FrameEntryType) {

        this.index = frame.frame;     
        this.players = []
        this.chars = [];

        const players = frame.players;

        for (const playerId in players) {
            const player_data = players[playerId]?.post;
            const player_index = parseInt(playerId);

            if (player_data === undefined) {
                throw new Error("Frame data is not available");
            }

            let x = player_data.positionX ?? 0;
            let y = player_data.positionY ?? 0;

            x = roundToDecimal(x, 3);
            y = roundToDecimal(y, 3);

            const player: FramePlayerData = {
                x: x,
                y: y,
                isAirborne: player_data.isAirborne ?? false,
                char: player_data.internalCharacterId ?? -1,
                playerIndex: player_index
            }

            this.players.push(player);
            this.chars.push(player.char);
        }
    }

    getPlayerIndexByCharacter(char: number, filter_index: number[]): number {

        const index_store: number[] = []

        for (const [index, player] of this.players.entries()) {

            if (filter_index.length !== 0 && filter_index.includes(index)) {
                continue
            }

            if (player.char === char) {
                return index
            } else {
                index_store.push(index)
            }
        }

        return index_store[0];
    }


    isSimilar(frame: Frame, pos_tolerance=5): boolean {

        // If there are a different number of players, it is false
        if (this.players.length !== frame.players.length) {
            return false
        }

        const filter_index: number[] = [];
        let final_bool = true;

        for (const player of this.players) {

            const cur_char = player.char;

            let similar_player_index = frame.getPlayerIndexByCharacter(cur_char, filter_index);
            const similar_player = frame.players[similar_player_index];

            filter_index.push(similar_player_index);

            if (player.isAirborne !== similar_player.isAirborne) {
                return false
            }

            const x_check = Math.abs(player.x - similar_player.x) <= pos_tolerance;
            const y_check = Math.abs(player.y - similar_player.y) <= pos_tolerance;

            final_bool = final_bool && x_check && y_check
        }

        return final_bool
    }
}



export function findSimilarFrames(comparing_game: SlippiGame, original_frame: Frame): string[]
export function findSimilarFrames(comparing_game: SlippiGame, origGame_or_frame: SlippiGame, frame: number): string[]
export function findSimilarFrames(comparing_game: SlippiGame, origGame_or_frame: SlippiGame|Frame, frame?: number): string[] {

    let original_frame: Frame;

    if (origGame_or_frame instanceof SlippiGame) {
        if (frame === undefined) {
            throw new Error("Provide a frame to use as a base");
        }

        original_frame = new Frame(origGame_or_frame.getFrames()[frame]);
    } else {
        original_frame = origGame_or_frame;
    }

    const comparing_game_frames = comparing_game.getFrames();
    let similar_frames: string[] = [];


    for (const frame_index in comparing_game_frames) {
        const comparison_frame = new Frame(comparing_game_frames[frame_index]);

        if (original_frame.isSimilar(comparison_frame)) {
            similar_frames.push(frame_index);
        }
    }

    return similar_frames
}
