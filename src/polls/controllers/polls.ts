import {
	CreateTableCommand,
	CreateTableCommandInput,
	DescribeTableCommand,
	PutItemCommand,
	PutItemCommandInput,
	ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb'
import { ScanCommand, ScanCommandInput } from '@aws-sdk/lib-dynamodb'
import { Request, Response } from 'express'
import { v1 as uuidV1 } from 'uuid'
import { StatusCodes } from 'http-status-codes'

import { dynamoClient, dynamoDocClient, TABLE_NAME } from '../../db/dynamo'
import { CreatePoll } from '../models/polls.types'

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
		console.log(`[dynamo]: Table ${tableName} already exists`)
		return res
			.status(StatusCodes.CONFLICT)
			.json({ message: 'Table already exists' })
	} catch (error: unknown) {
		console.log(`[dynamo]: Table ${tableName} does not exist. Creating...`)

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
			console.log(`[dynamo]: Table ${tableName} created successfully`)
			return res
				.status(StatusCodes.CREATED)
				.json({ message: 'Table created successfully' })
		} else {
			console.error(`[dynamo]: Error creating table: ${error}`)
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
		const { question, options, votes } = req.body

		if (!question || !options) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: 'Missing required fields' })
		}

		const poll: CreatePoll = {
			question,
			options,
			votes,
		}

		const uuid = uuidV1()

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
			},
		}

		console.log(`[dynamo]: Creating poll: ${JSON.stringify(poll)}`)

		const result = await dynamoDocClient.send(new PutItemCommand(params))

		return res.status(StatusCodes.CREATED).json(result)
	} catch (error) {
		console.error(`[dynamo]: Error creating poll: ${error}`)
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: 'Error creating poll' })
	}
}
