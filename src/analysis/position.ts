import { PostFrameUpdateType } from "@slippi/slippi-js";

import { STAGE_GEOMETRY_MAP } from "../base/constants";



export function isRecovering(frame: PostFrameUpdateType, stageId: number) {
    // Airborne, off-stage, and moving closer towards center (0, 0)
    const grounded = !frame.isAirborne;
    const onStage = isOnstage(frame, stageId);

    if (grounded || onStage) {
        return false;
    }

    const momentum = frame.selfInducedSpeeds;

    if (!momentum) {
        throw new Error("Unable to obtain momentum from player on frame.");
    }


    // Get current position
    const posX = frame.positionX;
    const posY = frame.positionY;

    if (posX === null || posY === null) {
        throw new Error("Unable to obtain position");
    }


    // Get momentum
    const momentumX = momentum.airX;
    const momentumY = momentum.y;

    if (momentumX === null || momentumY === null) {
        throw new Error("Unable to obtain momentum");
    }

    // Make sure that the player is recovering towards the stage
    const movedX = posX + momentumX;
    const movedY = posY + momentumY;

    const closerX = Math.abs(movedX) <= Math.abs(posX);
    const closerY = Math.abs(movedY) <= Math.abs(posY);

    return closerX || closerY;
}

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

    let within_y: boolean;

    if (stageGeometry.topPlatformHeight !== undefined) {
        const halfway_y = (stageGeometry.upperYBoundary - stageGeometry.topPlatformHeight) / 2;
        const max_y = stageGeometry.topPlatformHeight + halfway_y;
        within_y = (max_y >= char_pos_y && char_pos_y >= stageGeometry.mainPlatformHeight - 5);
    } else {
        const halfway_y = (stageGeometry.upperYBoundary - stageGeometry.mainPlatformHeight) / 2;
        const max_y = stageGeometry.mainPlatformHeight + halfway_y;
        within_y = (max_y >= char_pos_y && char_pos_y >= stageGeometry.mainPlatformHeight - 5);
    }

    return within_x && within_y
}
