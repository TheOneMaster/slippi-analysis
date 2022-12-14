import { ActiveRecoveries, RecoveryObject } from "./combo.interface"

export class Recovery {

    public startFrame: number
    public endFrame: number
    public startPercent: number
    public endPercent: number
    public successful: boolean

    private static activeRecoveries: ActiveRecoveries = {}

    constructor(startFrame: number, startPercent: number, playerIndex: number) {
        this.startFrame = startFrame;
        this.startPercent = startPercent;

        this.endFrame = startFrame;
        this.endPercent = startPercent;
        this.successful = true;

        Recovery.activeRecoveries[playerIndex] = this;
    }

    static getActiveRecovery(playerIndex: number): Recovery|undefined {
        return Recovery.activeRecoveries[playerIndex]
    }

    static endRecovery(playerIndex: number) {
        delete Recovery.activeRecoveries[playerIndex]
    }

    toObject(): RecoveryObject {
        const rec_obj: RecoveryObject = {
            startFrame: this.startFrame,
            endFrame: this.endFrame,
            startPercent: this.startPercent,
            endPercent: this.endPercent,
            successful: this.successful
        }

        return rec_obj
    }

}
