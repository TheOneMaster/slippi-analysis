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

    async play(replayFile: string, startFrame?: number, endFrame?: number) {

        const communicationOptions: PlaybackReplayCommunication = {
            mode: "normal",
            replay: replayFile,
            startFrame: startFrame,
            endFrame: endFrame
        };

        const commFilePath = this.generateTempCommunicationFile();
        
        await fs.writeFile(commFilePath, JSON.stringify(communicationOptions));

        const params = ["-b", "-e", this.meleeISOPath];
        params.push("-i", commFilePath);

        this.dolphinInstance = spawn(this.dolphinBinaryLocation, params);

        this.dolphinInstance.on("error", (err) => {
            console.log(err);
        })

        this.dolphinInstance.on("close", async () => {
            try {
                const exists = await fileExists(commFilePath);
                if (exists) {
                    fs.unlink(commFilePath);
                }
            } catch (err) {
                console.warn(err);
            }
        });
    }

    private generateTempCommunicationFile() {
        const randomString = randomBytes(10).toString("hex");
        const commFileName = `slippi-comm-${randomString}.json`;
        const commFilePath = path.join('.', commFileName);

        return commFilePath
    }

}
