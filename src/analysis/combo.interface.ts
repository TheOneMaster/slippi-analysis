export interface Combo {
    frames: number[],
    player: number,

    startFrame: number,
    endFrame: number,
    
    startPercent: number,
    endPercent: number,
    
    toDeath: boolean,
    fromGrab?: boolean
}
export interface ReplayCombos { 
    [frameIndex: string]: Combo
}

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
