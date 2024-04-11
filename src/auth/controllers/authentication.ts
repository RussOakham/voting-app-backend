import {
	CognitoUserAttribute,
	CognitoUserPool,
	ICognitoUserAttributeData,
	ICognitoUserPoolData,
} from 'amazon-cognito-identity-js'
import dotenv from 'dotenv'

import { RegisterUser as RegisterUserInput } from '../models/authentication.types'
import { pino } from '../../utils/logger'

dotenv.config()

const cognitoClientId = process.env.AWS_COGNITO_CLIENT_ID
const userPoolId = process.env.AWS_USER_POOL_ID

const { logger } = pino

if (!cognitoClientId || !userPoolId) {
	throw new Error(
		'[cognito]: AWS Credentials not found in environment variables',
	)
}

const poolData: ICognitoUserPoolData = {
	ClientId: cognitoClientId,
	UserPoolId: userPoolId,
}

const userPool = new CognitoUserPool(poolData)

export const RegisterUser = (userInfo: RegisterUserInput) => {
	const attributeList = []

	const dataEmail: ICognitoUserAttributeData = {
		Name: 'email',
		Value: userInfo.email,
	}

	const dataPreferredUsername: ICognitoUserAttributeData = {
		Name: 'preferred_username',
		Value: userInfo.preferredUsername,
	}

	const attributeEmail = new CognitoUserAttribute(dataEmail)
	const attributePreferredUsername = new CognitoUserAttribute(
		dataPreferredUsername,
	)

	attributeList.push(attributeEmail)
	attributeList.push(attributePreferredUsername)

	userPool.signUp(
		userInfo.email,
		userInfo.password,
		attributeList,
		[],
		(err, result) => {
			if (err) {
				logger.error(`[cognito]: Error during signup ${err}`)
				return
			}

			if (!result) {
				logger.warn(`[cognito]: No result returned from signup`)
				return
			}

			const cognitoUser = result.user
			logger.info(`[cognito]: New username is ${cognitoUser.getUsername()}`)
		},
	)
}
