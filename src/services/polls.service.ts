import {
	GetItemCommand,
	GetItemCommandInput,
	PutItemCommand,
	PutItemCommandInput,
} from '@aws-sdk/client-dynamodb'
import { ScanCommand, ScanCommandInput } from '@aws-sdk/lib-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { PollWithoutId } from 'models/polls.types'
import { v1 as uuidV1 } from 'uuid'

import { dynamoDocClient } from '../db/dynamo'
import { pino } from '../utils/logger'
import { io, SocketPayload } from '../utils/socket'

const { logger } = pino

export const getTableData = async (tableName: string) => {
	try {
		const params: ScanCommandInput = {
			TableName: tableName,
		}

		const result = await dynamoDocClient.send(new ScanCommand(params))

		return result
	} catch (error) {
		throw new Error(`Error getting table data: ${error}`)
	}
}

export const getItemData = async (tableName: string, itemId: string) => {
	try {
		const params: GetItemCommandInput = {
			TableName: tableName,
			Key: marshall({ id: itemId }),
		}

		const result = await dynamoDocClient.send(new GetItemCommand(params))

		if (!result.Item) {
			throw new Error('Item not found')
		}

		const poll = unmarshall(result.Item)

		return poll
	} catch (error) {
		throw new Error(`Error getting item data: ${error}`)
	}
}

export const createPoll = async (
	tableName: string,
	data: Omit<PollWithoutId, 'createdAt' | 'updatedAt'>,
) => {
	try {
		const poll: PollWithoutId = {
			...data,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}

		const uuid = uuidV1()

		const params: PutItemCommandInput = {
			TableName: tableName,
			Item: marshall({ id: uuid, ...poll }),
			ConditionExpression: 'attribute_not_exists(id)',
		}

		const result = await dynamoDocClient.send(new PutItemCommand(params))

		logger.info(`[dynamo]: Created poll: ${JSON.stringify(poll)}`)

		const socketPayload: SocketPayload = {
			key: 'polls',
			action: 'create',
			data: poll,
		}

		io.getIo().emit('message', socketPayload)

		return result
	} catch (error) {
		throw new Error(`Error creating item: ${error}`)
	}
}
