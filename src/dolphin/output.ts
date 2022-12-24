import { Writable } from "stream";
import os from "os"
import { Frames } from "@slippi/slippi-js";

import { GameState, PlaybackKey } from "./output.interface";

const initialGameState: GameState = {
    gameEnded: false,
    forceQuit: false,
    currentFrame: Frames.FIRST,
    lastGameFrame: Frames.FIRST,
    playbackStart: Frames.FIRST,
    playbackEnd: Frames.FIRST
}


export class DolphinOutput extends Writable {

    public gameState: GameState

    constructor() {
        super();

        this.gameState = Object.assign({}, initialGameState);
    }

    _write(chunk: Buffer, encoding: string, callback: (error?: Error | null | undefined) => void): void {

        if (encoding !== "buffer") {
            throw new Error();
        }

        const dataString = chunk.toString();
        const dataLines = dataString.split(os.EOL).filter(line => Boolean(line));

        dataLines.forEach(line => {
            const [dataKey, dataValue] = line.split(" ");
            this._parseData(dataKey, dataValue);
        })


        callback();
    }

    _parseData(key: string, val: string) {
        const dataValue = parseInt(val);

        switch (key) {

            case PlaybackKey.PLAYBACK_START_FRAME:
                this.gameState.playbackStart = dataValue;
                break;
            case PlaybackKey.GAME_END_FRAME:
                this.gameState.lastGameFrame = dataValue;
                break;
            case PlaybackKey.PLAYBACK_END_FRAME:
                this.gameState.playbackEnd = dataValue;
                break;
            case PlaybackKey.CURRENT_FRAME:
                this._processCurrentFrame(dataValue);
                break;
            case PlaybackKey.LRAS:
                this.gameState.forceQuit = true
                break;
        }
    }

    _processCurrentFrame(frameNum: number) {

        if (frameNum === this.gameState.playbackStart) {
            this.emit("playbackStarted");
        } else if (frameNum === this.gameState.playbackEnd) {
            this.gameState.gameEnded = true;
            this.emit("playbackFinished", {
                ended: this.gameState.gameEnded,
                forceQuit: this.gameState.forceQuit
            });

            this._resetGameState();
        }
    }

    private _resetGameState() {
        this.gameState = Object.assign({}, initialGameState);
    }
}