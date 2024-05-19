import { z } from "zod";

export const roomsValidator = z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    tiles: z.string(),
}).array();