export class SlippiReadError extends Error {
    constructor() {
        super("Slippi file is incomplete.");
    }
}

export class FrameStateError extends Error {
    constructor() {
        super("Cannot find player state");
    }
}
