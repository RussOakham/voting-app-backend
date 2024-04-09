import { type Router } from 'express'

import { createPoll, getPolls } from '../controllers/polls'
import { validateData } from '../../utils/middleware'
import { createPollSchema } from '../models/polls.types'

export default (router: Router) => {
	router.get('/polls', getPolls)
	router.post('/create-poll', validateData(createPollSchema), createPoll)
}
