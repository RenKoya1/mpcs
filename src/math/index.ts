#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "math",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

function safeMathOperation(operation: string, a: number, b?: number): number {
  switch (operation) {
    case "add":
      return a + (b || 0);
    case "subtract":
      return a - (b || 0);
    case "multiply":
      return a * (b || 1);
    case "divide":
      if (b === 0) throw new Error("Division by zero is not allowed");
      return a / (b || 1);
    case "power":
      return Math.pow(a, b || 2);
    case "sqrt":
      if (a < 0)
        throw new Error("Cannot calculate square root of negative number");
      return Math.sqrt(a);
    case "abs":
      return Math.abs(a);
    case "round":
      return Math.round(a);
    case "floor":
      return Math.floor(a);
    case "ceil":
      return Math.ceil(a);
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "calculate",
        description: "Perform basic mathematical calculations",
        inputSchema: {
          type: "object",
          properties: {
            operation: {
              type: "string",
              enum: [
                "add",
                "subtract",
                "multiply",
                "divide",
                "power",
                "sqrt",
                "abs",
                "round",
                "floor",
                "ceil",
              ],
              description: "The mathematical operation to perform",
            },
            a: {
              type: "number",
              description: "First number",
            },
            b: {
              type: "number",
              description: "Second number (optional for some operations)",
            },
          },
          required: ["operation", "a"],
        },
      },
      {
        name: "factorial",
        description: "Calculate factorial of a number",
        inputSchema: {
          type: "object",
          properties: {
            n: {
              type: "number",
              description:
                "Number to calculate factorial for (must be non-negative integer)",
            },
          },
          required: ["n"],
        },
      },
      {
        name: "fibonacci",
        description: "Generate Fibonacci sequence up to n terms",
        inputSchema: {
          type: "object",
          properties: {
            n: {
              type: "number",
              description: "Number of terms in Fibonacci sequence (max 50)",
            },
          },
          required: ["n"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (request.params.name === "calculate") {
      const { operation, a, b } = request.params.arguments as {
        operation: string;
        a: number;
        b?: number;
      };

      const result = safeMathOperation(operation, a, b);

      return {
        content: [
          {
            type: "text",
            text: `Result: ${a} ${operation} ${
              b !== undefined ? b : ""
            } = ${result}`,
          },
        ],
      };
    }

    if (request.params.name === "factorial") {
      const { n } = request.params.arguments as { n: number };

      if (n < 0 || !Number.isInteger(n)) {
        throw new Error("Factorial is only defined for non-negative integers");
      }

      if (n > 20) {
        throw new Error(
          "Factorial calculation limited to n <= 20 to prevent overflow"
        );
      }

      let result = 1;
      for (let i = 2; i <= n; i++) {
        result *= i;
      }

      return {
        content: [
          {
            type: "text",
            text: `Factorial of ${n} = ${result}`,
          },
        ],
      };
    }

    if (request.params.name === "fibonacci") {
      const { n } = request.params.arguments as { n: number };

      if (n <= 0 || !Number.isInteger(n)) {
        throw new Error("Number of terms must be a positive integer");
      }

      if (n > 50) {
        throw new Error(
          "Fibonacci sequence limited to 50 terms to prevent performance issues"
        );
      }

      const sequence: number[] = [];
      if (n >= 1) sequence.push(0);
      if (n >= 2) sequence.push(1);

      for (let i = 2; i < n; i++) {
        sequence.push(sequence[i - 1] + sequence[i - 2]);
      }

      return {
        content: [
          {
            type: "text",
            text: `Fibonacci sequence (${n} terms): ${sequence.join(", ")}`,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${request.params.name}`);
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
});

export async function startMathServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Math MCP Server running on stdio");
}
