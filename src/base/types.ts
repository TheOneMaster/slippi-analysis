export interface ComboObject {
    by: number,
    byChar: number,
    opponent: number,
    opponentChar: number,
    startFrame: number,
    endFrame: number,
    startPercent: number,
    endPercent: number,
    movesUsed: Move[],
    toDeath: boolean,
    stage: number
}

export enum ComboState{
    ACTIVE = 0,
    EDGEGUARD = 1,
    FINISHED = 2
}

export interface ComboFrameState {
    [frameIndex: number]: ComboState
}

export interface Move {
    ID: number,
    playerID: number,
    damage: number,
    frameHit: number,
}

export interface ReplayCombos {
    path: string,
    chars: number[],
    combos: ComboObject[]
}
