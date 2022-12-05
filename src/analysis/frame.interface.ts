export interface FrameData {
    [playerIndex: number]: FramePlayerData
}

export interface FramePlayerData {
    x: number,
    y: number,
    isAirborne: boolean,
    char: number,
    playerIndex: number
}

export interface SimilarFrames {
    [slp_filename: string]: number[]
}

export interface SyncedPlayers {
    [playerIndex: number]: number
}
