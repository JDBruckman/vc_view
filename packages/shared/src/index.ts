import { z } from "zod";

export const MetricNameSchema = z.enum(["acos", "roas", "tacos"]);
export type MetricName = z.infer<typeof MetricNameSchema>;
