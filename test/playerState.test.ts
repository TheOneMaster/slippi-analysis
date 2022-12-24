import { PostFrameUpdateType, SlippiGame } from "@slippi/slippi-js";
import { isOnstage, isRecovering } from "../src/base/position";


describe("Position testing", () => {

    const slpGame = new SlippiGame("slp/falco_marth.slp");
    const slpFrames = slpGame.getFrames();
    const slpStageId = slpGame.getSettings()?.stageId as number;

    it("No one is recovering on frame 0", () => {
        const playersData = slpFrames[0].players;
        const playersRecovering = Object.keys(playersData).map(playerId => {
            const playerId_int = parseInt(playerId);
            const playerData = playersData[playerId_int]?.post as PostFrameUpdateType;
            return isRecovering(playerData, slpStageId);
        });
        const anyRecovering = playersRecovering.some(recovering => recovering);

        expect(anyRecovering).not.toBe(true);
    });

    it("Falco is offstage on frame 6377", () => {
        const frameData = slpFrames[6377].players[1]?.post as PostFrameUpdateType;
        const onStage = isOnstage(frameData, slpStageId);

        expect(onStage).toBe(false);
    });

    it("Marth is recovering on frame 4016", () => {
        const frameData = slpFrames[4016].players[0]?.post as PostFrameUpdateType;
        const recovering = isRecovering(frameData, slpStageId);

        expect(recovering).toBe(true);
    });
});

describe("State testing", () => {
    // Add state testing
});