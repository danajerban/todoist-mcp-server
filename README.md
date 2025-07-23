# Todoist MCP Server

A complete MCP (Model Context Protocol) server implementation that integrates Claude with Todoist, enabling comprehensive task, project, and section management through natural language. This server provides full CRUD operations for the complete Todoist hierarchy - meaning you can create, update, delete, and get projects, sections, and/or tasks and **use this MCP to completely manage your Todoist account**, for personal or work use (or both!).

## Features

- **Natural Language Task Management**: Create, update, complete, and delete tasks using everyday language
- **Smart Search**: Find tasks, projects, and sections using partial name matches
- **Flexible Filtering**: Filter tasks by due date, priority, project, and section
- **Rich Task Details**: Support for descriptions, due dates, priorities, and project/section assignments
- **Project & Section Management**: Complete CRUD operations for projects and sections
- **Hierarchical Organization**: Complete project → section → task hierarchy
- **Intuitive Error Handling**: Clear feedback for better user experience

## Installation

### Manual Installation

```bash
npm install -g @danajerban/todoist-mcp-server
```

## Tools

### Task Management

#### todoist_create_task

Create new tasks with comprehensive attributes:

- Required: content (task title)
- Optional: description, due date, priority (1-4), project_id, section_id
- Example: "Create task 'Team Meeting' with description 'Weekly sync' due tomorrow"

#### todoist_get_tasks

Retrieve and filter tasks with advanced options:

- Filter by project, due date, priority, section
- Natural language date filtering
- Optional result limit
- Example: "Show high priority tasks due this week"

#### todoist_update_task

Update existing tasks using partial name search:

- Find tasks by partial name match
- Update any task attribute (content, description, due date, priority, project, section)
- Example: "Update meeting task to be due next Monday"

#### todoist_complete_task

Mark tasks as complete using natural language search:

- Find tasks by partial name match
- Confirm completion status
- Example: "Mark the documentation task as complete"

#### todoist_delete_task

Remove tasks using natural language search:

- Find and delete tasks by name
- Confirmation messages
- Example: "Delete the PR review task"

### Project Management

#### todoist_get_projects

Retrieve all projects with details:

- List all projects with IDs, colors, and hierarchy
- Optional result limit
- Example: "Show all my projects"

#### todoist_create_project

Create new projects with optional attributes:

- Required: name
- Optional: color, parent_id (for sub-projects)
- Example: "Create project 'Mobile App' with blue color"

#### todoist_update_project

Update existing projects using partial name search:

- Find projects by partial name match
- Update name and color
- Example: "Rename 'Work Stuff' project to 'Office Tasks'"

#### todoist_delete_project

Delete projects using partial name search:

- Find and delete projects by name
- Confirmation messages
- Example: "Delete the 'Old Project' project"

### Section Management

#### todoist_get_sections

Retrieve sections from a specific project:

- Required: project_name
- Optional: limit
- Example: "Show sections in 'Development' project"

#### todoist_create_section

Create new sections within projects:

- Required: name, project_name
- Optional: order
- Example: "Create section 'In Progress' in 'Work' project"

#### todoist_update_section

Update existing sections using partial name search:

- Required: section_name, project_name
- Optional: name (new name)
- Example: "Rename 'To Do' section to 'Backlog' in 'Development' project"

#### todoist_delete_section

Delete sections using partial name search:

- Required: section_name, project_name
- Confirmation messages
- Example: "Delete 'Completed' section from 'Work' project"

## Setup

### Getting a Todoist API Token

1. Log in to your Todoist account
2. Navigate to Settings → Integrations
3. Find your API token under "Developer"

### Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

#### Option 1: Using NPX (Recommended)

```json
{
  "mcpServers": {
    "todoist": {
      "command": "npx",
      "args": ["-y", "@danajerban/todoist-mcp-server"],
      "env": {
        "TODOIST_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

#### Option 2: Using Direct Node Path (if NPX fails)

If `npx` doesn't work, you can use the direct path to your Node.js installation. First, find your Node.js path:

```bash
which node
# or if using nvm:
nvm which current
```

Then use the direct path in your config:

```json
{
  "mcpServers": {
    "todoist": {
      "command": "/path/to/your/node",
      "args": [
        "/path/to/global/node_modules/@danajerban/todoist-mcp-server/dist/index.js"
      ],
      "env": {
        "TODOIST_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

#### Option 3: Using Local Build

For development or local builds:

```json
{
  "mcpServers": {
    "todoist": {
      "command": "/path/to/your/node",
      "args": ["/path/to/your/project/todoist-mcp-server/dist/index.js"],
      "env": {
        "TODOIST_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

**Example with NVM path:**

```json
{
  "mcpServers": {
    "todoist": {
      "command": "/Users/username/.nvm/versions/node/v23.11.1/bin/node",
      "args": [
        "/Users/username/.nvm/versions/node/v23.11.1/lib/node_modules/@danajerban/todoist-mcp-server/dist/index.js"
      ],
      "env": {
        "TODOIST_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

## Example Usage

### Task Management

- "Create task 'Prepare quarterly budget report' with description 'Include Q3 analysis and Q4 projections' due next Friday with high priority"
- "Show all tasks in my Personal project that are due this week"
- "Update 'Fix login bug' task to move it to the Testing section and mark as high priority"

### Project Management

- "Create project 'Website Redesign' with green color for our upcoming marketing campaign"
- "Show all my work-related projects and their current task counts"
- "Update 'Client Work' project name to 'Freelance Projects' and change color to blue"

### Section Management

- "Create section 'Code Review' in my Development project to track pending reviews"
- "Show all sections in 'Marketing Campaign' project with their current tasks"
- "Rename 'Backlog' section to 'Future Ideas' in the 'Product Development' project"

### Complete Workflow Examples

#### Example 1: E-commerce Website Launch

```
Create me a new project 'E-commerce Website Launch' with 4 sections: 'To Do', 'In Progress', 'Done', and 'Backlog'. Then create task 'Set up payment gateway integration' with description 'Integrate Stripe and PayPal APIs' due next Friday with high priority in 'To Do' section. Then, add all subtasks needed for authentication using NextAuth for example 'Install NextAuth packages', 'Configure OAuth providers for Google and GitHub', 'Set up database adapter for user sessions', 'Create custom login and signup pages', 'Implement role-based access control' etc. with low priority in 'To Do' section.
```

#### Example 2: Home Renovation Project Management

```
Create another project 'Kitchen Renovation' with 2 sections: 'To Do' and 'Improvements'. Then create task 'Get renovation permits from city' with description 'Submit plans for electrical and plumbing work' due next Monday with high priority in 'To Do' section. Add all subtasks for appliance selection such as 'Research Energy Star rated refrigerators under $2000', 'Compare induction vs gas cooktop options', 'Measure space for dishwasher installation', 'Get quotes for appliance delivery and installation' in the 'To Do' section and then add a 'Schedule appliance delivery after cabinet installation' task with low priority in 'Improvements' section. Maybe add some research tasks as well?
```

## Development

### Building from source

```bash
# Clone the repository
git clone https://github.com/danajerban/todoist-mcp-server.git

# Navigate to directory
cd todoist-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

## Contributing

Contributions are welcome! Feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Issues and Support

If you encounter any issues or need support, please file an issue on the [GitHub repository](https://github.com/danajerban/todoist-mcp-server/issues).
