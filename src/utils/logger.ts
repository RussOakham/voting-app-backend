import pinoLogger from 'pino-http'

export const pino = pinoLogger({
	transport: {
		target: 'pino-pretty',
	},
})
