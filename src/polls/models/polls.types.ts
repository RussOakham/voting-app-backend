import { z } from "zod";

const pollOptionSchema = z.object({
  index: z.number(),
  option: z.string({
    required_error: "Option is required",
  }),
});

const pollSchema = z.object({
  question: z.string({
    required_error: "Question is required",
  }),
  options: z
    .array(pollOptionSchema, {
      required_error: "Options are required",
    })
    .min(2, "At least two options are required")
    .max(5, "At most 5 options are allowed"),
});

const votesSchema = z.object({
  votes: z.record(z.number(), z.number()),
});

export type PollOption = z.infer<typeof pollOptionSchema>;
export type Poll = z.infer<typeof pollSchema>;
export type Votes = z.infer<typeof votesSchema>;

export interface PollWithVotes extends Poll {
  votes: Votes;
}
