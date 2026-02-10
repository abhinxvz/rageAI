import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { NotionTools } from './notion-tools'

/**
 * Creates Notion integration tools for LangChain
 * Provides comprehensive access to Notion workspace including:
 * - Database management (list, get, create, update, query)
 * - Page operations (create, read, update, search)
 * - Content management (read blocks, append content)
 * - User management (list users, get user details)
 */
export function createNotionTools(accessToken: string) {
  const notion = new NotionTools(accessToken)

  return [
    // Database Discovery & Management
    new DynamicStructuredTool({
      name: 'notion_list_databases',
      description: 'List all databases in your Notion workspace. Returns database IDs and titles. Use this first to discover available databases before querying them.',
      schema: z.object({
        limit: z.number().optional().describe('Optional limit on number of results')
      }),
      func: async () => {
        const databases = await notion.listDatabases()
        return JSON.stringify(databases.map((d: any) => ({ 
          id: d.id, 
          title: d.title?.[0]?.plain_text || 'Untitled',
          url: d.url
        })))
      }
    }),

    new DynamicStructuredTool({
      name: 'notion_get_database',
      description: 'Get detailed information about a specific Notion database including its schema, properties, and structure. Use this to understand what fields/columns a database has before creating or querying pages.',
      schema: z.object({
        databaseId: z.string().describe('The database ID (UUID format)')
      }),
      func: async (input) => {
        const database = await notion.getDatabase(input.databaseId)
        return JSON.stringify({
          id: (database as any).id,
          title: (database as any).title?.[0]?.plain_text || 'Untitled',
          properties: (database as any).properties,
          url: (database as any).url
        })
      }
    }),

    new DynamicStructuredTool({
      name: 'notion_create_database',
      description: 'Create a new database (table, board, list, etc.) in Notion. Requires a parent page ID and database schema. Use this to set up new structured data collections.',
      schema: z.object({
        pageId: z.string().describe('Parent page ID where the database will be created'),
        title: z.string().describe('Database name/title'),
        properties: z.record(z.any()).describe('Database schema - define columns/properties (e.g., {"Name": {"title": {}}, "Status": {"select": {"options": [{"name": "Done"}]}}})')
      }),
      func: async (input) => {
        const database = await notion.createDatabase(input.pageId, input.title, input.properties)
        return JSON.stringify({ 
          id: (database as any).id, 
          title: input.title, 
          url: (database as any).url,
          message: 'Database created successfully'
        })
      }
    }),

    new DynamicStructuredTool({
      name: 'notion_update_database',
      description: 'Update an existing database\'s title or schema properties. Use this to modify database structure, add new columns, or rename the database.',
      schema: z.object({
        databaseId: z.string().describe('The database ID to update'),
        title: z.string().optional().describe('New database title (optional)'),
        properties: z.record(z.any()).optional().describe('Updated schema properties (optional)')
      }),
      func: async (input) => {
        const database = await notion.updateDatabase(input.databaseId, input.title, input.properties)
        return JSON.stringify({ 
          id: (database as any).id, 
          updated: true,
          message: 'Database updated successfully'
        })
      }
    }),

    // Database Querying
    new DynamicStructuredTool({
      name: 'notion_query_database',
      description: 'Query a Notion database to retrieve pages/rows with optional filtering and sorting. Use this to read data from databases, find specific entries, or get all records. Returns page IDs and their properties.',
      schema: z.object({
        databaseId: z.string().describe('The database ID to query'),
        filter: z.record(z.any()).optional().describe('Filter conditions in Notion API format (e.g., {"property": "Status", "select": {"equals": "Done"}})'),
        sorts: z.array(z.record(z.any())).optional().describe('Sort criteria array (e.g., [{"property": "Created", "direction": "descending"}])')
      }),
      func: async (input) => {
        const pages = await notion.queryDatabase(input.databaseId, input.filter, input.sorts)
        return JSON.stringify(pages.map((p: any) => ({ 
          id: p.id, 
          properties: p.properties,
          url: p.url,
          created_time: p.created_time,
          last_edited_time: p.last_edited_time
        })))
      }
    }),

    // Page Operations
    new DynamicStructuredTool({
      name: 'notion_create_page',
      description: 'Create a new page in a Notion database. Use this to add new entries, tasks, records, or items to a database. Provide property values matching the database schema.',
      schema: z.object({
        databaseId: z.string().describe('The database ID to create the page in'),
        properties: z.record(z.any()).describe('Page property values matching database schema (e.g., {"Name": {"title": [{"text": {"content": "My Task"}}]}, "Status": {"select": {"name": "In Progress"}}})'),
        children: z.array(z.record(z.any())).optional().describe('Optional content blocks to add to the page body (e.g., paragraphs, headings, lists)')
      }),
      func: async (input) => {
        const page = await notion.createPage(input.databaseId, input.properties, input.children)
        return JSON.stringify({ 
          id: (page as any).id, 
          url: (page as any).url,
          message: 'Page created successfully'
        })
      }
    }),

    new DynamicStructuredTool({
      name: 'notion_get_page',
      description: 'Get metadata and properties of a specific Notion page. Returns page properties but not the content blocks. Use notion_get_page_content to read the actual page content.',
      schema: z.object({
        pageId: z.string().describe('The page ID to retrieve')
      }),
      func: async (input) => {
        const page = await notion.getPage(input.pageId)
        return JSON.stringify({ 
          id: (page as any).id, 
          properties: (page as any).properties,
          url: (page as any).url,
          created_time: (page as any).created_time,
          last_edited_time: (page as any).last_edited_time
        })
      }
    }),

    new DynamicStructuredTool({
      name: 'notion_update_page',
      description: 'Update properties of an existing Notion page. Use this to modify database entry values like status, assignee, dates, or any other property. Does not modify page content blocks.',
      schema: z.object({
        pageId: z.string().describe('The page ID to update'),
        properties: z.record(z.any()).describe('Properties to update with new values (e.g., {"Status": {"select": {"name": "Completed"}}})')
      }),
      func: async (input) => {
        const page = await notion.updatePage(input.pageId, input.properties)
        return JSON.stringify({ 
          id: (page as any).id, 
          updated: true,
          message: 'Page properties updated successfully'
        })
      }
    }),

    new DynamicStructuredTool({
      name: 'notion_search_pages',
      description: 'Search for pages across your entire Notion workspace by text query. Returns matching pages with their IDs and titles. Use this to find pages when you don\'t know the exact ID.',
      schema: z.object({
        query: z.string().describe('Search query text to find pages')
      }),
      func: async (input) => {
        const pages = await notion.searchPages(input.query)
        return JSON.stringify(pages.map((p: any) => ({ 
          id: p.id, 
          title: p.properties?.title?.title?.[0]?.plain_text || p.properties?.Name?.title?.[0]?.plain_text || 'Untitled',
          url: p.url,
          last_edited_time: p.last_edited_time
        })))
      }
    }),

    // Content Management
    new DynamicStructuredTool({
      name: 'notion_get_page_content',
      description: 'Get all content blocks from a Notion page. Returns the actual page content including paragraphs, headings, lists, code blocks, etc. Use this to read what\'s written in a page.',
      schema: z.object({
        pageId: z.string().describe('The page ID to get content from')
      }),
      func: async (input) => {
        const blocks = await notion.getPageContent(input.pageId)
        return JSON.stringify(blocks.map((b: any) => ({ 
          id: b.id, 
          type: b.type,
          content: b[b.type],
          has_children: b.has_children
        })))
      }
    }),

    new DynamicStructuredTool({
      name: 'notion_append_blocks',
      description: 'Add content blocks to a Notion page or block. Use this to append text, headings, lists, code, quotes, or other content to existing pages. Great for adding notes, updates, or documentation.',
      schema: z.object({
        blockId: z.string().describe('The page or block ID to append content to'),
        children: z.array(z.record(z.any())).describe('Array of block objects to append (e.g., [{"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"text": {"content": "Hello"}}]}}])')
      }),
      func: async (input) => {
        const result = await notion.appendBlockChildren(input.blockId, input.children)
        return JSON.stringify({ 
          success: true, 
          blocks_added: (result as any).results?.length || 0,
          message: `Successfully added ${(result as any).results?.length || 0} content blocks`
        })
      }
    }),

    // User Management
    new DynamicStructuredTool({
      name: 'notion_list_users',
      description: 'List all users in the Notion workspace. Returns user IDs, names, and types (person or bot). Use this to find user IDs for assigning tasks or mentioning people.',
      schema: z.object({
        limit: z.number().optional().describe('Optional limit on number of results')
      }),
      func: async () => {
        const users = await notion.listUsers()
        return JSON.stringify(users.map((u: any) => ({ 
          id: u.id, 
          name: u.name,
          type: u.type,
          avatar_url: u.avatar_url
        })))
      }
    }),

    new DynamicStructuredTool({
      name: 'notion_get_user',
      description: 'Get detailed information about a specific Notion user by their ID. Returns user profile details.',
      schema: z.object({
        userId: z.string().describe('The user ID to retrieve')
      }),
      func: async (input) => {
        const user = await notion.getUser(input.userId)
        return JSON.stringify({
          id: (user as any).id,
          name: (user as any).name,
          type: (user as any).type,
          avatar_url: (user as any).avatar_url
        })
      }
    })
  ]
}
