import { FrameEntryType, SlippiGame } from "@slippi/slippi-js"

import { 
    GameRecoveries,
    ActiveRecoveries,
    RecoveryObject,
    Move,
    RecoveryStatus 
} from "./recovery.interface"

import { isDead, isInHitstun } from "./state"
import { isRecovering } from "./position"
import { SlippiReadError } from "../error"


export class Recovery {

    public startFrame: number
    public endFrame: number
    public startPercent: number
    public endPercent: number
    public successful: boolean
    public hitBy: Move[]

    private playerIndex: number
    private lastHitBy: number
    private recoveryStatus: RecoveryStatus

    constructor(startFrame: number, startPercent: number, playerIndex: number) {
        this.startFrame = startFrame;
        this.startPercent = startPercent;

        this.endFrame = startFrame;
        this.endPercent = startPercent;
        this.successful = true;
        this.hitBy = [];

        this.playerIndex = playerIndex;
        this.lastHitBy = -1;
        this.recoveryStatus = RecoveryStatus.ACTIVE;
    }

    parseFrame(frame: FrameEntryType, stageId: number): RecoveryStatus {
        const frame_playerData = frame.players[this.playerIndex];

        const currentFrame_playerData = frame_playerData?.post;

        if (currentFrame_playerData === undefined) {
            return this.recoveryStatus;
        }

        
        if (isRecovering(currentFrame_playerData, stageId)) {
            this.endFrame = frame.frame;
            this.endPercent = currentFrame_playerData.percent ?? this.endPercent;
        } else {
            
            if (isDead(currentFrame_playerData)) this.successful = false;

            this.recoveryStatus = RecoveryStatus.FINISHED;
        }

        return this.recoveryStatus
    }

    toObject(): RecoveryObject {
        const rec_obj: RecoveryObject = {
            startFrame: this.startFrame,
            endFrame: this.endFrame,
            startPercent: this.startPercent,
            endPercent: this.endPercent,
            hitBy: this.hitBy,
            successful: this.successful
        }

        return rec_obj
    }

}


export function getRecoveries(slp: SlippiGame): GameRecoveries {

    const slp_settings = slp.getSettings();
    const slp_players = slp_settings?.players;
    const slp_stageId = slp_settings?.stageId;

    if (slp_players === undefined || slp_stageId == null) {
        throw new SlippiReadError(slp);
    }

    const slp_frames = slp.getFrames();
    const gameRecoveries: GameRecoveries = {};
    const activeRecoveries: ActiveRecoveries = {};

    for (const frameIndex in slp_frames) {

        const frameIndex_int = parseInt(frameIndex);
        const frameData = slp_frames[frameIndex];

        // Parse already recovering players
        for (const playerId in activeRecoveries) {
            const playerRecovery = activeRecoveries[playerId];
            const recovery_status = playerRecovery.parseFrame(frameData, slp_stageId);

            if (recovery_status === RecoveryStatus.FINISHED) {

                const recoveryObject = playerRecovery.toObject();
                delete activeRecoveries[playerId];
                
                if (playerId in gameRecoveries) {
                    gameRecoveries[playerId].push(recoveryObject);
                } else {
                    gameRecoveries[playerId] = [recoveryObject]
                }
            }
        }

        // Get players not already in the process of recovering
        const otherPlayers: number[] = Object.keys(frameData.players)
            .filter(playerId => !(playerId in activeRecoveries))
            .map(playerId => parseInt(playerId));

        for (const playerId of otherPlayers) {
            const playerData = frameData.players[playerId]?.post;

            if (playerData === undefined) {
                continue
            }

            // If they are recognized as recovering & not 
            if (isRecovering(playerData, slp_stageId)) {
                const startPercent = playerData.percent ?? -1;
                activeRecoveries[playerId] = new Recovery(frameIndex_int, startPercent, playerId);
            }

            continue
        }
    }

    
    return gameRecoveries
}
