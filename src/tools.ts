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

export const UPDATE_TASK_TOOL: Tool = {
  name: "todoist_update_task",
  description:
    "Update an existing task in Todoist by searching for it by name and then updating it",
  inputSchema: {
    type: "object",
    properties: {
      task_name: {
        type: "string",
        description: "Name/content of the task to search for and update",
      },
      content: {
        type: "string",
        description: "New content/title for the task (optional)",
      },
      description: {
        type: "string",
        description: "New description for the task (optional)",
      },
      due_string: {
        type: "string",
        description:
          "New due date in natural language like 'tomorrow', 'next Monday' (optional)",
      },
      priority: {
        type: "number",
        description:
          "New priority level from 1 (normal) to 4 (urgent) (optional)",
        enum: [1, 2, 3, 4],
      },
      project_id: {
        type: "string",
        description: "Move task to a different project (optional)",
      },
      section_id: {
        type: "string",
        description: "Move task to a different section (optional)",
      },
    },
    required: ["task_name"],
  },
};

export const DELETE_TASK_TOOL: Tool = {
  name: "todoist_delete_task",
  description: "Delete a task from Todoist by searching for it by name",
  inputSchema: {
    type: "object",
    properties: {
      task_name: {
        type: "string",
        description: "Name/content of the task to search for and delete",
      },
    },
    required: ["task_name"],
  },
};

export const COMPLETE_TASK_TOOL: Tool = {
  name: "todoist_complete_task",
  description: "Mark a task as complete by searching for it by name",
  inputSchema: {
    type: "object",
    properties: {
      task_name: {
        type: "string",
        description: "Name/content of the task to search for and complete",
      },
    },
    required: ["task_name"],
  },
};

export const GET_PROJECTS_TOOL: Tool = {
  name: "todoist_get_projects",
  description: "Get a list of all projects from Todoist",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of projects to return (optional)",
        default: 50,
      },
    },
  },
};

export const CREATE_PROJECT_TOOL: Tool = {
  name: "todoist_create_project",
  description: "Create a new project in Todoist",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The name of the project",
      },
      color: {
        type: "string",
        description: "Project color (optional)",
      },
      parent_id: {
        type: "string",
        description: "ID of parent project for sub-projects (optional)",
      },
    },
    required: ["name"],
  },
};

export const UPDATE_PROJECT_TOOL: Tool = {
  name: "todoist_update_project",
  description: "Update an existing project by searching for it by name",
  inputSchema: {
    type: "object",
    properties: {
      project_name: {
        type: "string",
        description: "Name of the project to search for and update",
      },
      name: {
        type: "string",
        description: "New name for the project (optional)",
      },
      color: {
        type: "string",
        description: "New color for the project (optional)",
      },
    },
    required: ["project_name"],
  },
};

export const DELETE_PROJECT_TOOL: Tool = {
  name: "todoist_delete_project",
  description: "Delete a project by searching for it by name",
  inputSchema: {
    type: "object",
    properties: {
      project_name: {
        type: "string",
        description: "Name of the project to search for and delete",
      },
    },
    required: ["project_name"],
  },
};

export const GET_SECTIONS_TOOL: Tool = {
  name: "todoist_get_sections",
  description: "Get sections from a specific project",
  inputSchema: {
    type: "object",
    properties: {
      project_name: {
        type: "string",
        description: "Name of the project to get sections from",
      },
      limit: {
        type: "number",
        description: "Maximum number of sections to return (optional)",
        default: 50,
      },
    },
    required: ["project_name"],
  },
};

export const CREATE_SECTION_TOOL: Tool = {
  name: "todoist_create_section",
  description: "Create a new section in a project",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The name of the section",
      },
      project_name: {
        type: "string",
        description: "Name of the project to add the section to",
      },
      order: {
        type: "number",
        description: "Order of the section within the project (optional)",
      },
    },
    required: ["name", "project_name"],
  },
};

export const UPDATE_SECTION_TOOL: Tool = {
  name: "todoist_update_section",
  description: "Update an existing section by searching for it by name",
  inputSchema: {
    type: "object",
    properties: {
      section_name: {
        type: "string",
        description: "Name of the section to search for and update",
      },
      project_name: {
        type: "string",
        description: "Name of the project containing the section",
      },
      name: {
        type: "string",
        description: "New name for the section (optional)",
      },
    },
    required: ["section_name", "project_name"],
  },
};

export const DELETE_SECTION_TOOL: Tool = {
  name: "todoist_delete_section",
  description: "Delete a section by searching for it by name",
  inputSchema: {
    type: "object",
    properties: {
      section_name: {
        type: "string",
        description: "Name of the section to search for and delete",
      },
      project_name: {
        type: "string",
        description: "Name of the project containing the section",
      },
    },
    required: ["section_name", "project_name"],
  },
};