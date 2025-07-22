/**
 * Type Guards for MCP Tool Arguments
 * 
 * This file contains type guard functions for validating arguments passed to MCP tools.
 * Each function validates the structure and required properties of arguments for their
 * corresponding Todoist MCP server tools. Type guards ensure type safety at runtime
 * by checking that arguments match expected interfaces before API calls.
 * 
 * Pattern: All type guards follow the format is[ToolName]Args and return a type predicate
 * that narrows the unknown type to the specific tool's argument interface.
 */

// Type guard for create task arguments
export function isCreateTaskArgs(args: unknown): args is {
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

// Type guard for get tasks arguments
export function isGetTasksArgs(args: unknown): args is {
  project_id?: string;
  filter?: string;
  priority?: number;
  limit?: number;
  section_id?: string;
} {
  return typeof args === "object" && args !== null;
}

// Type guard for update task arguments
export function isUpdateTaskArgs(args: unknown): args is {
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

// Type guard for delete task arguments
export function isDeleteTaskArgs(args: unknown): args is {
  task_name: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "task_name" in args &&
    typeof (args as { task_name: string }).task_name === "string"
  );
}

// Type guard for complete task arguments
export function isCompleteTaskArgs(args: unknown): args is {
  task_name: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "task_name" in args &&
    typeof (args as { task_name: string }).task_name === "string"
  );
}

// Type guard for get projects arguments
export function isGetProjectsArgs(args: unknown): args is {
  limit?: number;
} {
  return typeof args === "object" && args !== null;
}

// Type guard for create project arguments
export function isCreateProjectArgs(args: unknown): args is {
  name: string;
  color?: string;
  parent_id?: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "name" in args &&
    typeof (args as { name: string }).name === "string"
  );
}

// Type guard for update project arguments
export function isUpdateProjectArgs(args: unknown): args is {
  project_name: string;
  name?: string;
  color?: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "project_name" in args &&
    typeof (args as { project_name: string }).project_name === "string"
  );
}

// Type guard for delete project arguments
export function isDeleteProjectArgs(args: unknown): args is {
  project_name: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "project_name" in args &&
    typeof (args as { project_name: string }).project_name === "string"
  );
}

// Type guard for get sections arguments
export function isGetSectionsArgs(args: unknown): args is {
  project_name: string;
  limit?: number;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "project_name" in args &&
    typeof (args as { project_name: string }).project_name === "string"
  );
}

// Type guard for create section arguments
export function isCreateSectionArgs(args: unknown): args is {
  name: string;
  project_name: string;
  order?: number;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "name" in args &&
    "project_name" in args &&
    typeof (args as { name: string }).name === "string" &&
    typeof (args as { project_name: string }).project_name === "string"
  );
}

// Type guard for update section arguments
export function isUpdateSectionArgs(args: unknown): args is {
  section_name: string;
  project_name: string;
  name?: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "section_name" in args &&
    "project_name" in args &&
    typeof (args as { section_name: string }).section_name === "string" &&
    typeof (args as { project_name: string }).project_name === "string"
  );
}

// Type guard for delete section arguments
export function isDeleteSectionArgs(args: unknown): args is {
  section_name: string;
  project_name: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "section_name" in args &&
    "project_name" in args &&
    typeof (args as { section_name: string }).section_name === "string" &&
    typeof (args as { project_name: string }).project_name === "string"
  );
}