const express = require('express');
const { Octokit } = require('@octokit/core');
const { Client } = require('@notionhq/client');
require('dotenv').config();

// Create an Express app
const app = express();
app.use(express.json()); // Allow the server to read JSON data from requests

// Connect to GitHub and Notion using API keys
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const notionPageId = process.env.NOTION_PAGE_ID;

// Class to manage our tools
class PRAnalyzer {
  constructor() {
    this.tools = {
      fetch_pr: this.fetchPR,
      create_notion_page: this.createNotionPage,
    };
  }

  // Tool 1: Fetch PR details from GitHub
  async fetchPR({ repo_name, pr_number }) {
    try {
      // Get PR data
      const prResponse = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner: repo_name.split('/')[0], // e.g., "octocat" from "octocat/Hello-World"
        repo: repo_name.split('/')[1],  // e.g., "Hello-World"
        pull_number: pr_number,
      });

      // Get PR code changes
      const filesResponse = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/files', {
        owner: repo_name.split('/')[0],
        repo: repo_name.split('/')[1],
        pull_number: pr_number,
      });

      return {
        title: prResponse.data.title,
        body: prResponse.data.body || 'No description',
        changes: filesResponse.data.map(file => file.patch || 'No changes'),
        status: prResponse.data.state,
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Tool 2: Save analysis to Notion
  async createNotionPage({ pr_data, analysis }) {
    try {
      await notion.pages.create({
        parent: { page_id: notionPageId },
        properties: {
          title: {
            title: [{ text: { content: pr_data.title || 'Untitled PR' } }],
          },
        },
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: analysis } }],
            },
          },
        ],
      });
      return { status: 'success', message: 'Analysis saved to Notion' };
    } catch (error) {
      return { error: error.message };
    }
  }
}

// Create an instance of our tool manager
const analyzer = new PRAnalyzer();

// MCP Endpoint 1: List available tools
app.get('/mcp/tools', (req, res) => {
  res.json(Object.keys(analyzer.tools)); // Returns ["fetch_pr", "create_notion_page"]
});

// MCP Endpoint 2: Run a tool
app.post('/mcp/tool/:toolName', async (req, res) => {
  const { toolName } = req.params;
  const params = req.body;

  // Check if the tool exists
  if (!analyzer.tools[toolName]) {
    return res.status(404).json({ error: 'Tool not found' });
  }

  // Run the tool and return the result
  const tool = analyzer.tools[toolName];
  const result = await tool(params);
  res.json(result);
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});