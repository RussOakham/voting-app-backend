/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express'
import { AnyZodObject, ZodError } from 'zod'
import { StatusCodes } from 'http-status-codes'

export const validateData =
	(schema: AnyZodObject) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync({
				body: req.body,
				query: req.query,
				params: req.params,
			})
			return next()
		} catch (error) {
			if (error instanceof ZodError) {
				const errorMessages = error.errors.map((issue) => ({
					message: `${issue.path.join('.')} is ${issue.message}`,
				}))
				res
					.status(StatusCodes.BAD_REQUEST)
					.json({ error: 'Invalid data', details: errorMessages })
				console.error(
					`[middleware-validation]: Error Invalid Data: ${errorMessages}`,
				)
			} else {
				res
					.status(StatusCodes.INTERNAL_SERVER_ERROR)
					.json({ error: 'Internal Server Error' })
				console.error(`[middleware-validation]: Internal Server Error`)
			}
		}
	}
