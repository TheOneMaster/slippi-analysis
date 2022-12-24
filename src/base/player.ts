import { FramesType } from "@slippi/slippi-js";

export function getOpponentId(frames: FramesType, frameNum: number, playerIndex: number): number {

    // Get current frame data
    const frameData = frames[frameNum];
    const players = frameData.players;

    // Return player last hit by if possible (unable to hit yourself) (maybe pichu can?)
    const lastHitBy = players[playerIndex]?.post.lastHitBy;
    
    if (lastHitBy != null) {
        return lastHitBy
    } 

    // Find opponent by filtering all players in the game
    const opponent = Object.keys(players)
        .map(playerId => parseInt(playerId))
        .filter(playerId => !players[playerId]?.post.isFollower)   // Remove nana playerID's
        .reduce((opponent, playerId) => {
            if (playerId !== playerIndex) {
                return playerId
            }
            return opponent
        }, -1);

    return opponent;
}
