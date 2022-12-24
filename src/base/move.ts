import { calcDamageTaken, FramesType, Frames, PostFrameUpdateType } from "@slippi/slippi-js";
import { getPostFrame } from "./frames";
import { Move } from "./types";

export function getLastMoveHitBy(frames: FramesType, frameNum: number, playerId: number, hitBy: number) {

    const playerData = getPostFrame(frames, frameNum, playerId);
    const playerPreviousFrame = getPostFrame(frames, frameNum-1, playerId);

    const opponentData = getPostFrame(frames, frameNum, hitBy);
    const lastHitMoveId = getLastHitMoveId(opponentData);

    let moveDamage = calcDamageTaken(playerData, playerPreviousFrame);
    let moveFrame = frameNum;

    if (moveDamage === 0) {

        const currentPercent = playerData.percent ?? -1;

        // Iterate backwards over each frame till the start of the game
        for (let frameIndex=frameNum; frameIndex >= Frames.FIRST_PLAYABLE; frameIndex--) {

            const checkPlayerData = getPostFrame(frames, frameIndex, playerId);
            const damageTaken = calcDamageTaken(playerData, checkPlayerData);

            if (damageTaken !== 0) {
                moveDamage = damageTaken;
                moveFrame = frameIndex;
                break;
            }
        }
    }

    const move: Move = {
        ID: lastHitMoveId,
        playerID: playerId,
        damage: moveDamage,
        frameHit: moveFrame
    }

    return move

}

function getLastHitMoveId(frameData: PostFrameUpdateType) {
    const lastHitMoveId = frameData.lastAttackLanded;

    if (lastHitMoveId === null) {
        throw new Error("No move has been previously hit");
    }

    return lastHitMoveId
}
