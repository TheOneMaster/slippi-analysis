export interface GameState {
    gameEnded: boolean,
    forceQuit: boolean,

    currentFrame: number,
    lastGameFrame: number,

    playbackStart: number,
    playbackEnd: number
}

export enum PlaybackKey {
    LRAS = "[LRAS]",
    PLAYBACK_START_FRAME = "[PLAYBACK_START_FRAME]",
    GAME_END_FRAME = "[GAME_END_FRAME]",
    PLAYBACK_END_FRAME = "[PLAYBACK_END_FRAME]",
    CURRENT_FRAME = "[CURRENT_FRAME]"
}