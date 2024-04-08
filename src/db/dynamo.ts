import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import dotenv from "dotenv";

dotenv.config();

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_DEFAULT_REGION = process.env.AWS_DEFAULT_REGION;

export const TABLE_NAME = "voting-app-api";

console.log(`[dynamo]: Access Key ID: ${accessKeyId}`);
console.log(`[dynamo]: Secret Access Key: ${secretAccessKey}`);
console.log(`[dynamo]: AWS Region: ${AWS_DEFAULT_REGION}`);

if (!accessKeyId || !secretAccessKey || !AWS_DEFAULT_REGION) {
  throw new Error(
    "[dynamo]: AWS credentials not found in environment variables"
  );
}

// Create DynamoDB client
export const dynamoClient = new DynamoDBClient({
  region: AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

// Create DynamoDB Document client
export const dynamoDocClient = DynamoDBDocumentClient.from(dynamoClient);

// Update for improved error handling:
// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/programming-with-javascript.html#programming-with-javascript-error-handling
