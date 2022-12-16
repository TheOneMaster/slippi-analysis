import { calcDamageTaken, FrameEntryType, FramesType, PostFrameUpdateType, SlippiGame } from "@slippi/slippi-js"

import { 
    GameRecoveries,
    ActiveRecoveries,
    RecoveryObject,
    Move,
    RecoveryStatus 
} from "./recovery.interface"

import { isDead, isInHitstun } from "./state"
import { isRecovering } from "./position"
import { FrameReadError, SlippiReadError } from "../error"


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
    private opponentIndex: number
    private prevFrame: PostFrameUpdateType

    constructor(frames: FramesType, frameNum: number, playerIndex: number) {

        const frame = frames[frameNum];
        const playerData = frame.players[playerIndex];

        this.startFrame = frame.frame;
        this.startPercent = playerData?.post.percent ?? -1;
        
        this.endFrame = this.startFrame;
        this.endPercent = this.startPercent;
        this.successful = true;
        this.hitBy = [];

        this.playerIndex = playerIndex;
        this.lastHitBy = -1;
        this.recoveryStatus = RecoveryStatus.ACTIVE;

        this.opponentIndex = Object.keys(frame.players).reduce((opp, playerId) => {

            const playerId_int = parseInt(playerId);

            if (playerId_int !== playerIndex) {
                return playerId_int
            }

            return opp
        }, -1);
        const frameData = playerData?.post;
        const opponent_frameData = frame.players[this.opponentIndex];

        if (!frameData || !opponent_frameData) {
            throw new FrameReadError(frame);
        }
        this.prevFrame = frameData;

        if (isInHitstun(frameData)) {
            this.lastHitBy = this.getOpponentLastMove(frame);
            this.hitBy.push(this.getOpponentMove(frames, frameNum));
        }


    }

    parseFrame(frames: FramesType, frameNum: number, stageId: number): RecoveryStatus {
        
        const frame = frames[frameNum];


        const frame_playerData = frame.players[this.playerIndex];
        const playerData_current = frame_playerData?.post;

        if (playerData_current !== undefined) {
            
            if (isDead(playerData_current)) {
                this.successful = false;
                this.recoveryStatus = RecoveryStatus.FINISHED;
            } else if (isRecovering(playerData_current, stageId)) {
                this.endFrame = frame.frame;
                this.endPercent = playerData_current.percent ?? this.endPercent;

                if (isInHitstun(playerData_current)){
        
                    const opponentMove = this.getOpponentLastMove(frame)
                
                    if (opponentMove !== this.lastHitBy) {
                        
                        this.lastHitBy = opponentMove;
                        const move = this.getOpponentMove(frames, frameNum);

                        this.hitBy.push(move);
                    }
                    
                }
            }
             else {    
                this.recoveryStatus = RecoveryStatus.FINISHED;
            }
        }

        this.prevFrame = playerData_current ?? this.prevFrame;
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

    private getOpponentLastMove(frame: FrameEntryType): number {

        const opponentData = frame.players[this.opponentIndex];

        if (!opponentData) {
            throw new FrameReadError(frame);
        }

        const lastMoveUsed = opponentData.post.lastAttackLanded ?? -1;

        return lastMoveUsed
    }

    private getOpponentMove(frames: FramesType, frameNum: number): Move {

        const frame = frames[frameNum];

        const playerData = frame.players[this.playerIndex];

        if (!playerData) {
            throw new FrameReadError(frame);
        }

        const player_frameData = playerData.post;
        const lastHittingMove = this.getOpponentLastMove(frame)
        
        let moveDamage = calcDamageTaken(player_frameData, this.prevFrame);
        let moveFrame = frame.frame;

        if (moveDamage === 0) {
            for (let frameIndex=frameNum; frameIndex >= -123; frameIndex--) {
                const checking_frame = frames[frameIndex];

                const checking_playerData = checking_frame.players[this.playerIndex];

                if (!checking_playerData) {
                    continue
                }

                const current_percent = player_frameData.percent ?? -1;
                const checking_percent = checking_playerData.post.percent ?? -1; 

                if (current_percent !== checking_percent) {
                    moveDamage = current_percent - checking_percent;
                    moveFrame = frameIndex
                    break
                }
            }
        }

        const move: Move = {
            playerId: this.opponentIndex,
            moveId: lastHittingMove,
            frame: moveFrame,
            damage: moveDamage
        }

        return move
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

        const frameData = slp_frames[frameIndex];
        const frameNum = frameData.frame;

        // Parse already recovering players
        for (const playerId in activeRecoveries) {
            const playerRecovery = activeRecoveries[playerId];
            const recovery_status = playerRecovery.parseFrame(slp_frames, frameNum, slp_stageId);

            if (recovery_status === RecoveryStatus.FINISHED) {

                const recoveryObject = playerRecovery.toObject();
                delete activeRecoveries[playerId];
                
                if (playerId in gameRecoveries) {
                    gameRecoveries[playerId].push(recoveryObject);
                } else {
                    gameRecoveries[playerId] = [recoveryObject];
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
                activeRecoveries[playerId] = new Recovery(slp_frames, frameNum, playerId);
            }

            continue
        }
    }
    
    // Remove recoveries identified that are not at least 10 frames long
    for (const playerId in gameRecoveries) {

        gameRecoveries[playerId] = gameRecoveries[playerId].filter((recovery) => {
            const totalFrames = recovery.endFrame - recovery.startFrame;

            return totalFrames >= 10;
        })


    }


    return gameRecoveries
}
