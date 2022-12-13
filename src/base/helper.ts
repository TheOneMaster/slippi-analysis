import { Stage, Character } from "@slippi/slippi-js";

export function getStageName(stageId: number): string {
    const stageName = Stage[stageId];
    return stageName;
}

export function getCharacterName(charId: number): string {
    const charName = Character[charId];
    return charName;
}
