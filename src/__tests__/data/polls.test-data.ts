import { ScanCommandOutput } from '@aws-sdk/lib-dynamodb'
import { CreatePoll, Poll } from 'models/polls.types'

export const mockPolls: Poll[] = [
	{
		id: '123',
		question: 'What is your favorite programming language?',
		options: [
			{
				id: '1',
				text: 'Python',
			},
			{
				id: '2',
				text: 'JavaScript',
			},
			{
				id: '3',
				text: 'TypeScript',
			},
			{
				id: '4',
				text: 'Java',
			},
		],
		votes: [
			{
				id: '1',
				option: '1',
				user: '123',
				createdAt: '2024-04-15T15:04:49.679Z',
			},
		],
		createdAt: '2024-04-15T15:04:49.679Z',
		updatedAt: '2024-04-15T15:04:49.679Z',
		createdBy: 'John Doe',
	},
]

export const mockPollsApiResponse: ScanCommandOutput = {
	$metadata: {},
	Items: mockPolls,
	Count: mockPolls.length,
	ScannedCount: mockPolls.length,
}

export const createPollMock: CreatePoll = {
	question: 'What is your favorite car brand?',
	options: [
		{
			id: '1',
			text: 'Toyota',
		},
		{
			id: '2',
			text: 'Ford',
		},
		{
			id: '3',
			text: 'Chevrolet',
		},
		{
			id: '4',
			text: 'Honda',
		},
	],
	votes: [],
	createdBy: 'Jane Doe',
}

export const createdPollMock: Poll = {
	...createPollMock,
	id: '123',
	createdAt: '2024-04-15T15:04:49.679Z',
	updatedAt: '2024-04-15T15:04:49.679Z',
}
