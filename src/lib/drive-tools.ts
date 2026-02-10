import { DynamicStructuredTool } from "@langchain/core/tools"
import { z } from "zod"
import { google } from "googleapis"

/**
 * Google Drive LangChain Tools
 * 
 * These tools enable AI to interact with Google Drive for:
 * - Listing and searching files
 * - Creating and uploading files
 * - Reading file content
 * - Moving and organizing files
 * - Sharing and managing permissions
 * - Creating folders
 */

export class GoogleDriveListFiles extends DynamicStructuredTool {
    name = "GoogleDriveListFiles"
    description = "List files in Google Drive. Can filter by folder, file type, or search query."

    constructor(private accessToken: string) {
        super({
            name: "GoogleDriveListFiles",
            description: "List files in Google Drive. Can filter by folder, file type, or search query.",
            schema: z.object({
                folderId: z.string().optional().describe("ID of folder to list files from (optional)"),
                query: z.string().optional().describe("Search query to filter files (optional)"),
                pageSize: z.number().min(1).max(100).default(20).describe("Number of files to return")
            }),
            func: async ({ folderId, query, pageSize }) => {
                const oauth2Client = new google.auth.OAuth2()
                oauth2Client.setCredentials({ access_token: this.accessToken })
                const drive = google.drive({ version: 'v3', auth: oauth2Client })

                let q = "trashed=false"
                if (folderId) {
                    q += ` and '${folderId}' in parents`
                }
                if (query) {
                    q += ` and name contains '${query}'`
                }

                const response = await drive.files.list({
                    q,
                    pageSize,
                    fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, iconLink, owners)',
                    orderBy: 'modifiedTime desc'
                })

                return JSON.stringify({
                    files: response.data.files?.map(file => ({
                        id: file.id,
                        name: file.name,
                        mimeType: file.mimeType,
                        size: file.size,
                        createdTime: file.createdTime,
                        modifiedTime: file.modifiedTime,
                        webViewLink: file.webViewLink,
                        iconLink: file.iconLink,
                        owners: file.owners?.map(o => o.emailAddress)
                    })) || []
                })
            }
        })
    }
}

export class GoogleDriveSearchFiles extends DynamicStructuredTool {
    name = "GoogleDriveSearchFiles"
    description = "Search for files in Google Drive using advanced search queries."

    constructor(private accessToken: string) {
        super({
            name: "GoogleDriveSearchFiles",
            description: "Search for files in Google Drive using advanced search queries.",
            schema: z.object({
                query: z.string().describe("Search query (e.g., 'name contains report', 'mimeType = application/pdf')"),
                pageSize: z.number().min(1).max(100).default(20).describe("Number of results")
            }),
            func: async ({ query, pageSize }) => {
                const oauth2Client = new google.auth.OAuth2()
                oauth2Client.setCredentials({ access_token: this.accessToken })
                const drive = google.drive({ version: 'v3', auth: oauth2Client })

                const response = await drive.files.list({
                    q: `${query} and trashed=false`,
                    pageSize,
                    fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink)',
                    orderBy: 'modifiedTime desc'
                })

                return JSON.stringify({
                    files: response.data.files?.map(file => ({
                        id: file.id,
                        name: file.name,
                        mimeType: file.mimeType,
                        size: file.size,
                        modifiedTime: file.modifiedTime,
                        webViewLink: file.webViewLink
                    })) || []
                })
            }
        })
    }
}

export class GoogleDriveGetFile extends DynamicStructuredTool {
    name = "GoogleDriveGetFile"
    description = "Get metadata and details about a specific file in Google Drive."

    constructor(private accessToken: string) {
        super({
            name: "GoogleDriveGetFile",
            description: "Get metadata and details about a specific file in Google Drive.",
            schema: z.object({
                fileId: z.string().describe("ID of the file to get")
            }),
            func: async ({ fileId }) => {
                const oauth2Client = new google.auth.OAuth2()
                oauth2Client.setCredentials({ access_token: this.accessToken })
                const drive = google.drive({ version: 'v3', auth: oauth2Client })

                const response = await drive.files.get({
                    fileId,
                    fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, owners, permissions, shared'
                })

                return JSON.stringify({
                    id: response.data.id,
                    name: response.data.name,
                    mimeType: response.data.mimeType,
                    size: response.data.size,
                    createdTime: response.data.createdTime,
                    modifiedTime: response.data.modifiedTime,
                    webViewLink: response.data.webViewLink,
                    webContentLink: response.data.webContentLink,
                    owners: response.data.owners?.map(o => o.emailAddress),
                    shared: response.data.shared
                })
            }
        })
    }
}

export class GoogleDriveCreateFolder extends DynamicStructuredTool {
    name = "GoogleDriveCreateFolder"
    description = "Create a new folder in Google Drive."

    constructor(private accessToken: string) {
        super({
            name: "GoogleDriveCreateFolder",
            description: "Create a new folder in Google Drive.",
            schema: z.object({
                name: z.string().describe("Name of the folder to create"),
                parentFolderId: z.string().optional().describe("ID of parent folder (optional, defaults to root)")
            }),
            func: async ({ name, parentFolderId }) => {
                const oauth2Client = new google.auth.OAuth2()
                oauth2Client.setCredentials({ access_token: this.accessToken })
                const drive = google.drive({ version: 'v3', auth: oauth2Client })

                const fileMetadata: any = {
                    name,
                    mimeType: 'application/vnd.google-apps.folder'
                }

                if (parentFolderId) {
                    fileMetadata.parents = [parentFolderId]
                }

                const response = await drive.files.create({
                    requestBody: fileMetadata,
                    fields: 'id, name, webViewLink'
                })

                return JSON.stringify({
                    message: 'Folder created successfully!',
                    folderId: response.data.id,
                    name: response.data.name,
                    webViewLink: response.data.webViewLink
                })
            }
        })
    }
}

export class GoogleDriveUploadFile extends DynamicStructuredTool {
    name = "GoogleDriveUploadFile"
    description = "Upload a file to Google Drive with text content."

    constructor(private accessToken: string) {
        super({
            name: "GoogleDriveUploadFile",
            description: "Upload a file to Google Drive with text content.",
            schema: z.object({
                name: z.string().describe("Name of the file"),
                content: z.string().describe("Text content of the file"),
                mimeType: z.string().default("text/plain").describe("MIME type of the file"),
                parentFolderId: z.string().optional().describe("ID of parent folder (optional)")
            }),
            func: async ({ name, content, mimeType, parentFolderId }) => {
                const oauth2Client = new google.auth.OAuth2()
                oauth2Client.setCredentials({ access_token: this.accessToken })
                const drive = google.drive({ version: 'v3', auth: oauth2Client })

                const fileMetadata: any = { name }
                if (parentFolderId) {
                    fileMetadata.parents = [parentFolderId]
                }

                const media = {
                    mimeType,
                    body: content
                }

                const response = await drive.files.create({
                    requestBody: fileMetadata,
                    media,
                    fields: 'id, name, webViewLink'
                })

                return JSON.stringify({
                    message: 'File uploaded successfully!',
                    fileId: response.data.id,
                    name: response.data.name,
                    webViewLink: response.data.webViewLink
                })
            }
        })
    }
}

export class GoogleDriveDeleteFile extends DynamicStructuredTool {
    name = "GoogleDriveDeleteFile"
    description = "Delete a file or folder from Google Drive (moves to trash)."

    constructor(private accessToken: string) {
        super({
            name: "GoogleDriveDeleteFile",
            description: "Delete a file or folder from Google Drive (moves to trash).",
            schema: z.object({
                fileId: z.string().describe("ID of the file or folder to delete")
            }),
            func: async ({ fileId }) => {
                const oauth2Client = new google.auth.OAuth2()
                oauth2Client.setCredentials({ access_token: this.accessToken })
                const drive = google.drive({ version: 'v3', auth: oauth2Client })

                await drive.files.delete({ fileId })

                return JSON.stringify({
                    message: 'File deleted successfully!',
                    fileId
                })
            }
        })
    }
}

export class GoogleDriveMoveFile extends DynamicStructuredTool {
    name = "GoogleDriveMoveFile"
    description = "Move a file or folder to a different location in Google Drive."

    constructor(private accessToken: string) {
        super({
            name: "GoogleDriveMoveFile",
            description: "Move a file or folder to a different location in Google Drive.",
            schema: z.object({
                fileId: z.string().describe("ID of the file to move"),
                newParentFolderId: z.string().describe("ID of the destination folder")
            }),
            func: async ({ fileId, newParentFolderId }) => {
                const oauth2Client = new google.auth.OAuth2()
                oauth2Client.setCredentials({ access_token: this.accessToken })
                const drive = google.drive({ version: 'v3', auth: oauth2Client })

                // Get current parents
                const file = await drive.files.get({
                    fileId,
                    fields: 'parents'
                })

                const previousParents = file.data.parents?.join(',')

                // Move file
                const response = await drive.files.update({
                    fileId,
                    addParents: newParentFolderId,
                    removeParents: previousParents,
                    fields: 'id, name, parents'
                })

                return JSON.stringify({
                    message: 'File moved successfully!',
                    fileId: response.data.id,
                    name: response.data.name
                })
            }
        })
    }
}

export class GoogleDriveRenameFile extends DynamicStructuredTool {
    name = "GoogleDriveRenameFile"
    description = "Rename a file or folder in Google Drive."

    constructor(private accessToken: string) {
        super({
            name: "GoogleDriveRenameFile",
            description: "Rename a file or folder in Google Drive.",
            schema: z.object({
                fileId: z.string().describe("ID of the file to rename"),
                newName: z.string().describe("New name for the file")
            }),
            func: async ({ fileId, newName }) => {
                const oauth2Client = new google.auth.OAuth2()
                oauth2Client.setCredentials({ access_token: this.accessToken })
                const drive = google.drive({ version: 'v3', auth: oauth2Client })

                const response = await drive.files.update({
                    fileId,
                    requestBody: { name: newName },
                    fields: 'id, name, webViewLink'
                })

                return JSON.stringify({
                    message: 'File renamed successfully!',
                    fileId: response.data.id,
                    name: response.data.name,
                    webViewLink: response.data.webViewLink
                })
            }
        })
    }
}

export class GoogleDriveShareFile extends DynamicStructuredTool {
    name = "GoogleDriveShareFile"
    description = "Share a file or folder with specific users or make it public."

    constructor(private accessToken: string) {
        super({
            name: "GoogleDriveShareFile",
            description: "Share a file or folder with specific users or make it public.",
            schema: z.object({
                fileId: z.string().describe("ID of the file to share"),
                email: z.string().optional().describe("Email address to share with (optional)"),
                role: z.enum(['reader', 'writer', 'commenter']).default('reader').describe("Permission role"),
                type: z.enum(['user', 'anyone']).default('user').describe("Type of permission")
            }),
            func: async ({ fileId, email, role, type }) => {
                const oauth2Client = new google.auth.OAuth2()
                oauth2Client.setCredentials({ access_token: this.accessToken })
                const drive = google.drive({ version: 'v3', auth: oauth2Client })

                const permission: any = {
                    type,
                    role
                }

                if (type === 'user' && email) {
                    permission.emailAddress = email
                }

                const response = await drive.permissions.create({
                    fileId,
                    requestBody: permission,
                    fields: 'id'
                })

                return JSON.stringify({
                    message: type === 'anyone' ? 'File made public!' : `File shared with ${email}!`,
                    permissionId: response.data.id,
                    fileId
                })
            }
        })
    }
}

export class GoogleDriveCopyFile extends DynamicStructuredTool {
    name = "GoogleDriveCopyFile"
    description = "Create a copy of a file in Google Drive."

    constructor(private accessToken: string) {
        super({
            name: "GoogleDriveCopyFile",
            description: "Create a copy of a file in Google Drive.",
            schema: z.object({
                fileId: z.string().describe("ID of the file to copy"),
                newName: z.string().optional().describe("Name for the copy (optional)"),
                parentFolderId: z.string().optional().describe("Destination folder ID (optional)")
            }),
            func: async ({ fileId, newName, parentFolderId }) => {
                const oauth2Client = new google.auth.OAuth2()
                oauth2Client.setCredentials({ access_token: this.accessToken })
                const drive = google.drive({ version: 'v3', auth: oauth2Client })

                const requestBody: any = {}
                if (newName) requestBody.name = newName
                if (parentFolderId) requestBody.parents = [parentFolderId]

                const response = await drive.files.copy({
                    fileId,
                    requestBody,
                    fields: 'id, name, webViewLink'
                })

                return JSON.stringify({
                    message: 'File copied successfully!',
                    fileId: response.data.id,
                    name: response.data.name,
                    webViewLink: response.data.webViewLink
                })
            }
        })
    }
}

export class GoogleDriveGetStorageQuota extends DynamicStructuredTool {
    name = "GoogleDriveGetStorageQuota"
    description = "Get information about Google Drive storage usage and quota."

    constructor(private accessToken: string) {
        super({
            name: "GoogleDriveGetStorageQuota",
            description: "Get information about Google Drive storage usage and quota.",
            schema: z.object({}),
            func: async () => {
                const oauth2Client = new google.auth.OAuth2()
                oauth2Client.setCredentials({ access_token: this.accessToken })
                const drive = google.drive({ version: 'v3', auth: oauth2Client })

                const response = await drive.about.get({
                    fields: 'storageQuota, user'
                })

                const quota = response.data.storageQuota
                const usageInDrive = parseInt(quota?.usageInDrive || '0')
                const limit = parseInt(quota?.limit || '0')
                const usage = parseInt(quota?.usage || '0')

                return JSON.stringify({
                    user: response.data.user?.emailAddress,
                    usage: usage,
                    usageInDrive: usageInDrive,
                    limit: limit,
                    usagePercent: limit > 0 ? ((usage / limit) * 100).toFixed(2) : 0,
                    usageGB: (usage / (1024 * 1024 * 1024)).toFixed(2),
                    limitGB: (limit / (1024 * 1024 * 1024)).toFixed(2)
                })
            }
        })
    }
}
