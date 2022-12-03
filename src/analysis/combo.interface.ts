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
