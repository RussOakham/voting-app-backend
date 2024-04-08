import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import dotenv from "dotenv";

dotenv.config();

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_DEFAULT_REGION = process.env.AWS_DEFAULT_REGION;

export const TABLE_NAME = "voting-app-api";

if (!accessKeyId || !secretAccessKey || !AWS_DEFAULT_REGION) {
  throw new Error(
    "[dynamo]: AWS credentials not found in environment variables"
  );
}

export interface MarshallOptions {
  removeUndefinedValues?: boolean;
  convertClassInstanceToMap?: boolean;
}

const marshallOptions: MarshallOptions = {
  removeUndefinedValues: true,
  convertClassInstanceToMap: true,
};

const translateConfig = { marshallOptions };

// Create DynamoDB client
export const dynamoClient = new DynamoDBClient({
  region: AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

// Create DynamoDB Document client
export const dynamoDocClient = DynamoDBDocumentClient.from(
  dynamoClient,
  translateConfig
);

// Update for improved error handling:
// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/programming-with-javascript.html#programming-with-javascript-error-handling
