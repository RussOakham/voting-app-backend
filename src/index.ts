import bodyParser from 'body-parser'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express, { Express } from 'express'
import { pino } from './utils/logger'
import { io as ioSocket } from './utils/socket'
import { createServer } from 'http'

import pollsRoutes from './polls/routes/polls.routes'
import { errorHandler } from './utils/middlewares/error-handler.middleware'

dotenv.config()

const app: Express = express()
const port = process.env.PORT
const { logger } = pino

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

const router = () => {
	const router = express.Router()

	pollsRoutes(router)

	return router
}

app.use('/', router())

const httpServer = createServer(app)

const io = ioSocket.init(httpServer)

io.on('connection', (socket) => {
	logger.info(`[socket]: Socket connected ${socket.id}`)
	socket.on('disconnect', () => {
		logger.info(`[socket]: Socket disconnected ${socket.id}`)
	})
})

app.use(errorHandler)

httpServer.listen(port, () => {
	logger.info(`[server]: Server is running at http://localhost:${port}`)
})
