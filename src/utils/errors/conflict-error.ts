import { StatusCodes } from 'http-status-codes'
import { CustomError } from './custom-error'

export class ConflictError extends CustomError {
	StatusCode = StatusCodes.CONFLICT
	constructor(public message: string = 'Item already exists in database.') {
		super(message)
		Object.setPrototypeOf(this, ConflictError.prototype)
	}
	serializeError(): {
		message: string
		status: number
		field?: string
	} {
		return { message: this.message, status: this.StatusCode }
	}
}
