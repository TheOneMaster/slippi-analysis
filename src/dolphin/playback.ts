import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import path from "path";
import * as fs from "fs-extra"

import { DolphinOptions, PlaybackReplayCommunication, QueueReplayItem } from "./playback.interface";
import { fileExists } from "../helper";
import { GameRecoveries } from "../analysis/recovery.interface";
import { DolphinOutput } from "./output";


const defaultCommsOptions: PlaybackReplayCommunication = {
    mode: "queue",
    commandId: "0",
    isRealTimeMode: false
}

const defaultDolphinOptions: DolphinOptions = {
    loop: false,
    dolphinPath: "",
    meleeISO: "",
    stdout: true
}

export class PlaybackDolphin {

    public dolphinInstance: ChildProcessWithoutNullStreams | null

    private output: DolphinOutput
    private commsOptions: PlaybackReplayCommunication;
    private commFilePath: string;
    private dolphinOptions: DolphinOptions
    
    constructor(dolphinPath: string, meleeISO: string) {
        this.dolphinInstance = null;
        
        this.output = new DolphinOutput();
        this.commsOptions = Object.assign({}, defaultCommsOptions);
        this.commFilePath = this._createTempFilename();
        
        this.dolphinOptions = Object.assign({}, defaultDolphinOptions);
        this.dolphinOptions.dolphinPath = dolphinPath;
        this.dolphinOptions.meleeISO = meleeISO;
        

        this.output.on("playbackFinished", () => {
            if (this.dolphinOptions.loop) {
                this.loop()
            } else {
                this.dolphinInstance?.kill();
            }
        })
    }

    async play(options: PlaybackReplayCommunication, loop?: boolean) {

        if (loop) this.dolphinOptions.loop = true;

        // Write communication JSON file
        this.commsOptions = Object.assign(this.commsOptions, options)
        await fs.outputFile(this.commFilePath, JSON.stringify(this.commsOptions));

        // Launch dolphin emulator
        const params = this._createLaunchParams();
        this.dolphinInstance = spawn(this.dolphinOptions.dolphinPath, params);

        // Deal with dolphin output
        this.dolphinInstance.stdout.pipe(this.output, {end: false})

        // Dolphin close and error handling (delete temp file)
        this.dolphinInstance.on("error", (error: Error) => {
            console.warn(error);
            this._deleteFile();
        })

        this.dolphinInstance.on("close", () => this._deleteFile());

        
    }

    async loop() {
        this.commsOptions.commandId = Math.random().toString();

        await fs.writeFile(this.commFilePath, JSON.stringify(this.commsOptions));
    }

    private _createTempFilename(): string {

        // Currently creating a file in the CWD in folder /json
        // Move to temp dir in release version

        const randomString = new Date().toString();
        const commFileName = `slippi-comm-${randomString}.json`;
        const commFilePath = path.join('./json', commFileName);

        return commFilePath
    }

    private async _deleteFile() {
        try {
            const exists = await fileExists(this.commFilePath);
            if (exists) {
                fs.unlink(this.commFilePath)
            }
        } catch (err) {
            console.warn(err)
        }
    }

    private _createLaunchParams(): string[] {
        const params = [];

        params.push("-b")                                            // Close dolphin once emulation is over
        params.push("-e", this.dolphinOptions.meleeISO)              // Launch melee
        params.push("-i", this.commFilePath)                         // Add replay comm file 
        if (this.dolphinOptions.stdout) params.push("--cout")        // Dolphin console output

        return params
    }

}

export function createRecoveryQueue(gameRecoveries: GameRecoveries, playerId?: number): QueueReplayItem[] {

    const filePath = gameRecoveries.path;
    
    let queue: QueueReplayItem[] = []

    if (playerId) {
        const recoveries = gameRecoveries.recoveries[playerId];

        queue = recoveries.map(recovery => {
            const queueItem: QueueReplayItem = {
                path: filePath,
                startFrame: recovery.startFrame,
                endFrame: recovery.endFrame
            };
            return queueItem
        });
    } else {
        const playerRecoveries = gameRecoveries.recoveries;

        for (const playerId in playerRecoveries) {
            const recoveryList = playerRecoveries[playerId];

            const recoveryQueue = recoveryList.map(recovery => {
                const queueItem: QueueReplayItem = {
                    path: filePath,
                    startFrame: recovery.startFrame,
                    endFrame: recovery.endFrame
                };
                
                return queueItem;
            })

            queue.push(...recoveryQueue);
        }
    }

    return queue
}

