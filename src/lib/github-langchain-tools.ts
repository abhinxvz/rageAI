import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { GitHubTools } from './github-tools'

export function createGitHubTools(accessToken: string) {
  const github = new GitHubTools(accessToken)

  return [
    new DynamicStructuredTool({
      name: 'github_list_repos',
      description: 'List all repositories for the authenticated user. Use this to see what repos the user has access to.',
      schema: z.object({
        visibility: z.enum(['all', 'public', 'private']).optional().describe('Filter by visibility'),
        sort: z.enum(['created', 'updated', 'pushed', 'full_name']).optional().describe('Sort order')
      }),
      func: async (input) => {
        const repos = await github.listRepositories(input)
        return JSON.stringify(repos.map(r => ({ name: r.name, full_name: r.full_name, description: r.description, private: r.private })))
      }
    }),

    new DynamicStructuredTool({
      name: 'github_create_repo',
      description: 'Create a new GitHub repository for the authenticated user.',
      schema: z.object({
        name: z.string().describe('Repository name'),
        description: z.string().optional().describe('Repository description'),
        private: z.boolean().optional().describe('Whether the repo should be private')
      }),
      func: async (input) => {
        const repo = await github.createRepository(input.name, input)
        return JSON.stringify({ name: repo.name, full_name: repo.full_name, url: repo.html_url })
      }
    }),

    new DynamicStructuredTool({
      name: 'github_create_issue',
      description: 'Create a new issue in a GitHub repository.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        title: z.string().describe('Issue title'),
        body: z.string().optional().describe('Issue description/body'),
        labels: z.array(z.string()).optional().describe('Labels to add to the issue')
      }),
      func: async (input) => {
        const issue = await github.createIssue(input.owner, input.repo, input.title, input.body, input.labels)
        return JSON.stringify({ number: issue.number, title: issue.title, url: issue.html_url })
      }
    }),

    new DynamicStructuredTool({
      name: 'github_list_issues',
      description: 'List issues in a GitHub repository.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        state: z.enum(['open', 'closed', 'all']).optional().describe('Filter by issue state')
      }),
      func: async (input) => {
        const issues = await github.listIssues(input.owner, input.repo, { state: input.state })
        return JSON.stringify(issues.map(i => ({ number: i.number, title: i.title, state: i.state, url: i.html_url })))
      }
    }),

    new DynamicStructuredTool({
      name: 'github_create_pr',
      description: 'Create a new pull request in a GitHub repository.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        title: z.string().describe('Pull request title'),
        head: z.string().describe('The name of the branch where your changes are'),
        base: z.string().describe('The name of the branch you want to merge into'),
        body: z.string().optional().describe('Pull request description')
      }),
      func: async (input) => {
        const pr = await github.createPullRequest(input.owner, input.repo, input.title, input.head, input.base, input.body)
        return JSON.stringify({ number: pr.number, title: pr.title, url: pr.html_url })
      }
    }),

    new DynamicStructuredTool({
      name: 'github_list_prs',
      description: 'List pull requests in a GitHub repository.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        state: z.enum(['open', 'closed', 'all']).optional().describe('Filter by PR state')
      }),
      func: async (input) => {
        const prs = await github.listPullRequests(input.owner, input.repo, input.state)
        return JSON.stringify(prs.map(p => ({ number: p.number, title: p.title, state: p.state, url: p.html_url })))
      }
    }),

    new DynamicStructuredTool({
      name: 'github_create_branch',
      description: 'Create a new branch in a GitHub repository.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        branchName: z.string().describe('Name for the new branch'),
        fromBranch: z.string().optional().describe('Branch to create from (defaults to main)')
      }),
      func: async (input) => {
        const branch = await github.createBranch(input.owner, input.repo, input.branchName, input.fromBranch)
        return JSON.stringify({ ref: branch.ref, url: branch.url })
      }
    }),

    new DynamicStructuredTool({
      name: 'github_get_file',
      description: 'Get the content of a file from a GitHub repository.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        path: z.string().describe('Path to the file in the repository')
      }),
      func: async (input) => {
        const file = await github.getFileContent(input.owner, input.repo, input.path)
        return JSON.stringify(file)
      }
    }),

    new DynamicStructuredTool({
      name: 'github_create_file',
      description: 'Create or update a file in a GitHub repository. Use this to add new files or modify existing ones.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        path: z.string().describe('Path where the file should be created (e.g., "src/main.py" or "README.md")'),
        content: z.string().describe('Content of the file'),
        message: z.string().describe('Commit message'),
        sha: z.string().optional().describe('SHA of the file being replaced (required for updates, omit for new files)')
      }),
      func: async (input) => {
        const result = await github.createOrUpdateFile(input.owner, input.repo, input.path, input.content, input.message, input.sha)
        return JSON.stringify({ path: input.path, commit: result.commit.sha, message: 'File created/updated successfully' })
      }
    }),

    new DynamicStructuredTool({
      name: 'github_list_branches',
      description: 'List all branches in a GitHub repository.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name')
      }),
      func: async (input) => {
        const branches = await github.listBranches(input.owner, input.repo)
        return JSON.stringify(branches.map(b => ({ name: b.name, sha: b.commit.sha })))
      }
    }),

    new DynamicStructuredTool({
      name: 'github_search_repos',
      description: 'Search for repositories on GitHub.',
      schema: z.object({
        query: z.string().describe('Search query')
      }),
      func: async (input) => {
        const repos = await github.searchRepositories(input.query)
        return JSON.stringify(repos.map(r => ({ name: r.name, full_name: r.full_name, description: r.description, url: r.html_url })))
      }
    }),

    new DynamicStructuredTool({
      name: 'github_get_pr',
      description: 'Get details of a specific pull request including description, status, and metadata.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        pullNumber: z.number().describe('Pull request number')
      }),
      func: async (input) => {
        const pr = await github.getPullRequest(input.owner, input.repo, input.pullNumber)
        return JSON.stringify({
          number: pr.number,
          title: pr.title,
          body: pr.body,
          state: pr.state,
          user: pr.user?.login,
          head: pr.head.ref,
          base: pr.base.ref,
          mergeable: pr.mergeable,
          additions: pr.additions,
          deletions: pr.deletions,
          changed_files: pr.changed_files,
          url: pr.html_url
        })
      }
    }),

    new DynamicStructuredTool({
      name: 'github_get_pr_files',
      description: 'Get the list of files changed in a pull request with their diffs. Use this to review code changes.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        pullNumber: z.number().describe('Pull request number')
      }),
      func: async (input) => {
        const files = await github.getPullRequestFiles(input.owner, input.repo, input.pullNumber)
        return JSON.stringify(files.map(f => ({
          filename: f.filename,
          status: f.status,
          additions: f.additions,
          deletions: f.deletions,
          changes: f.changes,
          patch: f.patch
        })))
      }
    }),

    new DynamicStructuredTool({
      name: 'github_create_pr_review',
      description: 'Create a review on a pull request with overall feedback. Use this to approve, request changes, or comment on a PR.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        pullNumber: z.number().describe('Pull request number'),
        body: z.string().describe('Review comment body'),
        event: z.enum(['APPROVE', 'REQUEST_CHANGES', 'COMMENT']).optional().describe('Review action (defaults to COMMENT)')
      }),
      func: async (input) => {
        const review = await github.createPullRequestReview(input.owner, input.repo, input.pullNumber, input.body, input.event)
        return JSON.stringify({ id: review.id, state: review.state, body: review.body })
      }
    }),

    new DynamicStructuredTool({
      name: 'github_create_pr_comment',
      description: 'Add a comment to a specific line in a pull request file. Use this for inline code review comments.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        pullNumber: z.number().describe('Pull request number'),
        body: z.string().describe('Comment text'),
        commitId: z.string().describe('SHA of the commit to comment on'),
        path: z.string().describe('Relative path of the file to comment on'),
        line: z.number().describe('Line number in the diff to comment on')
      }),
      func: async (input) => {
        const comment = await github.createPullRequestReviewComment(
          input.owner, input.repo, input.pullNumber, input.body, input.commitId, input.path, input.line
        )
        return JSON.stringify({ id: comment.id, path: comment.path, line: comment.line, body: comment.body })
      }
    }),

    new DynamicStructuredTool({
      name: 'github_list_pr_comments',
      description: 'List all review comments on a pull request.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        pullNumber: z.number().describe('Pull request number')
      }),
      func: async (input) => {
        const comments = await github.listPullRequestComments(input.owner, input.repo, input.pullNumber)
        return JSON.stringify(comments.map(c => ({
          id: c.id,
          user: c.user?.login,
          body: c.body,
          path: c.path,
          line: c.line,
          created_at: c.created_at
        })))
      }
    })
  ]
}


// Additional tools for comprehensive GitHub management
export function createAdditionalGitHubTools(accessToken: string) {
  const github = new GitHubTools(accessToken)

  return [
    // Issue Management
    new DynamicStructuredTool({
      name: 'github_close_issue',
      description: 'Close an issue in a GitHub repository.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        issueNumber: z.number().describe('Issue number to close')
      }),
      func: async (input) => {
        const issue = await github.updateIssue(input.owner, input.repo, input.issueNumber, { state: 'closed' })
        return JSON.stringify({ number: issue.number, state: issue.state, message: 'Issue closed' })
      }
    }),

    new DynamicStructuredTool({
      name: 'github_reopen_issue',
      description: 'Reopen a closed issue in a GitHub repository.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        issueNumber: z.number().describe('Issue number to reopen')
      }),
      func: async (input) => {
        const issue = await github.updateIssue(input.owner, input.repo, input.issueNumber, { state: 'open' })
        return JSON.stringify({ number: issue.number, state: issue.state, message: 'Issue reopened' })
      }
    }),

    new DynamicStructuredTool({
      name: 'github_add_issue_comment',
      description: 'Add a comment to an issue.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        issueNumber: z.number().describe('Issue number'),
        body: z.string().describe('Comment text')
      }),
      func: async (input) => {
        const comment = await github.addIssueComment(input.owner, input.repo, input.issueNumber, input.body)
        return JSON.stringify({ id: comment.id, body: comment.body })
      }
    }),

    new DynamicStructuredTool({
      name: 'github_add_issue_labels',
      description: 'Add labels to an issue.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        issueNumber: z.number().describe('Issue number'),
        labels: z.array(z.string()).describe('Array of label names to add')
      }),
      func: async (input) => {
        await github.addLabelsToIssue(input.owner, input.repo, input.issueNumber, input.labels)
        return JSON.stringify({ message: 'Labels added successfully', labels: input.labels })
      }
    }),

    new DynamicStructuredTool({
      name: 'github_assign_issue',
      description: 'Assign users to an issue.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        issueNumber: z.number().describe('Issue number'),
        assignees: z.array(z.string()).describe('Array of usernames to assign')
      }),
      func: async (input) => {
        const result = await github.assignIssue(input.owner, input.repo, input.issueNumber, input.assignees)
        return JSON.stringify({ assignees: result.assignees?.map((a: any) => a.login) })
      }
    }),

    // Commit & History Tools
    new DynamicStructuredTool({
      name: 'github_list_commits',
      description: 'List commits in a repository. Can filter by branch or file path.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        sha: z.string().optional().describe('Branch name or commit SHA to start from'),
        path: z.string().optional().describe('Only commits containing this file path'),
        perPage: z.number().optional().describe('Number of commits to return (max 100)')
      }),
      func: async (input) => {
        const commits = await github.listCommits(input.owner, input.repo, {
          sha: input.sha,
          path: input.path,
          per_page: input.perPage
        })
        return JSON.stringify(commits.map(c => ({
          sha: c.sha,
          message: c.commit.message,
          author: c.commit.author?.name,
          date: c.commit.author?.date,
          url: c.html_url
        })))
      }
    }),

    new DynamicStructuredTool({
      name: 'github_get_commit',
      description: 'Get details of a specific commit including files changed.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        ref: z.string().describe('Commit SHA or branch name')
      }),
      func: async (input) => {
        const commit = await github.getCommit(input.owner, input.repo, input.ref)
        return JSON.stringify({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author?.name,
          stats: commit.stats,
          files: commit.files?.map(f => ({ filename: f.filename, status: f.status, changes: f.changes }))
        })
      }
    }),

    new DynamicStructuredTool({
      name: 'github_compare_commits',
      description: 'Compare two commits or branches to see differences.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        base: z.string().describe('Base branch or commit SHA'),
        head: z.string().describe('Head branch or commit SHA to compare')
      }),
      func: async (input) => {
        const comparison = await github.compareCommits(input.owner, input.repo, input.base, input.head)
        return JSON.stringify({
          status: comparison.status,
          ahead_by: comparison.ahead_by,
          behind_by: comparison.behind_by,
          total_commits: comparison.total_commits,
          files: comparison.files?.map(f => ({ filename: f.filename, status: f.status, changes: f.changes }))
        })
      }
    }),

    new DynamicStructuredTool({
      name: 'github_list_contributors',
      description: 'List contributors to a repository with their contribution counts.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name')
      }),
      func: async (input) => {
        const contributors = await github.listContributors(input.owner, input.repo)
        return JSON.stringify(contributors.map(c => ({
          login: c.login,
          contributions: c.contributions,
          avatar_url: c.avatar_url
        })))
      }
    }),

    // Repository Management Tools
    new DynamicStructuredTool({
      name: 'github_delete_repo',
      description: 'Delete a repository. Use with caution!',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name to delete')
      }),
      func: async (input) => {
        const result = await github.deleteRepository(input.owner, input.repo)
        return JSON.stringify(result)
      }
    }),

    new DynamicStructuredTool({
      name: 'github_get_repo_stats',
      description: 'Get repository statistics including stars, forks, watchers, and language.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name')
      }),
      func: async (input) => {
        const stats = await github.getRepositoryStats(input.owner, input.repo)
        return JSON.stringify(stats)
      }
    }),

    new DynamicStructuredTool({
      name: 'github_fork_repo',
      description: 'Fork a repository to your account.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name to fork')
      }),
      func: async (input) => {
        const fork = await github.forkRepository(input.owner, input.repo)
        return JSON.stringify({ name: fork.name, full_name: fork.full_name, url: fork.html_url })
      }
    }),

    new DynamicStructuredTool({
      name: 'github_star_repo',
      description: 'Star a repository.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name')
      }),
      func: async (input) => {
        const result = await github.starRepository(input.owner, input.repo)
        return JSON.stringify(result)
      }
    }),

    new DynamicStructuredTool({
      name: 'github_unstar_repo',
      description: 'Unstar a repository.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name')
      }),
      func: async (input) => {
        const result = await github.unstarRepository(input.owner, input.repo)
        return JSON.stringify(result)
      }
    }),

    // GitHub Actions Tools
    new DynamicStructuredTool({
      name: 'github_list_workflows',
      description: 'List all GitHub Actions workflows in a repository.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name')
      }),
      func: async (input) => {
        const workflows = await github.listWorkflows(input.owner, input.repo)
        return JSON.stringify(workflows.map(w => ({ id: w.id, name: w.name, path: w.path, state: w.state })))
      }
    }),

    new DynamicStructuredTool({
      name: 'github_trigger_workflow',
      description: 'Trigger a GitHub Actions workflow run.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        workflowId: z.union([z.number(), z.string()]).describe('Workflow ID or filename'),
        ref: z.string().describe('Branch or tag name to run workflow on')
      }),
      func: async (input) => {
        const result = await github.triggerWorkflow(input.owner, input.repo, input.workflowId, input.ref)
        return JSON.stringify(result)
      }
    }),

    new DynamicStructuredTool({
      name: 'github_list_workflow_runs',
      description: 'List workflow runs for a repository or specific workflow.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        workflowId: z.union([z.number(), z.string()]).optional().describe('Filter by workflow ID')
      }),
      func: async (input) => {
        const runs = await github.listWorkflowRuns(input.owner, input.repo, input.workflowId)
        return JSON.stringify(runs.map(r => ({
          id: r.id,
          name: r.name,
          status: r.status,
          conclusion: r.conclusion,
          created_at: r.created_at,
          url: r.html_url
        })))
      }
    }),

    new DynamicStructuredTool({
      name: 'github_get_workflow_run',
      description: 'Get details of a specific workflow run.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        runId: z.number().describe('Workflow run ID')
      }),
      func: async (input) => {
        const run = await github.getWorkflowRun(input.owner, input.repo, input.runId)
        return JSON.stringify({
          id: run.id,
          name: run.name,
          status: run.status,
          conclusion: run.conclusion,
          created_at: run.created_at,
          updated_at: run.updated_at,
          url: run.html_url
        })
      }
    }),

    // Releases Tools
    new DynamicStructuredTool({
      name: 'github_list_releases',
      description: 'List releases for a repository.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name')
      }),
      func: async (input) => {
        const releases = await github.listReleases(input.owner, input.repo)
        return JSON.stringify(releases.map(r => ({
          id: r.id,
          tag_name: r.tag_name,
          name: r.name,
          draft: r.draft,
          prerelease: r.prerelease,
          created_at: r.created_at,
          url: r.html_url
        })))
      }
    }),

    new DynamicStructuredTool({
      name: 'github_create_release',
      description: 'Create a new release for a repository.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        tagName: z.string().describe('Git tag name for the release'),
        name: z.string().optional().describe('Release name'),
        body: z.string().optional().describe('Release description/notes'),
        draft: z.boolean().optional().describe('Create as draft'),
        prerelease: z.boolean().optional().describe('Mark as prerelease')
      }),
      func: async (input) => {
        const release = await github.createRelease(input.owner, input.repo, input.tagName, {
          name: input.name,
          body: input.body,
          draft: input.draft,
          prerelease: input.prerelease
        })
        return JSON.stringify({ id: release.id, tag_name: release.tag_name, url: release.html_url })
      }
    }),

    // Collaboration Tools
    new DynamicStructuredTool({
      name: 'github_list_collaborators',
      description: 'List collaborators for a repository.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name')
      }),
      func: async (input) => {
        const collaborators = await github.listCollaborators(input.owner, input.repo)
        return JSON.stringify(collaborators.map(c => ({ login: c.login, permissions: c.permissions })))
      }
    }),

    new DynamicStructuredTool({
      name: 'github_add_collaborator',
      description: 'Add a collaborator to a repository with specific permissions.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        username: z.string().describe('Username to add as collaborator'),
        permission: z.enum(['pull', 'push', 'admin', 'maintain', 'triage']).optional().describe('Permission level')
      }),
      func: async (input) => {
        const result = await github.addCollaborator(input.owner, input.repo, input.username, input.permission)
        return JSON.stringify(result)
      }
    }),

    new DynamicStructuredTool({
      name: 'github_remove_collaborator',
      description: 'Remove a collaborator from a repository.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name'),
        username: z.string().describe('Username to remove')
      }),
      func: async (input) => {
        const result = await github.removeCollaborator(input.owner, input.repo, input.username)
        return JSON.stringify(result)
      }
    }),

    // Code Search Tools
    new DynamicStructuredTool({
      name: 'github_search_code',
      description: 'Search for code across GitHub repositories.',
      schema: z.object({
        query: z.string().describe('Search query'),
        owner: z.string().optional().describe('Limit search to specific owner'),
        repo: z.string().optional().describe('Limit search to specific repository')
      }),
      func: async (input) => {
        const results = await github.searchCode(input.query, input.owner, input.repo)
        return JSON.stringify(results.map(r => ({
          name: r.name,
          path: r.path,
          repository: r.repository.full_name,
          url: r.html_url
        })))
      }
    }),

    new DynamicStructuredTool({
      name: 'github_get_repo_languages',
      description: 'Get programming languages used in a repository with byte counts.',
      schema: z.object({
        owner: z.string().describe('Repository owner username'),
        repo: z.string().describe('Repository name')
      }),
      func: async (input) => {
        const languages = await github.getRepositoryLanguages(input.owner, input.repo)
        return JSON.stringify(languages)
      }
    })
  ]
}
