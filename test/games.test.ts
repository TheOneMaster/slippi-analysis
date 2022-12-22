import { SlippiGame } from "@slippi/slippi-js";
import { getEdgeguards, getFailedRecoveries, getRecoveries } from "../src/analysis/recovery";

describe("Summit 11 Game 10 testing", () => {

    const slpGame = new SlippiGame("slp/summit_11_game_10.slp");
    const TOTAL_RECOVERIES = 34;
    const TOTAL_EDGEGUARDS = 20;

    describe("Recovery detection", () => {
        it("Has the correct number of recoveries in the game", () => {
            const gameRecovery = getRecoveries(slpGame);
            const recoveries = gameRecovery.recoveries;

            let numRecoveries = 0;
            for (const playerId in recoveries) {
                numRecoveries += recoveries[playerId].length
            };

            expect(numRecoveries).toBe(TOTAL_RECOVERIES);
        });

        it("Has the correct number of edgeguards", () => {
            const gameRecovery = getRecoveries(slpGame);
            const gameEdgeguards = getEdgeguards(gameRecovery);
            const edgeguards = gameEdgeguards.edgeguards;

            let numEdgeguards = 0;
            for (const playerId in edgeguards) {
                numEdgeguards += edgeguards[playerId].length;
            }

            expect(numEdgeguards).toBe(TOTAL_EDGEGUARDS);
        });

        it("Zain has 4 failed recoveries", () => {
            const gameRecovery = getRecoveries(slpGame);
            const failedRecoveries = getFailedRecoveries(gameRecovery);

            const recoveries = failedRecoveries.recoveries;

            expect(recoveries[0].length).toBe(4);
        });

        it("Mango has 3 failed recoveries", () => {
            const gameRecovery = getRecoveries(slpGame);
            const failedRecoveries = getFailedRecoveries(gameRecovery);

            const recoveries = failedRecoveries.recoveries;

            expect(recoveries[1].length).toBe(3);
        });
    })



})