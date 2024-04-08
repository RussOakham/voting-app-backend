import bodyParser from 'body-parser'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express, { Express } from 'express'
import http from 'http'

import pollsRoutes from './polls/routes'

dotenv.config()

const app: Express = express()
const port = process.env.PORT

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const server = http.createServer(app)

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`)
})

const router = () => {
	const router = express.Router()

	pollsRoutes(router)

	return router
}

app.use('/', router())