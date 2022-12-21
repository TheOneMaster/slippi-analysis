import { PostFrameUpdateType } from "@slippi/slippi-js";

import { STAGE_GEOMETRY_MAP } from "../base/constants";



export function isRecovering(frame: PostFrameUpdateType, stageId: number) {
    // Airborne, off-stage, and moving closer towards center (0, 0)
    const grounded = !frame.isAirborne;
    const onStage = isOnstage(frame, stageId);

    if (grounded || onStage) {
        return false;
    }

    // Get current position
    const posX = frame.positionX;
    const posY = frame.positionY;

    if (posX === null || posY === null) {
        throw new Error("Unable to obtain position");
    }

    const momentum = frame.selfInducedSpeeds;

    // Get momentum
    const momentumX = momentum?.airX;
    const momentumY = momentum?.y;

    if (!momentum || momentumX == null || momentumY == null) {
        return !onStage
    }

    // Make sure that the player is recovering towards the stage
    const movedX = posX + momentumX;
    const movedY = posY + momentumY;

    const closerX = Math.abs(movedX) <= Math.abs(posX);
    const closerY = Math.abs(movedY) <= Math.abs(posY);

    return closerX || closerY;
}

/**
 * Checks whether the player is within the bounding box of the main stage. This means that they are within the x coords of the stage and has a y coord
 * between the stage and the middle of the highest platform and the upper blastzone.
 *  
 * @param frame The player data on a specific frame
 * @param stageId The stage id the game is being played on
 * @returns a check on whether the player is on-stage
 */
export function isOnstage(frame: PostFrameUpdateType, stageId: number): boolean {

    const stageGeometry = STAGE_GEOMETRY_MAP[stageId];

    const char_pos_x = frame.positionX;
    const char_pos_y = frame.positionY;

    if (char_pos_x === null || char_pos_y === null) {
        throw new Error("Unable to get player position in frame")
    }

    const within_x = (
        char_pos_x >= stageGeometry.leftLedgeX &&
        char_pos_x <= stageGeometry.rightLedgeX
    );

    let max_y: number

    // Find the max y value for all kinds of stages (with top platform, only side plats, and no plats)
    if (stageGeometry.topPlatformHeight !== undefined) {
        const halfway_y = (stageGeometry.upperYBoundary - stageGeometry.topPlatformHeight) / 2;
        max_y = stageGeometry.topPlatformHeight + halfway_y;
    } else if (stageGeometry.sidePlatformHeight !== undefined) {
        const halfway_y = (stageGeometry.upperYBoundary - stageGeometry.sidePlatformHeight) / 2;
        max_y = stageGeometry.sidePlatformHeight + halfway_y;;
    } else {
        const halfway_y = (stageGeometry.upperYBoundary - stageGeometry.mainPlatformHeight) / 2;
        max_y = stageGeometry.mainPlatformHeight + halfway_y;
    }

    const within_y = (max_y >= char_pos_y && char_pos_y >= stageGeometry.mainPlatformHeight - 5);

    return within_x && within_y
}
