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
} from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";

dotenv.config();

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_DEFAULT_REGION = process.env.AWS_DEFAULT_REGION;

const TABLE_NAME = "voting-app-api";

console.log(`[dynamo]: Access Key ID: ${accessKeyId}`);
console.log(`[dynamo]: Secret Access Key: ${secretAccessKey}`);
console.log(`[dynamo]: AWS Region: ${AWS_DEFAULT_REGION}`);

if (!accessKeyId || !secretAccessKey || !AWS_DEFAULT_REGION) {
  throw new Error("AWS credentials not found in environment variables");
}

const dynamoClient = new DynamoDBClient({
  region: AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const dynamoDocClient = DynamoDBDocumentClient.from(dynamoClient);

const checkOrCreateTable = async () => {
  try {
    dynamoClient.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    console.log(`[dynamo]: Table ${TABLE_NAME} already exists`);
  } catch (error: unknown) {
    console.log(`[dynamo]: Table ${TABLE_NAME} does not exist. Creating...`);

    if (error instanceof ResourceNotFoundException) {
      // Create table
      const createTableParams: CreateTableCommandInput = {
        TableName: TABLE_NAME,
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      };

      dynamoClient.send(new CreateTableCommand(createTableParams));
      console.log(`[dynamo]: Table ${TABLE_NAME} created successfully`);
    } else {
      throw error;
    }
  }
};

const getTableInfo = async () => {
  const params: ScanCommandInput = {
    TableName: TABLE_NAME,
  };

  try {
    const table = await dynamoDocClient.send(new ScanCommand(params));

    return table;
  } catch (error) {
    console.error(`[dynamo]: Error getting table info: ${error}`);
    return null;
  }
};
