import {
	CreateTableCommand,
	CreateTableCommandInput,
	DescribeTableCommand,
	PutItemCommand,
	PutItemCommandInput,
	UpdateItemCommand,
	UpdateItemCommandInput,
	ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb'
import { ScanCommand, ScanCommandInput } from '@aws-sdk/lib-dynamodb'
import { Request, Response } from 'express'
import { v1 as uuidV1 } from 'uuid'
import { StatusCodes } from 'http-status-codes'

import { dynamoClient, dynamoDocClient, TABLE_NAME } from '../../db/dynamo'
import { Poll, SubmittedVote } from '../models/polls.types'
import { pino } from '../../utils/logger'
import { io } from '../../utils/socket'

const { logger } = pino

// Programmatic function calls
export const checkOrCreateTable = async (req: Request, res: Response) => {
	const { tableName } = req.body
	try {
		if (!tableName) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: 'Missing required fields ' })
		}

		dynamoClient.send(new DescribeTableCommand({ TableName: tableName }))
		logger.warn(`[dynamo]: Table ${tableName} already exists`)
		return res
			.status(StatusCodes.CONFLICT)
			.json({ message: 'Table already exists' })
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
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: 'Error creating table ' })
		}
	}
}

export const getPolls = async (req: Request, res: Response) => {
	try {
		const tableName = TABLE_NAME

		if (!tableName) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: 'Missing required fields' })
		}

		const params: ScanCommandInput = {
			TableName: tableName,
		}

		const result = await dynamoDocClient.send(new ScanCommand(params))

		return res.status(StatusCodes.OK).json(result)
	} catch (error) {
		console.error(`[dynamo]: Error getting table info: ${error}`)
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: 'Error fetching table data' })
	}
}

export const createPoll = async (req: Request, res: Response) => {
	try {
		const { question, options, votes, createdBy } = req.body

		if (!question || !options) {
			const missingFields = !question
				? 'question, '
				: '' + !options
					? 'options, '
					: ''

			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: `Missing required fields: ${missingFields}` })
		}

		// type check poll against Poll but without the id
		// this is because the id is generated in the function

		type PollWithoutId = Omit<Poll, 'id'>

		const poll: PollWithoutId = {
			question,
			options,
			votes,
			createdBy,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}

		const uuid = uuidV1()

		// TODO: Only create if the poll.id does not exist in db
		const params: PutItemCommandInput = {
			TableName: TABLE_NAME,
			Item: {
				id: { S: uuid },
				question: { S: poll.question },
				options: {
					L: poll.options.map((option) => ({
						M: {
							id: { S: option.id },
							text: { S: option.text },
						},
					})),
				},
				votes: {
					L: [],
				},
				createdBy: { S: poll.createdBy },
				createdAt: { S: poll.createdAt },
				updatedAt: { S: poll.updatedAt },
			},
		}

		const result = await dynamoDocClient.send(new PutItemCommand(params))

		logger.info(`[dynamo]: Created poll: ${JSON.stringify(poll)}`)

		// Create Type for this.
		io.getIo().emit('message', {
			key: 'polls',
			action: 'create',
			data: poll,
		})

		return res.status(StatusCodes.CREATED).json(result)
	} catch (error: unknown) {
		logger.error(`[dynamo]: Error creating poll: ${error}`)
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: 'Error creating poll' })
	}
}

export const submitVote = async (req: Request, res: Response) => {
	try {
		const { pollId, votes, submittedVote } = req.body

		if (!pollId || !votes || !submittedVote) {
			const missingFields = !pollId
				? 'pollId, '
				: '' + !votes
					? 'votes, '
					: '' + !submittedVote
						? 'submittedVote, '
						: ''

			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: `Missing required fields: ${missingFields}` })
		}

		// type check poll against Poll but without the id
		// this is because the id is generated in the function

		type PollUpdateVotes = Pick<Poll, 'id' | 'votes'>

		const pollUpdate: PollUpdateVotes = {
			id: pollId,
			votes,
		}

		const newVote: SubmittedVote = submittedVote

		pollUpdate.votes.push({
			id: uuidV1(),
			option: newVote.optionText,
			user: newVote.userId,
			createdAt: new Date().toISOString(),
		})

		// TODO: only update if the poll.id exists in db
		const params: UpdateItemCommandInput = {
			TableName: TABLE_NAME,
			Key: {
				id: { S: pollUpdate.id },
			},
			UpdateExpression: 'SET votes = :votes',
			ExpressionAttributeValues: {
				':votes': {
					L: pollUpdate.votes.map((vote) => ({
						M: {
							id: { S: vote.id },
							option: { S: vote.option },
							user: { S: vote.user },
							createdAt: { S: vote.createdAt },
						},
					})),
				},
			},
		}

		const result = await dynamoDocClient.send(new UpdateItemCommand(params))

		logger.info(`[dynamo]: Submitted vote: ${JSON.stringify(submittedVote)}`)

		io.getIo().emit('message', {
			key: 'polls',
			action: 'vote',
			data: pollUpdate,
		})

		return res.status(StatusCodes.OK).json(result)
	} catch (error: unknown) {
		console.error(`[dynamo]: Error submitting vote: ${error}`)
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: 'Error submitting vote' })
	}
}
