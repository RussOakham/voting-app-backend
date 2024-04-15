import bodyParser from 'body-parser'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Express } from 'express'

import { errorHandler } from '../middlewares/error-handler.middleware'
import router from '../router/index.routes'

import { pino } from './logger'

function createServer() {
	const app: Express = express()

	app.use(
		cors({
			credentials: true,
		}),
	)
	app.use(compression())
	app.use(cookieParser())
	app.use(
		bodyParser.urlencoded({
			extended: true,
		}),
	)
	app.use(bodyParser.json())
	app.use(pino)

	app.use('/', router())

	app.use(errorHandler)

	return app
}

export default createServer
