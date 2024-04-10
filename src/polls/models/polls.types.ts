import { z } from 'zod'

const voteSchema = z.object({
	id: z.string(),
	option: z.string(),
	user: z.string(),
	createdAt: z.string(),
})

export type Vote = z.infer<typeof voteSchema>

const optionSchema = z.object({
	id: z.string(),
	text: z.string().trim().min(1, 'Option is required'),
})

export type Option = z.infer<typeof optionSchema>

export const createPollSchema = z.object({
	question: z
		.string({
			required_error: 'Question is required',
		})
		.trim()
		.min(1, 'Question is required'),
	options: optionSchema
		.array()
		.min(2, 'At least two options are required')
		.max(5, 'At most 5 options are allowed'),
	votes: voteSchema.array(),
	createdBy: z.string().trim().min(1, 'createdBy is required'),
})

export type CreatePoll = z.infer<typeof createPollSchema>

export const pollSchema = createPollSchema.extend({
	id: z.string(),
	createdAt: z.string().trim().min(1, 'createdAt is required'),
	updatedAt: z.string().trim().min(1, 'updatedAt is required'),
})

export type Poll = z.infer<typeof pollSchema>

export const submitVoteSchema = z.object({
	pollId: z.string(),
	votes: voteSchema.array(),
	submittedVote: z.object({
		userId: z.string(),
		optionId: z.string(),
		optionText: z.string(),
	}),
})

export type SubmitVote = z.infer<typeof submitVoteSchema>
