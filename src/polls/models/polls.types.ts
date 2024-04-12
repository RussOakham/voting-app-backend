import { z } from 'zod'

export const getPollSchema = z.object({
	pollId: z.string(),
})

export type GetPoll = z.infer<typeof getPollSchema>

export const getPollApiRequestSchema = z.object({
	params: getPollSchema,
})

export type GetPollApiRequest = z.infer<typeof getPollApiRequestSchema>

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

export const createPollsApiRequestSchema = z.object({
	body: createPollSchema,
})

export type CreatePollsApiRequest = z.infer<typeof createPollsApiRequestSchema>

export const pollSchema = createPollSchema.extend({
	id: z.string(),
	createdAt: z.string().trim().min(1, 'createdAt is required'),
	updatedAt: z.string().trim().min(1, 'updatedAt is required'),
})

export type Poll = z.infer<typeof pollSchema>

export const submittedVoteSchema = z.object({
	userId: z.string(),
	optionId: z.string(),
	optionText: z.string(),
})

export type SubmittedVote = z.infer<typeof submittedVoteSchema>

export const submitVoteSchema = z.object({
	pollId: z.string(),
	votes: voteSchema.array(),
	submittedVote: submittedVoteSchema,
})

export type SubmitVote = z.infer<typeof submitVoteSchema>

export const submitVoteApiRequestSchema = z.object({
	body: submitVoteSchema,
})

export type SubmitVoteApiRequest = z.infer<typeof submitVoteApiRequestSchema>
