import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const SECRET = process.env.AUTH_SECRET

if (!SECRET) {
	throw new Error('AUTH_SECRET environment variable not found')
}

export const random = () => crypto.randomBytes(128).toString('base64')
export const authentication = (salt: string, password: string) => {
	return crypto
		.createHmac('sha256', [salt, password].join('/'))
		.update(SECRET)
		.digest('hex')
}
