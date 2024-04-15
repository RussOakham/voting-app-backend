import express from 'express'

import polls from './polls.routes'

const router = express.Router()

export default (): express.Router => {
	polls(router)

	return router
}
