import { GmailSendMessage as LangChainGmailSendMessage } from "@langchain/community/tools/gmail";
import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Custom wrapper for GmailSendMessage with a clear, unambiguous description
 * to prevent AI confusion about its purpose
 */
export class GmailSendMessageTool extends StructuredTool {
  name = "gmail_send_email";
  description = `Send a new email via Gmail. This tool SENDS emails, it does NOT retrieve or read emails.
Use this tool when the user wants to send an email to someone.
Input should include:
- to: recipient email address (required)
- subject: email subject line (required)
- message: email body content (required)
- cc: CC recipients (optional)
- bcc: BCC recipients (optional)

Example: To send an email to john@example.com with subject "Meeting" and message "Let's meet at 3pm", use this tool.`;

  schema = z.object({
    to: z.string().describe("Recipient email address"),
    subject: z.string().describe("Email subject line"),
    message: z.string().describe("Email body content"),
    cc: z.string().optional().describe("CC recipients (comma-separated)"),
    bcc: z.string().optional().describe("BCC recipients (comma-separated)"),
  });

  private gmailTool: LangChainGmailSendMessage;

  constructor(credentials: { credentials: { accessToken: string } }) {
    super();
    this.gmailTool = new LangChainGmailSendMessage(credentials);
  }

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    try {
      // Convert string inputs to arrays as expected by LangChain Gmail tool
      const gmailInput = {
        message: input.message,
        subject: input.subject,
        to: [input.to],
        cc: input.cc ? input.cc.split(',').map(e => e.trim()) : undefined,
        bcc: input.bcc ? input.bcc.split(',').map(e => e.trim()) : undefined,
      };
      const result = await this.gmailTool._call(gmailInput);
      return `✓ Email sent successfully to ${input.to} with subject "${input.subject}"`;
    } catch (error: any) {
      return `✗ Failed to send email: ${error.message}`;
    }
  }
}
