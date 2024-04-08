/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express'
import { AnyZodObject, z } from 'zod'

// const validate =
//   (schema: AnyZodObject) =>
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       await schema.parseAsync({
//         body: req.body,
//         query: req.query,
//         params: req.params,
//       });
//       return next();
//     } catch (error) {
//       return res.status(400).json(error);
//     }
//   };

const validate =
	<T extends z.ZodTypeAny>(schema: T) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync({
				body: req.body,
				query: req.query,
				params: req.params,
			})
			return next()
		} catch (error) {
			return res.status(400).json(error)
		}
	}

const parse = <T extends z.ZodTypeAny>(
	schema: T,
	data: unknown,
): z.infer<T> => {
	try {
		return schema.parse(data)
	} catch (error: unknown) {
		const e = error as z.ZodError
		throw new Error(`Parsing Error: ${JSON.stringify(e.errors)}`)
	}
}
