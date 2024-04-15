import { type Router } from 'express'

import {
	createPoll,
	getPollById,
	getPolls,
	submitVote,
} from '../controllers/polls.controller'
import { validateData } from '../middlewares/validate-data.middleware'
import {
	createPollsApiRequestSchema,
	getPollApiRequestSchema,
	submitVoteApiRequestSchema,
} from '../models/polls.types'

export default (router: Router) => {
	router.get('/polls', getPolls)
	router.get(
		'/polls/:pollId',
		validateData(getPollApiRequestSchema),
		getPollById,
	)
	router.post(
		'/create-poll',
		validateData(createPollsApiRequestSchema),
		createPoll,
	)
	router.post(
		'/submit-vote',
		validateData(submitVoteApiRequestSchema),
		submitVote,
	)
}
