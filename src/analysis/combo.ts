import { SlippiGame } from "@slippi/slippi-js";

import { SlippiReadError } from "../error";

import { getGrabFrames } from "./base";
import { Combo, GameRecoveries, ReplayCombos } from "./combo.interface";
import { Recovery } from "./recovery";
import { isInGroundedControl, isDead, isRecovering } from "./state";

export function getGrabCombos(slp: SlippiGame): ReplayCombos {

    const grab_init_frames = getGrabFrames(slp);

    const slp_frames = slp.getFrames();
    const slp_frame_index = Object.keys(slp_frames);

    const combos: ReplayCombos = {};

    // Find combo starting from every successfull grab
    for (const grab_frame in grab_init_frames) {

        const slp_frame = slp_frame_index.indexOf(grab_frame);
        const grabbed_player = grab_init_frames[grab_frame].grabbed;
        const init_percent = slp_frames[slp_frame].players[grabbed_player]?.post.percent;

        // Store frame indexes that are part of the combo
        let frames: number[] = []

        // Iterate over every frame from the start of the combo and break when the combo ends
        for (let frame_index = slp_frame; frame_index <= slp_frame_index.length; frame_index++) {

            const frame_data = slp_frames[frame_index];
            const player_data = frame_data.players[grabbed_player]?.post;

            if (player_data === undefined) {
                continue;
            }

            const grounded = isInGroundedControl(player_data);
            const dead = isDead(player_data);

            if (grounded || dead) {
                const final_percent = player_data.percent;

                const combo: Combo = {
                    frames: frames,
                    player: grab_init_frames[grab_frame].by,
                    startFrame: slp_frame,
                    endFrame: frame_index - 1,
                    startPercent: init_percent ?? 0,
                    endPercent: final_percent ?? 0,
                    toDeath: false,
                    fromGrab: true
                }

                if (dead) {
                    combo.toDeath = true;
                }

                combos[grab_frame] = combo;

                break
            } else {
                frames.push(frame_index);
            }
        }
    }

    return combos
}

export function getRecoveries(slp: SlippiGame) {

    const slp_settings = slp.getSettings();
    const slp_players = slp_settings?.players;
    const slp_stageId = slp_settings?.stageId;

    if (slp_players === undefined || slp_stageId == undefined) {
        throw new SlippiReadError(slp);
    }

    const slp_frames = slp.getFrames();

    const gameRecoveries: GameRecoveries = {};

    for (const frameIndex in slp_frames) {

        const frameData = slp_frames[frameIndex];
        const frame_players = frameData.players;

        for (const playerId in frame_players) {
            const frame_playerData = frame_players[playerId]?.post;

            if (frame_playerData === undefined) {
                continue
            }

            const recovery_check = isRecovering(frame_playerData, slp_stageId);
            const dead_check = isDead(frame_playerData);
            const playerIndex = parseInt(playerId);

            if (!recovery_check || dead_check) {

                const active_recovery = Recovery.getActiveRecovery(playerIndex);

                if (active_recovery === undefined) {
                    continue
                }

                Recovery.endRecovery(playerIndex);

                if (dead_check) active_recovery.successful = false;

                if (gameRecoveries[playerIndex]) {
                    gameRecoveries[playerIndex].push(active_recovery.toObject())
                    continue
                }

                gameRecoveries[playerIndex] = [active_recovery.toObject()];
                continue
            } 

            const frameIndex_int = parseInt(frameIndex);
            let active_recovery = Recovery.getActiveRecovery(frameIndex_int);

            if (active_recovery === undefined) {
                const startPercent = frame_playerData.percent ?? -1;
                active_recovery = new Recovery(frameIndex_int, startPercent, playerIndex);
            }

            active_recovery.endPercent = frame_playerData.percent ?? active_recovery.endPercent;
            active_recovery.endFrame = frameIndex_int;
        }

    }

    return gameRecoveries
}
