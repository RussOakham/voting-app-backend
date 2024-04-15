import { createServer as createHttpServer } from 'http'
import supertest from 'supertest'

import * as getPollsClient from '../services/polls.service'
import { NotFoundError } from '../utils/errors'
import createServer from '../utils/server'

import {
	createdPollMock,
	createPollMock,
	mockPolls,
	mockPollsApiResponse,
} from './data/polls.test-data'

jest.mock('../db/dynamo', () => ({
	__esModule: true,
	TABLE_NAME: 'polls-test',
}))

const app = createServer()
const httpServer = createHttpServer(app)

describe('Polls', () => {
	afterAll(() => {
		httpServer.close()
	})

	describe('GET /polls', () => {
		it('should return 200 and poll information', async () => {
			// Arrange
			const getPollsSpy = jest
				.spyOn(getPollsClient, 'getTableData')
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				.mockReturnValueOnce(mockPollsApiResponse)
			// Act

			const { statusCode, body } = await supertest(httpServer).get('/polls')

			// Assert
			expect(statusCode).toBe(200)
			expect(body).toEqual(mockPollsApiResponse)
			expect(getPollsSpy).toHaveBeenCalledWith('polls-test')
		})
	})

	describe('GET /polls/:id', () => {
		describe('when the poll does not exist', () => {
			it('should return 404 and an error message', async () => {
				// Arrange
				const getPollsByIdSpy = jest
					.spyOn(getPollsClient, 'getItemData')
					.mockRejectedValueOnce(new NotFoundError('Poll not found'))
				const pollId = '123'

				// Act
				const { statusCode, body } = await supertest(httpServer).get(
					`/polls/${pollId}`,
				)

				// Assert
				expect(statusCode).toBe(404)
				expect(body).toEqual({
					status: 404,
					message: 'Error fetching poll data by id',
				})
				expect(getPollsByIdSpy).toHaveBeenCalledWith('polls-test', pollId)
			})
		})

		describe('when the poll exists', () => {
			it('should return 200 and poll information', async () => {
				// Arrange
				const getPollsByIdSpy = jest
					.spyOn(getPollsClient, 'getItemData')
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					.mockReturnValueOnce(mockPolls[0])
				const pollId = '456'

				// Act
				const { statusCode, body } = await supertest(httpServer).get(
					`/polls/${pollId}`,
				)

				// Assert
				expect(statusCode).toBe(200)
				expect(body).toEqual(mockPolls[0])
				expect(getPollsByIdSpy).toHaveBeenCalledWith('polls-test', pollId)
			})
		})
	})

	describe('POST /create-poll', () => {
		it('should return 201 and the created poll', async () => {
			// Arrange
			const createPollSpy = jest
				.spyOn(getPollsClient, 'createPoll')
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				.mockReturnValueOnce(createdPollMock)
			const poll = createPollMock

			// Act
			const { statusCode, body } = await supertest(httpServer)
				.post('/create-poll')
				.send(poll)

			// Assert
			expect(statusCode).toBe(201)
			expect(body).toEqual(createdPollMock)
			expect(createPollSpy).toHaveBeenCalledWith('polls-test', poll)
		})

		describe('when the poll is not created', () => {
			it('should return 400 and an error message', async () => {
				// Arrange
				const createPollSpy = jest
					.spyOn(getPollsClient, 'createPoll')
					.mockRejectedValueOnce(new Error('Error creating poll'))
				const poll = createPollMock

				// Act
				const { statusCode, body } = await supertest(httpServer)
					.post('/create-poll')
					.send(poll)

				// Assert
				expect(statusCode).toBe(400)
				expect(body).toEqual({
					status: 400,
					message: 'Error creating poll',
				})
				expect(createPollSpy).toHaveBeenCalledWith('polls-test', poll)
			})
		})

		describe('when the poll is missing required fields', () => {
			it('should return 400 and an error message', async () => {
				// Arrange
				const poll = {
					...createPollMock,
					question: undefined,
				}

				// Act
				const { statusCode, body } = await supertest(httpServer)
					.post('/create-poll')
					.send(poll)

				// Assert
				expect(statusCode).toBe(400)
				expect(body).toEqual({
					status: 400,
					message: '[{"message":"body.question is Question is required"}]',
				})
			})
		})

		describe('when the poll has less than two options', () => {
			it('should return 400 and an error message', async () => {
				// Arrange
				const poll = {
					...createPollMock,
					options: createPollMock.options.slice(0, 1),
				}

				// Act
				const { statusCode, body } = await supertest(httpServer)
					.post('/create-poll')
					.send(poll)

				// Assert
				expect(statusCode).toBe(400)
				expect(body).toEqual({
					status: 400,
					message:
						'[{"message":"body.options is At least two options are required"}]',
				})
			})
		})

		describe('when the poll has more than five options', () => {
			it('should return 400 and an error message', async () => {
				// Arrange
				const poll = {
					...createPollMock,
					options: [
						...createPollMock.options,
						{ id: '6', text: 'Kotlin' },
						{ id: '7', text: 'Go' },
					],
				}

				// Act
				const { statusCode, body } = await supertest(httpServer)
					.post('/create-poll')
					.send(poll)

				// Assert
				expect(statusCode).toBe(400)
				expect(body).toEqual({
					status: 400,
					message:
						'[{"message":"body.options is At most 5 options are allowed"}]',
				})
			})
		})
	})
})
