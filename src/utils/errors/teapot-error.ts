import { StatusCodes } from 'http-status-codes'
import { CustomError } from './custom-error'

export class TeapotError extends CustomError {
	StatusCode = StatusCodes.IM_A_TEAPOT
	constructor(public message: string = 'Database error. Try again later.') {
		super(message)
		Object.setPrototypeOf(this, TeapotError.prototype)
	}
	serializeError(): {
		message: string
		status: number
		field?: string
	} {
		return { message: this.message, status: this.StatusCode }
	}
}
