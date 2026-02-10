import { Client } from "@notionhq/client"

export class NotionTools {
  private notion: Client

  constructor(accessToken: string) {
    this.notion = new Client({
      auth: accessToken
    })
  }

  async listDatabases() {
    const response = await this.notion.search({
      filter: {
        property: 'object',
        value: 'database'
      }
    })
    return response.results
  }

  async getDatabase(databaseId: string) {
    const response = await this.notion.databases.retrieve({
      database_id: databaseId
    })
    return response
  }

  async queryDatabase(databaseId: string, filter?: any, sorts?: any[]) {
    const response = await this.notion.databases.query({
      database_id: databaseId,
      filter,
      sorts
    })
    return response.results
  }

  async createPage(databaseId: string, properties: any, children?: any[]) {
    const response = await this.notion.pages.create({
      parent: {
        database_id: databaseId
      },
      properties,
      children
    })
    return response
  }

  async getPage(pageId: string) {
    const response = await this.notion.pages.retrieve({
      page_id: pageId
    })
    return response
  }

  async updatePage(pageId: string, properties: any) {
    const response = await this.notion.pages.update({
      page_id: pageId,
      properties
    })
    return response
  }

  async getPageContent(pageId: string) {
    const response = await this.notion.blocks.children.list({
      block_id: pageId
    })
    return response.results
  }

  async appendBlockChildren(blockId: string, children: any[]) {
    const response = await this.notion.blocks.children.append({
      block_id: blockId,
      children
    })
    return response
  }

  async searchPages(query: string) {
    const response = await this.notion.search({
      query,
      filter: {
        property: 'object',
        value: 'page'
      }
    })
    return response.results
  }

  async listUsers() {
    const response = await this.notion.users.list({})
    return response.results
  }

  async getUser(userId: string) {
    const response = await this.notion.users.retrieve({
      user_id: userId
    })
    return response
  }

  async createDatabase(pageId: string, title: string, properties: any) {
    const response = await this.notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: pageId
      },
      title: [
        {
          type: 'text',
          text: {
            content: title
          }
        }
      ],
      properties
    })
    return response
  }

  async updateDatabase(databaseId: string, title?: string, properties?: any) {
    const response = await this.notion.databases.update({
      database_id: databaseId,
      title: title ? [
        {
          type: 'text',
          text: {
            content: title
          }
        }
      ] : undefined,
      properties
    })
    return response
  }
}
