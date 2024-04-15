import { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { CustomError } from '../errors/custom-error'

export const errorHandler: ErrorRequestHandler = (
	error: Error,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	// Error handling logic
	if (error instanceof CustomError) {
		return res.status(error.StatusCode).json(error.serializeError())
	}

	return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
		message: 'Something went wrong',
		status: StatusCodes.INTERNAL_SERVER_ERROR,
	})
}
