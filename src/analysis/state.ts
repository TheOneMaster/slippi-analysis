import { PostFrameUpdateType, SlippiGame } from "@slippi/slippi-js";

/*

 * Most of this file is taken from slippilab.
 * Source: https://github.com/frankborden/slippilab/blob/main/src/search/framePredicates.ts

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
