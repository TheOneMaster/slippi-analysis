import { readdir } from "fs/promises";
import { SlippiGame } from "@slippi/slippi-js";
import path from "path";

import { SlippiReadError } from "./error";

export async function readDirectory(dir: string): Promise<SlippiGame[]> {

    const files = await readdir(dir);
    const slp_files = files.map(file => new SlippiGame(path.join(dir, file)));

    return slp_files;
}

export function roundToDecimal(num: number, sig_figs: number) {
    const p = Math.pow(10, sig_figs);
    const n = (num * p) * (1 + Number.EPSILON);
    return Math.round(n)/p;
}
