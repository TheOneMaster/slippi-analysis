import { FrameEntryType, PostFrameUpdateType } from "@slippi/slippi-js";

/*

 * Most of this file is taken from slippilab.
 * Source: https://github.com/frankborden/slippilab/blob/main/src/search/framePredicates.ts
 * 
 * State information also sourced from https://github.com/project-slippi/slippi-wiki/blob/master/SPEC.md
 * Specific ActionStateID values here: https://docs.google.com/spreadsheets/d/1JX2w-r2fuvWuNgGb6D3Cs4wHQKLFegZe2jhbBuIhCG8/preview#gid=13

 */
export function isInGroundedControl(frame: PostFrameUpdateType): boolean {

    const actionStateId = frame.actionStateId;

    if (actionStateId === null) {
        throw new Error("Cannot find frame or player in replay");
    }

    const ground = actionStateId >= 0x0e && actionStateId <= 0x18;
    const squat = actionStateId >= 0x27 && actionStateId <= 0x29;
    const groundAttack = actionStateId >= 0x2c && actionStateId <= 0x40;
    const grab = actionStateId === 0xd4;

    return ground || squat || groundAttack || grab
}

export function isDead(frame: PostFrameUpdateType): boolean {
    
    const actionStateId = frame.actionStateId;

    if (actionStateId === null) {
        throw new Error("Cannot find player state");
    }

    return actionStateId >= 0x00 && actionStateId <= 0x0a;
}

export function isGrabbed(frame: PostFrameUpdateType): boolean {
    
    const actionStateId = frame.actionStateId;

    if (actionStateId === null) {
        throw new Error("Cannot find player state");
    }

    return actionStateId >= 0xdf && actionStateId <= 0xe8
}

export function didGrabSucceed(frame: FrameEntryType, player: number): boolean {

    const post = frame.players[player]?.post;
    const pre = frame.players[player]?.pre;

    if (post === undefined || pre === undefined) {
        throw new Error("Frame data for player is unavailable");
    }

    const prev_frame_grab_attempt = pre.actionStateId === 0xd4 || pre.actionStateId === 0xd6;
    const current_frame_grab_success = post.actionStateId === 0xd5 || post.actionStateId === 0xd7;

    const grab_success = prev_frame_grab_attempt && current_frame_grab_success;

    return grab_success;
}
