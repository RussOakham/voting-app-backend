import { StatusCodes } from 'http-status-codes'
import { CustomError } from './custom-error'

export class DatabaseError extends CustomError {
	StatusCode = StatusCodes.INTERNAL_SERVER_ERROR
	constructor(public message: string = 'Database error. Try again later.') {
		super(message)
		Object.setPrototypeOf(this, DatabaseError.prototype)
	}
	serializeError(): {
		message: string
		status: number
		field?: string
	} {
		return { message: this.message, status: this.StatusCode }
	}
}
