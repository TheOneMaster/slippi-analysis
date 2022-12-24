import { FramesType, PostFrameUpdateType, PreFrameUpdateType } from "@slippi/slippi-js";
import { FrameReadError } from "../error";

export function getPostFrame(frames: FramesType, frameNum: number, playerId: number): PostFrameUpdateType {
    const frameData = frames[frameNum];
    const postFrame = frameData.players[playerId]?.post;

    if (postFrame === undefined) {
        throw new FrameReadError(frameData);
    }

    return postFrame;
}

export function getPreFrame(frames: FramesType, frameNum: number, playerId: number): PreFrameUpdateType {
    const frameData = frames[frameNum];
    const preFrame = frameData.players[playerId]?.pre;

    if (preFrame === undefined) {
        throw new FrameReadError(frameData);
    }

    return preFrame;
}
