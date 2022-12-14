import { SlippiGame } from "@slippi/slippi-js"

import { GameRecoveries, ActiveRecoveries, RecoveryObject } from "./recovery.interface"
import { isRecovering, isDead } from "./state"
import { SlippiReadError } from "../error"

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

export function getRecoveries(slp: SlippiGame) {

    const slp_settings = slp.getSettings();
    const slp_players = slp_settings?.players;
    const slp_stageId = slp_settings?.stageId;

    if (slp_players === undefined || slp_stageId == undefined) {
        throw new SlippiReadError(slp);
    }

    const slp_frames = slp.getFrames();

    const gameRecoveries: GameRecoveries = {};

    for (const frameIndex in slp_frames) {

        const frameData = slp_frames[frameIndex];
        const frame_players = frameData.players;

        for (const playerId in frame_players) {
            const frame_playerData = frame_players[playerId]?.post;

            if (frame_playerData === undefined) {
                continue
            }

            const recovery_check = isRecovering(frame_playerData, slp_stageId);
            const dead_check = isDead(frame_playerData);
            const playerIndex = parseInt(playerId);

            if (!recovery_check || dead_check) {

                const active_recovery = Recovery.getActiveRecovery(playerIndex);

                if (active_recovery === undefined) {
                    continue
                }

                Recovery.endRecovery(playerIndex);

                if (dead_check) active_recovery.successful = false;

                if (gameRecoveries[playerIndex]) {
                    gameRecoveries[playerIndex].push(active_recovery.toObject())
                    continue
                }

                gameRecoveries[playerIndex] = [active_recovery.toObject()];
                continue
            } 

            const frameIndex_int = parseInt(frameIndex);
            let active_recovery = Recovery.getActiveRecovery(frameIndex_int);

            if (active_recovery === undefined) {
                const startPercent = frame_playerData.percent ?? -1;
                active_recovery = new Recovery(frameIndex_int, startPercent, playerIndex);
            }

            active_recovery.endPercent = frame_playerData.percent ?? active_recovery.endPercent;
            active_recovery.endFrame = frameIndex_int;
        }

    }

    return gameRecoveries
}
