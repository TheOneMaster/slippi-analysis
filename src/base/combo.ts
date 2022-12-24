import { FramesType, PostFrameUpdateType, SlippiGame } from "@slippi/slippi-js"

import { ComboFrameState, ComboObject, ComboState, ReplayCombos } from "./types"
import { getPostFrame } from "./frames"
import { getLastMoveHitBy } from "./move"
import { isRecovering } from "./position"
import { isDead, isInGroundedControl } from "./state"
import { getGrabFrames } from "../analysis/base"
import { getCharacters } from "./char"

export class Combo {

    public state: ComboState

    private comboObject: ComboObject
    private frameState: ComboFrameState
    private differentMove: boolean

    constructor(frames: FramesType, frameNum: number, by: number, opponent: number, stageId: number) {

        const playerData = getPostFrame(frames, frameNum, by);
        const opponentData = getPostFrame(frames, frameNum, opponent);

        this.state = ComboState.ACTIVE;
        this.frameState = {};

        this.differentMove = true;

        this.comboObject = {
            by: by,
            byChar: playerData.internalCharacterId ?? -1,
            opponent: opponent,
            opponentChar: opponentData.internalCharacterId ?? -1,
            startFrame: frameNum,
            endFrame: frameNum,
            startPercent: opponentData.percent ?? -1,
            endPercent: opponentData.percent ?? -1,
            stage: stageId,
            toDeath: false,
            movesUsed: []
        }

        this.parseFrame(frames, frameNum);

    }

    parseFrame(frames: FramesType, frameNum: number): ComboState {

        const opponentData = getPostFrame(frames, frameNum, this.comboObject.opponent);
        const playerData = getPostFrame(frames, frameNum, this.comboObject.by);

        const opponentActionable = isInGroundedControl(opponentData);
        const opponentDead = isDead(opponentData);

        this._changed(playerData);

        if (opponentActionable || opponentDead) {
            if (opponentDead) {
                this.comboObject.toDeath = true;
            }
            this.state = ComboState.FINISHED;

        } else {

            this.state = ComboState.ACTIVE

            const opponentHitlag = opponentData.hitlagRemaining ?? 0

            if (opponentData.percent !== this.comboObject.endPercent && this.differentMove) {
                const lastHitMove = getLastMoveHitBy(frames, frameNum, this.comboObject.opponent, this.comboObject.by);

                this.comboObject.movesUsed.push(lastHitMove);
                this.differentMove = false;
            }


            if (isRecovering(opponentData, this.comboObject.stage)) {
                this.state = ComboState.EDGEGUARD
            }
        }

        this.comboObject.endFrame = frameNum;
        this.comboObject.endPercent = opponentData.percent ?? this.comboObject.endPercent;
        this.frameState[frameNum] = this.state;
        return this.state
    }

    _changed(frameData: PostFrameUpdateType) {

        if (!this.differentMove && frameData.hitlagRemaining === 0) {
            this.differentMove = true;
        }
    }

    _parsePotentialHit(frames: FramesType, frameNum: number) {

        const opponentFrameData = getPostFrame(frames, frameNum, this.comboObject.opponent);
        const opponentHitlag = opponentFrameData.hitlagRemaining ?? 0;

        if (opponentHitlag > 0 && this.differentMove) {
            this._addLastMove(frames, frameNum);
        }
    }

    _addLastMove(frames: FramesType, frameNum: number) {
        const lastHitMove = getLastMoveHitBy(frames, frameNum, this.comboObject.opponent, this.comboObject.by);

        this.comboObject.movesUsed.push(lastHitMove);
        this.differentMove = false;
    }

    toObject(): ComboObject {
        return Object.assign({}, this.comboObject);
    }

}


export function getGrabCombos(slp: SlippiGame): ReplayCombos {

    const slpFilePath = slp.getFilePath() ?? "";
    const slpChars = getCharacters(slp);
    const slpFrames = slp.getFrames();
    const slpStage = slp.getSettings()?.stageId ?? -1;

    const grabFrames = getGrabFrames(slp);
    const combos: Combo[] = [];

    for (const grabFrame in grabFrames) {

        const frameIndex = parseInt(grabFrame);
        const grabData = grabFrames[frameIndex];

        const combo = new Combo(slpFrames, frameIndex, grabData.by, grabData.grabbed, slpStage);

        for (let frameNum = frameIndex; frameNum in slpFrames; frameNum++) {
            const state = combo.parseFrame(slpFrames, frameNum);

            if (state === ComboState.FINISHED) {
                combos.push(combo)
                break;
            }
        }
    }

    const comboList: ComboObject[] = combos.map(combo => combo.toObject())

    return {
        path: slpFilePath,
        chars: slpChars,
        combos: comboList
    }
}
