import { RDSDataClient, ExecuteStatementCommand } from "@aws-sdk/client-rds-data";

// Aurora Serverless Data API configuration
const config = {
  region: process.env.AURORA_REGION || "us-east-1",
};

const client = new RDSDataClient(config);

const resourceArn = process.env.AURORA_CLUSTER_ARN;
const secretArn = process.env.AURORA_SECRET_ARN;
const database = process.env.AURORA_DATABASE || "postgres";

/**
 * Sleep helper for retry delays
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Execute a SQL statement using Aurora Data API
 * Includes retry logic for when Aurora Serverless is resuming from pause
 * @param {string} sql - The SQL query to execute
 * @param {Array} parameters - Array of parameter objects with name, value, and typeHint
 * @returns {Promise<Object>} Query result with rows
 */
export async function executeStatement(sql, parameters = []) {
  // Debug: check if AWS credentials are present at runtime
  console.log("AWS creds present:", !!process.env.AWS_ACCESS_KEY_ID, !!process.env.AWS_SECRET_ACCESS_KEY);

  const command = new ExecuteStatementCommand({
    resourceArn,
    secretArn,
    database,
    sql,
    parameters,
    includeResultMetadata: true,
  });

  const maxRetries = 5;
  const baseDelay = 3000; // 3 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.send(command);
      return transformResponse(response);
    } catch (error) {
      // Retry if Aurora is resuming from auto-pause
      if (error.name === "DatabaseResumingException" && attempt < maxRetries) {
        console.log(`Aurora is resuming... retry ${attempt}/${maxRetries} in ${baseDelay * attempt}ms`);
        await sleep(baseDelay * attempt);
        continue;
      }
      console.error("Aurora Data API Error:", error);
      throw error;
    }
  }
}

/**
 * Transform Data API response to match pg pool format
 * Converts the columnar format to row objects
 */
function transformResponse(response) {
  if (!response.records || !response.columnMetadata) {
    return { rows: [] };
  }

  const columns = response.columnMetadata.map((col) => col.name);

  const rows = response.records.map((record) => {
    const row = {};
    record.forEach((field, index) => {
      const columnName = columns[index];
      row[columnName] = extractValue(field);
    });
    return row;
  });

  return { rows };
}

/**
 * Extract the actual value from a Data API field object
 * Data API returns values in typed wrappers like { stringValue: "..." }
 */
function extractValue(field) {
  if (field.isNull) return null;
  if (field.stringValue !== undefined) return field.stringValue;
  if (field.longValue !== undefined) return field.longValue;
  if (field.doubleValue !== undefined) return field.doubleValue;
  if (field.booleanValue !== undefined) return field.booleanValue;
  if (field.blobValue !== undefined) return field.blobValue;
  if (field.arrayValue !== undefined) {
    // Handle array types (PostgreSQL arrays)
    const arr = field.arrayValue;
    if (arr.stringValues) return arr.stringValues;
    if (arr.longValues) return arr.longValues;
    if (arr.doubleValues) return arr.doubleValues;
    if (arr.booleanValues) return arr.booleanValues;
    // For nested arrays, recursively extract
    if (arr.arrayValues) return arr.arrayValues.map(extractValue);
  }
  return null;
}

/**
 * Check if a string represents a valid integer
 */
function isNumericString(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed === "") return false;
  return /^-?\d+$/.test(trimmed);
}

/**
 * Convert positional parameters ($1, $2) to named parameters (:param1, :param2)
 * Aurora Data API uses named parameters instead of positional
 * Also handles type coercion for numeric strings (common from URL params)
 */
export function convertToNamedParams(sql, values = []) {
  let convertedSql = sql;
  const parameters = [];

  values.forEach((value, index) => {
    const paramName = `param${index + 1}`;
    const placeholder = `$${index + 1}`;

    // Replace $1, $2, etc. with :param1, :param2, etc.
    convertedSql = convertedSql.replace(
      new RegExp(`\\$${index + 1}(?![0-9])`, 'g'),
      `:${paramName}`
    );

    // Determine the parameter type
    const param = { name: paramName };

    if (value === null || value === undefined) {
      param.value = { isNull: true };
    } else if (typeof value === "number") {
      if (Number.isInteger(value)) {
        param.value = { longValue: value };
      } else {
        param.value = { doubleValue: value };
      }
    } else if (typeof value === "boolean") {
      param.value = { booleanValue: value };
    } else if (Array.isArray(value)) {
      // Handle arrays (for PostgreSQL array types)
      if (value.every(v => typeof v === "number" && Number.isInteger(v))) {
        param.value = { arrayValue: { longValues: value } };
      } else if (value.every(v => typeof v === "number")) {
        param.value = { arrayValue: { doubleValues: value } };
      } else {
        param.value = { arrayValue: { stringValues: value.map(String) } };
      }
    } else if (isNumericString(value)) {
      // Convert numeric strings to longValue (common from URL params)
      param.value = { longValue: parseInt(value, 10) };
    } else {
      param.value = { stringValue: String(value) };
    }

    parameters.push(param);
  });

  return { sql: convertedSql, parameters };
}

/**
 * Query helper that mimics pg pool.query() interface
 * Allows easier migration from pg to Data API
 */
export async function query(sql, values = []) {
  const { sql: convertedSql, parameters } = convertToNamedParams(sql, values);
  return executeStatement(convertedSql, parameters);
}

// Export a pool-like interface for compatibility
const auroraPool = {
  query,
};

export default auroraPool;
