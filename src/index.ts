#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { TodoistApi } from "@doist/todoist-api-typescript";
import { 
  CREATE_TASK_TOOL, 
  GET_TASKS_TOOL, 
  UPDATE_TASK_TOOL, 
  DELETE_TASK_TOOL, 
  COMPLETE_TASK_TOOL,
  GET_PROJECTS_TOOL,
  CREATE_PROJECT_TOOL,
  UPDATE_PROJECT_TOOL,
  DELETE_PROJECT_TOOL,
  GET_SECTIONS_TOOL,
  CREATE_SECTION_TOOL,
  UPDATE_SECTION_TOOL,
  DELETE_SECTION_TOOL
} from "./tools.js";
import {
  isCreateTaskArgs,
  isGetTasksArgs,
  isUpdateTaskArgs,
  isDeleteTaskArgs,
  isCompleteTaskArgs,
  isGetProjectsArgs,
  isCreateProjectArgs,
  isUpdateProjectArgs,
  isDeleteProjectArgs,
  isGetSectionsArgs,
  isCreateSectionArgs,
  isUpdateSectionArgs,
  isDeleteSectionArgs,
} from "./types.js";

// Server implementation

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

// Check for API token
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

// Initialize Todoist client
const todoistClient = new TodoistApi(TODOIST_API_TOKEN);

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [CREATE_TASK_TOOL, GET_TASKS_TOOL, UPDATE_TASK_TOOL, DELETE_TASK_TOOL, COMPLETE_TASK_TOOL, GET_PROJECTS_TOOL, CREATE_PROJECT_TOOL, UPDATE_PROJECT_TOOL, DELETE_PROJECT_TOOL, GET_SECTIONS_TOOL, CREATE_SECTION_TOOL, UPDATE_SECTION_TOOL, DELETE_SECTION_TOOL],
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

    if (name === "todoist_delete_task") {
      if (!isDeleteTaskArgs(args)) {
        throw new Error("Invalid arguments for todoist_delete_task");
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

      await todoistClient.deleteTask(matchingTask.id);

      return {
        content: [
          {
            type: "text",
            text: `Successfully deleted task: "${matchingTask.content}"`,
          },
        ],
        isError: false,
      };
    }

    if (name === "todoist_complete_task") {
      if (!isCompleteTaskArgs(args)) {
        throw new Error("Invalid arguments for todoist_complete_task");
      }

      // First, search for the task
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

      // Complete the task
      await todoistClient.closeTask(matchingTask.id);

      return {
        content: [
          {
            type: "text",
            text: `Successfully completed task: "${matchingTask.content}"`,
          },
        ],
        isError: false,
      };
    }

    if (name === "todoist_get_projects") {
      if (!isGetProjectsArgs(args)) {
        throw new Error("Invalid arguments for todoist_get_projects");
      }

      // Fetch projects from Todoist API
      const projects = await todoistClient.getProjects();

      // Apply limit if specified
      const limitedProjects = args.limit
        ? projects.slice(0, args.limit)
        : projects;

      // Format projects for display
      const projectList = limitedProjects
        .map(
          (project: any) =>
            `- **${project.name}** (ID: ${project.id})${
              project.color ? `\n  Color: ${project.color}` : ""
            }${project.parentId ? `\n  Parent: ${project.parentId}` : ""}`
        )
        .join("\n\n");

      return {
        content: [
          {
            type: "text",
            text:
              limitedProjects.length > 0
                ? `Projects:\n\n${projectList}`
                : "No projects found",
          },
        ],
        isError: false,
      };
    }

    if (name === "todoist_create_project") {
      if (!isCreateProjectArgs(args)) {
        throw new Error("Invalid arguments for todoist_create_project");
      }

      // Create the project using Todoist API
      const project = await todoistClient.addProject({
        name: args.name,
        color: args.color,
        parentId: args.parent_id,
      });

      return {
        content: [
          {
            type: "text",
            text: `Project created:\nName: ${project.name}\nID: ${project.id}${
              project.color ? `\nColor: ${project.color}` : ""
            }${project.parentId ? `\nParent: ${project.parentId}` : ""}`,
          },
        ],
        isError: false,
      };
    }

    if (name === "todoist_update_project") {
      if (!isUpdateProjectArgs(args)) {
        throw new Error("Invalid arguments for todoist_update_project");
      }

      // First, search for the project using partial name matching
      const projects = await todoistClient.getProjects();
      const matchingProject = projects.find((project: any) =>
        project.name.toLowerCase().includes(args.project_name.toLowerCase())
      );

      if (!matchingProject) {
        return {
          content: [
            {
              type: "text",
              text: `Could not find a project matching "${args.project_name}"`,
            },
          ],
          isError: true,
        };
      }

      // Build update data object with only the fields that are provided
      const updateData: any = {};
      if (args.name) updateData.name = args.name;
      if (args.color) updateData.color = args.color;

      // Update the project using Todoist API
      const updatedProject = await todoistClient.updateProject(
        matchingProject.id,
        updateData
      );

      return {
        content: [
          {
            type: "text",
            text: `Project "${matchingProject.name}" updated:\nNew Name: ${
              updatedProject.name
            }\nID: ${updatedProject.id}${
              updatedProject.color ? `\nColor: ${updatedProject.color}` : ""
            }`,
          },
        ],
        isError: false,
      };
    }

    if (name === "todoist_delete_project") {
      if (!isDeleteProjectArgs(args)) {
        throw new Error("Invalid arguments for todoist_delete_project");
      }

      // First, search for the project using partial name matching
      const projects = await todoistClient.getProjects();
      const matchingProject = projects.find((project: any) =>
        project.name.toLowerCase().includes(args.project_name.toLowerCase())
      );

      if (!matchingProject) {
        return {
          content: [
            {
              type: "text",
              text: `Could not find a project matching "${args.project_name}"`,
            },
          ],
          isError: true,
        };
      }

      // Delete the project using Todoist API
      await todoistClient.deleteProject(matchingProject.id);

      return {
        content: [
          {
            type: "text",
            text: `Successfully deleted project: "${matchingProject.name}"`,
          },
        ],
        isError: false,
      };
    }

    if (name === "todoist_get_sections") {
      if (!isGetSectionsArgs(args)) {
        throw new Error("Invalid arguments for todoist_get_sections");
      }

      // First, find the project by name
      const projects = await todoistClient.getProjects();
      const matchingProject = projects.find((project: any) =>
        project.name.toLowerCase().includes(args.project_name.toLowerCase())
      );

      if (!matchingProject) {
        return {
          content: [
            {
              type: "text",
              text: `Could not find a project matching "${args.project_name}"`,
            },
          ],
          isError: true,
        };
      }

      // Fetch sections from the project
      const sections = await todoistClient.getSections(matchingProject.id);

      // Apply limit if specified
      const limitedSections = args.limit
        ? sections.slice(0, args.limit)
        : sections;

      // Format sections for display
      const sectionList = limitedSections
        .map(
          (section: any) =>
            `- **${section.name}** (ID: ${section.id})\n  Project: ${
              matchingProject.name
            }${section.order ? `\n  Order: ${section.order}` : ""}`
        )
        .join("\n\n");

      return {
        content: [
          {
            type: "text",
            text:
              limitedSections.length > 0
                ? `Sections in "${matchingProject.name}":\n\n${sectionList}`
                : `No sections found in project "${matchingProject.name}"`,
          },
        ],
        isError: false,
      };
    }

    if (name === "todoist_create_section") {
      if (!isCreateSectionArgs(args)) {
        throw new Error("Invalid arguments for todoist_create_section");
      }

      // First, find the project by name
      const projects = await todoistClient.getProjects();
      const matchingProject = projects.find((project: any) =>
        project.name.toLowerCase().includes(args.project_name.toLowerCase())
      );

      if (!matchingProject) {
        return {
          content: [
            {
              type: "text",
              text: `Could not find a project matching "${args.project_name}"`,
            },
          ],
          isError: true,
        };
      }

      // Create the section using Todoist API
      const section = await todoistClient.addSection({
        name: args.name,
        projectId: matchingProject.id,
        order: args.order,
      });

      return {
        content: [
          {
            type: "text",
            text: `Section created:\nName: ${section.name}\nID: ${
              section.id
            }\nProject: ${matchingProject.name}${
              section.order ? `\nOrder: ${section.order}` : ""
            }`,
          },
        ],
        isError: false,
      };
    }

    if (name === "todoist_update_section") {
      if (!isUpdateSectionArgs(args)) {
        throw new Error("Invalid arguments for todoist_update_section");
      }

      // First, find the project by name
      const projects = await todoistClient.getProjects();
      const matchingProject = projects.find((project: any) =>
        project.name.toLowerCase().includes(args.project_name.toLowerCase())
      );

      if (!matchingProject) {
        return {
          content: [
            {
              type: "text",
              text: `Could not find a project matching "${args.project_name}"`,
            },
          ],
          isError: true,
        };
      }

      // Then, find the section by name within the project
      const sections = await todoistClient.getSections(matchingProject.id);
      const matchingSection = sections.find((section: any) =>
        section.name.toLowerCase().includes(args.section_name.toLowerCase())
      );

      if (!matchingSection) {
        return {
          content: [
            {
              type: "text",
              text: `Could not find a section matching "${args.section_name}" in project "${matchingProject.name}"`,
            },
          ],
          isError: true,
        };
      }

      // Build update data object with only the fields that are provided
      const updateData: any = {};
      if (args.name) updateData.name = args.name;

      // Update the section using Todoist API
      const updatedSection = await todoistClient.updateSection(
        matchingSection.id,
        updateData
      );

      return {
        content: [
          {
            type: "text",
            text: `Section "${matchingSection.name}" updated:\nNew Name: ${updatedSection.name}\nID: ${updatedSection.id}\nProject: ${matchingProject.name}`,
          },
        ],
        isError: false,
      };
    }

    if (name === "todoist_delete_section") {
      if (!isDeleteSectionArgs(args)) {
        throw new Error("Invalid arguments for todoist_delete_section");
      }

      // First, find the project by name
      const projects = await todoistClient.getProjects();
      const matchingProject = projects.find((project: any) =>
        project.name.toLowerCase().includes(args.project_name.toLowerCase())
      );

      if (!matchingProject) {
        return {
          content: [
            {
              type: "text",
              text: `Could not find a project matching "${args.project_name}"`,
            },
          ],
          isError: true,
        };
      }

      // Then, find the section by name within the project
      const sections = await todoistClient.getSections(matchingProject.id);
      const matchingSection = sections.find((section: any) =>
        section.name.toLowerCase().includes(args.section_name.toLowerCase())
      );

      if (!matchingSection) {
        return {
          content: [
            {
              type: "text",
              text: `Could not find a section matching "${args.section_name}" in project "${matchingProject.name}"`,
            },
          ],
          isError: true,
        };
      }

      // Delete the section using Todoist API
      await todoistClient.deleteSection(matchingSection.id);

      return {
        content: [
          {
            type: "text",
            text: `Successfully deleted section: "${matchingSection.name}" from project "${matchingProject.name}"`,
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