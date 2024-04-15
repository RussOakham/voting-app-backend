import express from 'express'
import httpMocks from 'node-mocks-http'
import request from 'supertest'
import z from 'zod'

import { BadRequestError } from '../../utils/errors'
import { validateData } from '../validate-data.middleware'

const testSchema = z.object({
	body: z.object({
		question: z.string().min(1, 'Question is required'),
	}),
})

const app = express()

app.use(express.json())
app.use(validateData(testSchema))

app.post('/test', (req, res) => {
	res.status(200).json({ message: 'Success' })
})

describe.only('Validation Data Middleware', () => {
	it('should return 400 if the request body does not match the given schema', async () => {
		// Arrange
		const next = jest.fn()
		const req = httpMocks.createRequest({
			body: {
				incorrectKey: 'Test?',
			},
		})
		const res = httpMocks.createResponse()

		// Act
		await validateData(testSchema)(req, res, next)

		// Assert
		expect(next).toHaveBeenCalledWith(
			new BadRequestError(`[{"message":"body.question is Required"}]`),
		)
	})

	it('should return 200 if the request body is valid', async () => {
		const res = await request(app).post('/test').send({ question: 'Test?' })

		expect(res.status).toBe(200)
		expect(res.body).toEqual({ message: 'Success' })
	})
})
