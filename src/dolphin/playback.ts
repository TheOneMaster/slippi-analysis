import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import { randomBytes } from "crypto";
import path from "path";
import * as fs from "fs-extra"
import { PlaybackReplayCommunication } from "./playback.interface";
import { fileExists } from "../helper";


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

        const commFilePath = this.generateTempCommunicationFile();

        await fs.writeFile(commFilePath, JSON.stringify(communicationOptions));

        const params = ["-b", "-e", this.meleeISOPath];
        params.push("-i", commFilePath);

        this.dolphinInstance = spawn(this.dolphinBinaryLocation, params);

        this.dolphinInstance.on("error", async (err) => {
            console.warn(err);
            this.deleteFile(commFilePath);
        })

        this.dolphinInstance.on("close", async () => this.deleteFile(commFilePath));
    }

    private generateTempCommunicationFile() {
        const randomString = randomBytes(10).toString("hex");
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
