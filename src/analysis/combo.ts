import { SlippiGame } from "@slippi/slippi-js";

import { getGrabFrames } from "./base";
import { Combo, ReplayCombos } from "./combo.interface";
import { isInGroundedControl, isDead } from "./state";

const slp = new SlippiGame("slp/Game_20221130T003859.slp");

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
        for (let frame_index=slp_frame; frame_index <= slp_frame_index.length; frame_index++) {

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
                    endFrame: frame_index-1,
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

const grab_combos = getGrabCombos(slp);

console.log(grab_combos);
