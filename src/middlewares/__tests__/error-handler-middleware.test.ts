import express from 'express'
import request from 'supertest'

import { errorHandler } from '../error-handler.middleware'

const app = express()

app.get('/error', (req, res, next) => {
	next(new Error('Test error'))
})

app.use(errorHandler)

describe('Error Handler Middleware', () => {
	it('should catch the error and return a 500 status code', async () => {
		const res = await request(app).get('/error')

		expect(res.status).toBe(500)
		expect(res.body).toEqual({ status: 500, message: 'Something went wrong' })
	})
})
