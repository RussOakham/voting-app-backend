import type {} from 'express'
import { Server as ServerType } from 'http'
import { Server } from 'socket.io'

let ioServer: Server

export interface SocketPayload {
	id?: string
	key: string
	action: string
	data: unknown
}

export const io = {
	init: (httpSever: ServerType) => {
		ioServer = new Server(httpSever, {
			cors: {
				credentials: true,
			},
		})

		return ioServer
	},
	getIo: () => {
		if (!ioServer) {
			throw new Error('Socket IO is not initialised')
		}

		return ioServer
	},
}
