import { Character } from "@slippi/slippi-js";
import { Stage } from "@slippi/slippi-js";

export interface Filter {
    chars?: Character[],
    stage?: Stage,
    numPlayers?: number
}

