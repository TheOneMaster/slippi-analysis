export interface PlaybackReplayCommunication {
    mode: "normal" | "mirror" | "queue",
    replay: string,
    startFrame?: number,
    endFrame?: number,
    commandId?: string,
    outputOverlayFiles?: boolean; // outputs gameStartAt and gameStation to text files (only works in queue mode)
    isRealTimeMode?: boolean; // default false; keeps dolphin fairly close to real time (about 2-3 frames); only relevant in mirror mode
    shouldResync?: boolean; // default true; disables the resync functionality
    rollbackDisplayMethod?: "off" | "normal" | "visible"; // default off; normal shows like a player experienced it, visible shows ALL frames (normal and rollback)
    gameStation?: string,
    queue?: QueueReplayItem[]
}

export interface QueueReplayItem {
    path: string,
    startFrame?: number,
    endFrame?: number,
    gameStartAt?: string,
    gameStation?: string
}
