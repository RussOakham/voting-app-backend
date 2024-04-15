import { StatusCodes } from 'http-status-codes'
import { CustomError } from './custom-error'

export class NotFoundError extends CustomError {
	StatusCode = StatusCodes.NOT_FOUND
	constructor(public message: string = 'Resource not found.') {
		super(message)
		Object.setPrototypeOf(this, NotFoundError.prototype)
	}
	serializeError(): {
		message: string
		status: number
		field?: string
	} {
		return { message: this.message, status: this.StatusCode }
	}
}
