import supertest from 'supertest'

import createServer from '../utils/server'

const app = createServer()

describe('Polls', () => {
	describe('GET /poll/:id', () => {
		describe('given the product does not exists', () => {
			it('should return 404', async () => {
				// Arrange
				const pollId = '123'

				// Act
				await supertest(app).get(`/poll/${pollId}`).expect(404)

				// Assert
				expect(true).toBe(true)
			})
		})
	})
})
