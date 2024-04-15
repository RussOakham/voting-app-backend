import { StatusCodes } from 'http-status-codes'

import { CustomError } from './custom-error'

export class BadRequestError extends CustomError {
	StatusCode = StatusCodes.BAD_REQUEST
	constructor(public message: string) {
		super(message)
		Object.setPrototypeOf(this, BadRequestError.prototype)
	}
	serializeError(): {
		message: string
		status: number
		field?: string
	} {
		return { message: this.message, status: this.StatusCode }
	}
}
