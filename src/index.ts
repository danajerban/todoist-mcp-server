#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { TodoistApi } from "@doist/todoist-api-typescript";
import { CREATE_TASK_TOOL, GET_TASKS_TOOL, UPDATE_TASK_TOOL } from "./tools.js";

const server = new Server(
  {
    name: "todoist-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const TODOIST_API_TOKEN = process.env.TODOIST_API_TOKEN!;
if (!TODOIST_API_TOKEN) {
  console.error("Error: TODOIST_API_TOKEN environment variable is required");
  console.error(
    "Please set your Todoist API token in the environment variable TODOIST_API_TOKEN"
  );
  console.error(
    "You can find your API token at: Todoist Settings → Integrations → Developer"
  );
  process.exit(1);
}

const todoistClient = new TodoistApi(TODOIST_API_TOKEN);

function isCreateTaskArgs(args: unknown): args is {
  content: string;
  description?: string;
  due_string?: string;
  priority?: number;
  project_id?: string;
  section_id?: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "content" in args &&
    typeof (args as { content: string }).content === "string"
  );
}

function isGetTasksArgs(args: unknown): args is {
  project_id?: string;
  filter?: string;
  priority?: number;
  limit?: number;
  section_id?: string;
} {
  return typeof args === "object" && args !== null;
}

function isUpdateTaskArgs(args: unknown): args is {
  task_name: string;
  content?: string;
  description?: string;
  due_string?: string;
  priority?: number;
  project_id?: string;
  section_id?: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "task_name" in args &&
    typeof (args as { task_name: string }).task_name === "string"
  );
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [CREATE_TASK_TOOL, GET_TASKS_TOOL, UPDATE_TASK_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    if (!args) {
      throw new Error("No arguments provided");
    }

    if (name === "todoist_create_task") {
      if (!isCreateTaskArgs(args)) {
        throw new Error("Invalid arguments for todoist_create_task");
      }

      const task = await todoistClient.addTask({
        content: args.content,
        description: args.description,
        dueString: args.due_string,
        priority: args.priority,
        projectId: args.project_id,
        sectionId: args.section_id,
      });

      return {
        content: [
          {
            type: "text",
            text: `Task created:\nTitle: ${task.content}${
              task.description ? `\nDescription: ${task.description}` : ""
            }${task.due ? `\nDue: ${task.due.string}` : ""}${
              task.priority ? `\nPriority: ${task.priority}` : ""
            }`,
          },
        ],
        isError: false,
      };
    }

    if (name === "todoist_get_tasks") {
      if (!isGetTasksArgs(args)) {
        throw new Error("Invalid arguments for todoist_get_tasks");
      }

      const apiParams: any = {};
      if (args.project_id) {
        apiParams.projectId = args.project_id;
      }
      if (args.filter) {
        apiParams.filter = args.filter;
      }

      const tasks = await todoistClient.getTasks(
        Object.keys(apiParams).length > 0 ? apiParams : undefined
      );

      let filteredTasks = tasks;

      if (args.priority) {
        filteredTasks = filteredTasks.filter(
          (task) => task.priority === args.priority
        );
      }

      if (args.section_id) {
        filteredTasks = filteredTasks.filter(
          (task) => task.sectionId === args.section_id
        );
      }

      if (args.limit && args.limit > 0) {
        filteredTasks = filteredTasks.slice(0, args.limit);
      }

      const taskList = filteredTasks
        .map(
          (task) =>
            `- ${task.content}${
              task.description ? `\n  Description: ${task.description}` : ""
            }${task.due ? `\n  Due: ${task.due.string}` : ""}${
              task.priority ? `\n  Priority: ${task.priority}` : ""
            }`
        )
        .join("\n\n");

      return {
        content: [
          {
            type: "text",
            text:
              filteredTasks.length > 0
                ? taskList
                : "No tasks found matching the criteria",
          },
        ],
        isError: false,
      };
    }

    if (name === "todoist_update_task") {
      if (!isUpdateTaskArgs(args)) {
        throw new Error("Invalid arguments for todoist_update_task");
      }

      const tasks = await todoistClient.getTasks();
      const matchingTask = tasks.find((task) =>
        task.content.toLowerCase().includes(args.task_name.toLowerCase())
      );

      if (!matchingTask) {
        return {
          content: [
            {
              type: "text",
              text: `Could not find a task matching "${args.task_name}"`,
            },
          ],
          isError: true,
        };
      }

      const updateData: any = {};
      if (args.content) updateData.content = args.content;
      if (args.description) updateData.description = args.description;
      if (args.due_string) updateData.dueString = args.due_string;
      if (args.priority) updateData.priority = args.priority;
      if (args.project_id) updateData.projectId = args.project_id;
      if (args.section_id) updateData.sectionId = args.section_id;

      const updatedTask = await todoistClient.updateTask(
        matchingTask.id,
        updateData
      );

      return {
        content: [
          {
            type: "text",
            text: `Task "${matchingTask.content}" updated:\nNew Title: ${
              updatedTask.content
            }${
              updatedTask.description
                ? `\nNew Description: ${updatedTask.description}`
                : ""
            }${
              updatedTask.due ? `\nNew Due Date: ${updatedTask.due.string}` : ""
            }${
              updatedTask.priority
                ? `\nNew Priority: ${updatedTask.priority}`
                : ""
            }`,
          },
        ],
        isError: false,
      };
    }
    
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
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
      isError: true,
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Todoist MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});