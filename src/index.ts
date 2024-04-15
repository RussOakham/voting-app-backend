import dotenv from 'dotenv'
dotenv.config()

import config from 'config'
import { createServer as createHttpServer } from 'http'

import { errorHandler } from './middlewares/error-handler.middleware'
import { pino } from './utils/logger'
import createServer from './utils/server'
import { io as ioSocket } from './utils/socket'

const { logger } = pino

const port = config.get<number>('port')

const app = createServer()

const httpServer = createHttpServer(app)

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
