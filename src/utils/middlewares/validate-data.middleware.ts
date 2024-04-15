/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express'
import { AnyZodObject, ZodError } from 'zod'

import { pino } from '../logger'
import { BadRequestError, TeapotError } from '../errors'

const { logger } = pino

export const validateData =
	(schema: AnyZodObject) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync({
				body: req.body,
				params: req.params,
				query: req.query,
			})
			return next()
		} catch (error) {
			if (error instanceof ZodError) {
				const errorMessages = error.errors.map((issue) => ({
					message: `${issue.path.join('.')} is ${issue.message}`,
				}))
				logger.error(
					`[middleware-validation]: Error Invalid Data: ${JSON.stringify(errorMessages)}`,
				)
				return next(new BadRequestError(JSON.stringify(errorMessages)))
			} else {
				logger.error(`[middleware-validation]: Internal Server Error`)
				return next(new TeapotError())
			}
		}
	}
