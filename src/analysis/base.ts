import { SlippiGame } from "@slippi/slippi-js";
import { SlippiReadError } from "../error";

import { Grab, GrabFrames } from "./base.interface";
import { isGrabbed } from "./state";

export function getGrabFrames(slp: SlippiGame) : GrabFrames{

    const frames = slp.getFrames();
    if (!frames) throw new SlippiReadError();

    const grab_frames = {} as GrabFrames;

    for (const frame in frames) {
        const frame_data = frames[frame];
        const players = frame_data.players;

        for (const playerID in players) {
            const pre_frame = players[playerID]?.pre;
            const post_frame = players[playerID]?.post;

            // Check if they are doing standing grab or dash grab
            const check_grabbing = pre_frame?.actionStateId === 212 || pre_frame?.actionStateId === 214

            // If they were grabbing & are now in the grab pull (towards you) animation
            if (pre_frame?.actionStateId === 212 && post_frame?.actionStateId === 213) {

                // Player who is not the grabber (only works for 1v1)
                const grabbed = Object.keys(players).reduce((grabbed, player) => {
                    const player_data = players[parseInt(player)]?.post;

                    if (player_data === undefined) return grabbed

                    if (isGrabbed(player_data)) {
                        return parseInt(player)
                    }
                    return grabbed
                }, 0)

                const grab: Grab = {
                    frameStart: parseInt(frame),
                    by: parseInt(playerID),
                    grabbed: grabbed
                };

                grab_frames[frame] = grab;
            }
        }
    }

    return grab_frames
}
