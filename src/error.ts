import { PostFrameUpdateType, SlippiGame } from "@slippi/slippi-js";
import path from "path";

export class SlippiReadError extends Error {
    constructor(slp: SlippiGame) {
        const pathName = slp.getFilePath() ?? "<unable to obtain filename>";
        const baseName = path.basename(pathName);
        super(`Replay ${baseName} is incomplete.`);
    }
}

export class FrameStateError extends Error {
    constructor(frame: PostFrameUpdateType) {
        super(`Cannot find player state at frame ${frame.frame}`);
    }
}
