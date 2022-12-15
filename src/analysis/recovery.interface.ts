import { Recovery } from "./recovery"

export interface RecoveryObject {
    startFrame: number,
    endFrame: number,
    startPercent: number,
    endPercent: number,

    hitBy: Move[],
    successful: boolean
}
export interface GameRecoveries {
    [playerIndex: number]: RecoveryObject[]
}
export interface ActiveRecoveries {
    [playerIndex: number]: Recovery
}

export interface Move {
    playerId: number,
    moveId: number,
    frame: number,
    damage: number
}

export enum RecoveryStatus {
    ACTIVE = 0,
    FINISHED = 1
}
