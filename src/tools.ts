import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const CREATE_TASK_TOOL: Tool = {
  name: "todoist_create_task",
  description:
    "Create a new task in Todoist with optional description, due date, and priority",
  inputSchema: {
    type: "object",
    properties: {
      content: {
        type: "string",
        description: "The content/title of the task",
      },
      description: {
        type: "string",
        description: "Detailed description of the task (optional)",
      },
      due_string: {
        type: "string",
        description:
          "Natural language due date like 'tomorrow', 'next Monday', 'Jan 23' (optional)",
      },
      priority: {
        type: "number",
        description: "Task priority from 1 (normal) to 4 (urgent) (optional)",
        enum: [1, 2, 3, 4],
      },
      project_id: {
        type: "string",
        description: "ID of the project to add the task to (optional)",
      },
      section_id: {
        type: "string",
        description: "ID of the section to add the task to (optional)",
      },
    },
    required: ["content"],
  },
};

export const GET_TASKS_TOOL: Tool = {
  name: "todoist_get_tasks",
  description: "Get a list of tasks from Todoist with various filters",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "Filter tasks by project ID (optional)",
      },
      filter: {
        type: "string",
        description:
          "Natural language filter like 'today', 'tomorrow', 'next week', 'priority 1', 'overdue' (optional)",
      },
      priority: {
        type: "number",
        description: "Filter by priority level (1-4) (optional)",
        enum: [1, 2, 3, 4],
      },
      limit: {
        type: "number",
        description: "Maximum number of tasks to return (optional)",
        default: 10,
      },
      section_id: {
        type: "string",
        description: "Filter tasks by section ID (optional)",
      },
    },
  },
};