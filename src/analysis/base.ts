import { Frames, SlippiGame } from "@slippi/slippi-js";

import { Grab, GrabFrames } from "./base.interface";
import { didGrabSucceed, isGrabbed } from "../base/state"

export function getGrabFrames(slp: SlippiGame) : GrabFrames{

    const frames = slp.getFrames();
    const grab_frames = {} as GrabFrames;

    for (const frame in frames) {

        const frame_int = parseInt(frame);
        
        // Only start analyzing from playable frames
        if (frame_int < Frames.FIRST_PLAYABLE) {
            continue
        }

        const frame_data = frames[frame];
        const players = frame_data.players;

        for (const playerID in players) {
            const playerID_int = parseInt(playerID);
            const grab_success = didGrabSucceed(frames, parseInt(frame), playerID_int);

            // If they were grabbing & are now in the grab pull (towards you) animation
            if (grab_success) {

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
