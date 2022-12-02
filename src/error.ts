export class SlippiReadError extends Error {
    constructor() {
        super("Slippi file is incomplete.");
    }
}
