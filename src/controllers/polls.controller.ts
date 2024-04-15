import {
	CreateTableCommand,
	CreateTableCommandInput,
	DescribeTableCommand,
	ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { dynamoClient, TABLE_NAME } from '../db/dynamo'
import { CreatePoll } from '../models/polls.types'
import {
	createPoll as createPollService,
	getItemData,
	getTableData,
	updatePollVotes,
} from '../services/polls.service'
import { BadRequestError, ConflictError, NotFoundError } from '../utils/errors'
import { pino } from '../utils/logger'

const { logger } = pino

// Programmatic function calls
export const checkOrCreateTable = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const { tableName } = req.body
	try {
		if (!tableName) {
			return next(new BadRequestError('Missing required fields'))
		}

		dynamoClient.send(new DescribeTableCommand({ TableName: tableName }))
		logger.warn(`[dynamo]: Table ${tableName} already exists`)
		return next(new ConflictError('Table already exists'))
	} catch (error: unknown) {
		logger.info(`[dynamo]: Table ${tableName} does not exist. Creating...`)

		if (error instanceof ResourceNotFoundException) {
			// Create table
			const createTableParams: CreateTableCommandInput = {
				TableName: tableName,
				KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
				AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
				ProvisionedThroughput: {
					ReadCapacityUnits: 1,
					WriteCapacityUnits: 1,
				},
			}

			dynamoClient.send(new CreateTableCommand(createTableParams))
			logger.info(`[dynamo]: Table ${tableName} created successfully`)
			return res
				.status(StatusCodes.CREATED)
				.json({ message: 'Table created successfully' })
		} else {
			logger.error(`[dynamo]: Error creating table: ${error}`)
			return next(new BadRequestError('Error creating table'))
		}
	}
}

export const getPolls = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const tableName = TABLE_NAME

		if (!tableName) {
			logger.warn('error thrown')
			return next(new BadRequestError('Missing required fields'))
		}

		const result = await getTableData(tableName)

		return res.status(StatusCodes.OK).json(result)
	} catch (error) {
		logger.error(`[dynamo]: Error getting table info: ${error}`)
		return next(new NotFoundError('Error fetching table data'))
	}
}

export const getPollById = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { pollId } = req.params

		if (!pollId) {
			console.log('error called')
			return next(new BadRequestError('Missing required fields'))
		}

		const response = await getItemData(TABLE_NAME, pollId)

		return res.status(StatusCodes.OK).json(response)
	} catch (error) {
		logger.error(`[dynamo]: Error getting poll by id: ${error}`)
		return next(new NotFoundError('Error fetching poll data by id'))
	}
}

export const createPoll = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { question, options, votes, createdBy } = req.body

		if (!question || !options) {
			let missingFields = ''
			if (!question) {
				missingFields += 'question, '
			}
			if (!options) {
				missingFields += 'options, '
			}

			return next(
				new BadRequestError(`Missing required fields: ${missingFields}`),
			)
		}

		const poll: CreatePoll = {
			question,
			options,
			votes,
			createdBy,
		}

		const result = await createPollService(TABLE_NAME, poll)

		return res.status(StatusCodes.CREATED).json(result)
	} catch (error: unknown) {
		logger.error(`[dynamo]: Error creating poll: ${error}`)
		return next(new BadRequestError('Error creating poll'))
	}
}

export const submitVote = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { pollId, votes, submittedVote } = req.body

		if (!pollId || !votes || !submittedVote) {
			let missingFields = ''
			if (!pollId) {
				missingFields += 'pollId, '
			}
			if (!votes) {
				missingFields += 'votes, '
			}
			if (!submittedVote) {
				missingFields += 'submittedVote, '
			}

			return next(
				new BadRequestError(`Missing required fields: ${missingFields}`),
			)
		}

		const result = await updatePollVotes(
			TABLE_NAME,
			pollId,
			votes,
			submittedVote,
		)

		return res.status(StatusCodes.OK).json(result)
	} catch (error: unknown) {
		logger.error(`[dynamo]: Error submitting vote: ${error}`)
		return next(new BadRequestError('Error submitting vote'))
	}
}
