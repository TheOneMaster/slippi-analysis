import { SlippiGame } from "@slippi/slippi-js";

import { SlippiReadError } from "../error";

import { getGrabFrames } from "./base";
import { Combo, GameRecoveries, RecoveryObject, ReplayCombos } from "./combo.interface";
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

    const slp_players = slp.getSettings()?.players;
    const slp_stageId = slp.getSettings()?.stageId;

    if (slp_players === undefined || slp_stageId == null) {
        throw new SlippiReadError();
    }


    const slp_frames = slp.getFrames();

    const GameRecoveries: GameRecoveries = {};
    const player_recovery_storage: { [playerIndex: number]: RecoveryObject } = {};


    for (const frame_index in slp_frames) {

        const frame_data = slp_frames[frame_index];
        const players = frame_data.players;


        for (const playerId in players) {

            const playerData = players[playerId]?.post;

            if (playerData === undefined) {
                continue
            }

            const recovering = isRecovering(playerData, slp_stageId);
            const dead = isDead(playerData);
            const playerId_int = parseInt(playerId);

            if (!recovering || dead) {

                if (!player_recovery_storage[playerId_int]) {
                    continue
                }

                const recovery = player_recovery_storage[playerId_int];
                delete player_recovery_storage[playerId_int];

                if (dead) recovery.successful = false

                if (!GameRecoveries[playerId_int]) {
                    GameRecoveries[playerId_int] = [recovery]
                } else {
                    GameRecoveries[playerId_int].push(recovery);
                }
                continue
            }


            const frame_int = parseInt(frame_index);

            if (!player_recovery_storage[playerId_int]) {
                const recovery: RecoveryObject = {
                    startFrame: frame_int,
                    endFrame: frame_int,

                    startPercent: playerData.percent ?? -1,
                    endPercent: playerData.percent ?? -1,

                    successful: true
                }

                player_recovery_storage[playerId_int] = recovery;
            } else {
                const recovery = player_recovery_storage[playerId_int];

                recovery.endFrame = frame_int;
                recovery.endPercent = playerData.percent ?? recovery.endPercent;
            }


        }
    }

    return GameRecoveries
}

