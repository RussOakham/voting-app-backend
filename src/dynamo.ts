import {
  CreateTableCommand,
  CreateTableCommandInput,
  DynamoDBClient,
  DescribeTableCommand,
  ResourceNotFoundException,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  ScanCommandInput,
  PutCommand,
  PutCommandInput,
} from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";

import { Poll } from "./dynamo.types";

dotenv.config();

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_DEFAULT_REGION = process.env.AWS_DEFAULT_REGION;

const TABLE_NAME = "voting-app-api";

console.log(`[dynamo]: Access Key ID: ${accessKeyId}`);
console.log(`[dynamo]: Secret Access Key: ${secretAccessKey}`);
console.log(`[dynamo]: AWS Region: ${AWS_DEFAULT_REGION}`);

if (!accessKeyId || !secretAccessKey || !AWS_DEFAULT_REGION) {
  throw new Error(
    "[dynamo]: AWS credentials not found in environment variables"
  );
}

// Create DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

// Create DynamoDB Document client
const dynamoDocClient = DynamoDBDocumentClient.from(dynamoClient);

// Update for improved error handling:
// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/programming-with-javascript.html#programming-with-javascript-error-handling

// Programmatic function calls
const checkOrCreateTable = async (tableName: string) => {
  try {
    dynamoClient.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`[dynamo]: Table ${tableName} already exists`);
  } catch (error: unknown) {
    console.log(`[dynamo]: Table ${tableName} does not exist. Creating...`);

    if (error instanceof ResourceNotFoundException) {
      // Create table
      const createTableParams: CreateTableCommandInput = {
        TableName: tableName,
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      };

      dynamoClient.send(new CreateTableCommand(createTableParams));
      console.log(`[dynamo]: Table ${tableName} created successfully`);
    } else {
      throw error;
    }
  }
};

const getTableInfo = async (tableName: string) => {
  const params: ScanCommandInput = {
    TableName: tableName,
  };

  try {
    const table = await dynamoDocClient.send(new ScanCommand(params));

    return table;
  } catch (error) {
    console.error(`[dynamo]: Error getting table info: ${error}`);
    return null;
  }
};

const createPoll = async (poll: Poll) => {
  const params: PutCommandInput = {
    TableName: TABLE_NAME,
    Item: poll,
  };

  try {
    const result = await dynamoDocClient.send(new PutCommand(params));
    return result;
  } catch (error) {
    console.error(`[dynamo]: Error creating poll: ${error}`);
    return null;
  }
};
