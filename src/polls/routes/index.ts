import { type Router } from 'express'

import { createPoll, getPolls } from '../controllers/polls'

export default (router: Router) => {
	router.get('/polls', getPolls)
	router.post('/create-poll', createPoll)
}
