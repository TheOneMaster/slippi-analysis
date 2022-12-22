import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import path from "path";
import * as fs from "fs-extra"

import { PlaybackReplayCommunication, QueueReplayItem } from "./playback.interface";
import { fileExists } from "../helper";
import { GameRecoveries } from "../analysis/recovery.interface";


export class PlaybackDolphin {

    public dolphinBinaryLocation: string
    public meleeISOPath: string
    public dolphinInstance: ChildProcessWithoutNullStreams | null
    
    constructor(dolphinPath: string, meleeISO: string) {
        this.dolphinBinaryLocation = dolphinPath;
        this.meleeISOPath = meleeISO;
        this.dolphinInstance = null;
    }

    async play(replayFile: string, options?: PlaybackReplayCommunication) {

        let communicationOptions: PlaybackReplayCommunication;

        if (options) {
            communicationOptions = options;
        } else {
            communicationOptions = {
                mode: "normal",
                replay: replayFile
            };
        }

        const commFilePath = this.createTempFilename();

        await fs.writeFile(commFilePath, JSON.stringify(communicationOptions));

        const params = ["-b", "-e", this.meleeISOPath];
        params.push("-i", commFilePath);

        this.dolphinInstance = spawn(this.dolphinBinaryLocation, params);

        this.dolphinInstance.on("error", (error: Error) => {
            console.warn(error);
            this.deleteFile(commFilePath);
        })

        this.dolphinInstance.on("close", () => this.deleteFile(commFilePath));
    }

    private createTempFilename(): string {
        const randomString = new Date().toString();
        const commFileName = `slippi-comm-${randomString}.json`;
        const commFilePath = path.join('.', commFileName);

        return commFilePath
    }

    private async deleteFile(filePath: string) {
        try {
            const exists = await fileExists(filePath);
            if (exists) {
                fs.unlink(filePath)
            }
        } catch (err) {
            console.warn(err)
        }
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