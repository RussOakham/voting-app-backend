import {
  CreateTableCommand,
  CreateTableCommandInput,
  DescribeTableCommand,
  ResourceNotFoundException,
} from "@aws-sdk/client-dynamodb";
import {
  ScanCommand,
  ScanCommandInput,
  PutCommand,
  PutCommandInput,
} from "@aws-sdk/lib-dynamodb";

import { dynamoClient, dynamoDocClient, TABLE_NAME } from "../../db/dynamo";

import { Poll } from "../models/polls.types";

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
