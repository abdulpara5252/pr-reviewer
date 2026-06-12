# PR Reviewer MCP Server

A Node.js MCP server to fetch GitHub pull requests (PRs) and save analysis to Notion.

## Features
- `fetch_pr`: Retrieves PR details (title, body, changes, status) from GitHub.
- `create_notion_page`: Creates a Notion page with PR analysis under a parent page.

## Setup
1. Clone the repository:
   ```bash
   git clone 
   cd pr-reviewer-mcp

   Install Node.js v18 (https://nodejs.org).
Install dependencies:
bash

Copy
npm install
Create a .env file:
env

Copy
GITHUB_TOKEN=fghfghhghfghgfgh
NOTION_API_KEY=fghfghffgh
NOTION_PAGE_ID=fghfghfghg
Get GITHUB_TOKEN from https://github.com/settings/tokens (needs repo scope).
Get NOTION_API_KEY and create an integration at https://www.notion.so/my-integrations.
Get NOTION_PAGE_ID from a Notion page URL (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).
Share the Notion page with your integration (Share > Toggle on integration).
Run the server:
bash

Copy

npm start
