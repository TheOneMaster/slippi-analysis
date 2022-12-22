import { Recovery } from "./recovery"

export interface RecoveryObject {
    startFrame: number,
    endFrame: number,
    startPercent: number,
    endPercent: number,

    hitBy: Move[],
    successful: boolean,
    fromEdgeguard: boolean,
    opponent: number
}

export interface GameRecoveries {
    path: string,
    chars: number[],
    recoveries: PlayerRecoveries
}

export interface Edgeguard {
    by: number,
    to: number,
    startFrame: number,
    endFrame: number,
    successful: boolean,
    startPercent: number,
    endPercent: number,
    movesHit: Move[]
}

export interface PlayerEdgeguards {
    [playerIndex: number]: Edgeguard[]
}

export interface GameEdgeguards {
    path: string,
    chars: number[],
    edgeguards: PlayerEdgeguards
}


export interface PlayerRecoveries {
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
