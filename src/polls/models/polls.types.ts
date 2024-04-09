import { z } from 'zod'

const voteSchema = z.object({
	id: z.string(),
	option: z.string(),
	user: z.string(),
})

export type Vote = z.infer<typeof voteSchema>

const optionSchema = z.object({
	id: z.string(),
	text: z.string().trim().min(1, 'Option is required'),
})

export type Option = z.infer<typeof optionSchema>

export const createPollSchema = z.object({
	question: z.string().trim().min(1, 'Question is required'),
	options: optionSchema
		.array()
		.min(2, 'At least two options are required')
		.max(5, 'At most 5 options are allowed'),
	votes: voteSchema.array(),
})

export type CreatePoll = z.infer<typeof createPollSchema>

export const pollSchema = z.object({
	id: z.string(),
	createPollSchema,
})

export type Poll = z.infer<typeof pollSchema>
