import { Recovery } from "./recovery"

export interface RecoveryObject {
    startFrame: number,
    endFrame: number,

    startPercent: number,
    endPercent: number,

    successful: boolean
}
export interface GameRecoveries {
    [playerIndex: number]: RecoveryObject[]
}
export interface ActiveRecoveries {
    [playerIndex: number]: Recovery
}
