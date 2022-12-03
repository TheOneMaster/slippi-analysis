export interface GrabFrames {
    [frameIndex: string]: Grab
}
export interface Grab {
    frameStart: number,
    by: number,
    grabbed: number
}
