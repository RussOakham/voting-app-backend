export abstract class CustomError extends Error {
	constructor(public message: string) {
		super(message)
		Object.setPrototypeOf(this, CustomError.prototype)
	}

	abstract StatusCode: number
	abstract serializeError(): {
		message: string
		status: number
		field?: string
	}
}
