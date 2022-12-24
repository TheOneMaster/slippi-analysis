import { FramesType, PostFrameUpdateType } from "@slippi/slippi-js";

import { FrameStateError } from "../error";
import { getPostFrame } from "./frames";

/*

 * Most of this file is taken from slippilab.
 * Source: https://github.com/frankborden/slippilab/blob/main/src/search/framePredicates.ts
 * 
 * State information also sourced from https://github.com/project-slippi/slippi-wiki/blob/master/SPEC.md
 * Specific ActionStateID values here: https://docs.google.com/spreadsheets/d/1JX2w-r2fuvWuNgGb6D3Cs4wHQKLFegZe2jhbBuIhCG8/preview#gid=13

 */

export function getActionStateId(frame: PostFrameUpdateType): number {
    const actionStateId = frame.actionStateId;

    if (actionStateId === null) {
        throw new FrameStateError(frame);
    }

    return actionStateId;
}

export function isInGroundedControl(frame: PostFrameUpdateType): boolean {

    const actionStateId = getActionStateId(frame)

    const ground = actionStateId >= 0x0e && actionStateId <= 0x18;
    const squat = actionStateId >= 0x27 && actionStateId <= 0x29;
    const groundAttack = actionStateId >= 0x2c && actionStateId <= 0x40;
    const grab = actionStateId === 0xd4;

    return ground || squat || groundAttack || grab
}

export function isDead(frame: PostFrameUpdateType): boolean {
    
    const actionStateId = getActionStateId(frame)

    return actionStateId >= 0x00 && actionStateId <= 0x0a;
}

export function isGrabbed(frame: PostFrameUpdateType): boolean {
    
    const actionStateId = getActionStateId(frame)

    return actionStateId >= 0xdf && actionStateId <= 0xe8
}

export function isInHitstun(frame: PostFrameUpdateType): boolean {
    
    const actionStateId = getActionStateId(frame)

    return (actionStateId >= 0x4b && actionStateId <= 0x5b) || actionStateId === 0x26
}

export function isInHitlag(frame: PostFrameUpdateType): boolean {

    // Find some way to get this data (https://github.com/project-slippi/slippi-wiki/blob/master/SPEC.md#state-bit-flags-2)
    // That's the only way to get hitlag for older replays apparently

    return false
}

export function isThrown(frame: PostFrameUpdateType): boolean {
    const actionStateId = getActionStateId(frame);

    return actionStateId >= 0xef && actionStateId <= 0xf3;
}

export function didGrabSucceed(frames: FramesType, frameNum: number, player: number): boolean {

    const currentFrame = getPostFrame(frames, frameNum, player);
    const previousFrame = getPostFrame(frames, frameNum-1, player);

    const prev_frame_grab_attempt = previousFrame.actionStateId === 0xd4 || previousFrame.actionStateId === 0xd6;
    const current_frame_grab_success = currentFrame.actionStateId === 0xd5 || currentFrame.actionStateId === 0xd7;

    const grab_success = prev_frame_grab_attempt && current_frame_grab_success;

    return grab_success;
}
