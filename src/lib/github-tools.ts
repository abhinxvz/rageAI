import { Octokit } from "@octokit/rest"

export class GitHubTools {
  private octokit: Octokit

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken
    })
  }

  async getUser() {
    const { data } = await this.octokit.users.getAuthenticated()
    return data
  }

  async listRepositories(options?: { visibility?: 'all' | 'public' | 'private', sort?: 'created' | 'updated' | 'pushed' | 'full_name' }) {
    const { data } = await this.octokit.repos.listForAuthenticatedUser({
      visibility: options?.visibility || 'all',
      sort: options?.sort || 'updated',
      per_page: 100
    })
    return data
  }

  async getRepository(owner: string, repo: string) {
    const { data } = await this.octokit.repos.get({
      owner,
      repo
    })
    return data
  }

  async createRepository(name: string, options?: {
    description?: string
    private?: boolean
    auto_init?: boolean
  }) {
    const { data } = await this.octokit.repos.createForAuthenticatedUser({
      name,
      description: options?.description,
      private: options?.private || false,
      auto_init: options?.auto_init || true
    })
    return data
  }

  async createIssue(owner: string, repo: string, title: string, body?: string, labels?: string[]) {
    const { data } = await this.octokit.issues.create({
      owner,
      repo,
      title,
      body,
      labels
    })
    return data
  }

  async listIssues(owner: string, repo: string, options?: {
    state?: 'open' | 'closed' | 'all'
    labels?: string
  }) {
    const { data } = await this.octokit.issues.listForRepo({
      owner,
      repo,
      state: options?.state || 'open',
      labels: options?.labels,
      per_page: 100
    })
    return data
  }

  async createPullRequest(owner: string, repo: string, title: string, head: string, base: string, body?: string) {
    const { data } = await this.octokit.pulls.create({
      owner,
      repo,
      title,
      head,
      base,
      body
    })
    return data
  }

  async listPullRequests(owner: string, repo: string, state?: 'open' | 'closed' | 'all') {
    const { data } = await this.octokit.pulls.list({
      owner,
      repo,
      state: state || 'open',
      per_page: 100
    })
    return data
  }

  async getPullRequest(owner: string, repo: string, pullNumber: number) {
    const { data } = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber
    })
    return data
  }

  async getPullRequestFiles(owner: string, repo: string, pullNumber: number) {
    const { data } = await this.octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber
    })
    return data
  }

  async createPullRequestReview(owner: string, repo: string, pullNumber: number, body: string, event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT' = 'COMMENT') {
    const { data } = await this.octokit.pulls.createReview({
      owner,
      repo,
      pull_number: pullNumber,
      body,
      event
    })
    return data
  }

  async createPullRequestReviewComment(owner: string, repo: string, pullNumber: number, body: string, commitId: string, path: string, line: number) {
    const { data } = await this.octokit.pulls.createReviewComment({
      owner,
      repo,
      pull_number: pullNumber,
      body,
      commit_id: commitId,
      path,
      line
    })
    return data
  }

  async listPullRequestComments(owner: string, repo: string, pullNumber: number) {
    const { data } = await this.octokit.pulls.listReviewComments({
      owner,
      repo,
      pull_number: pullNumber
    })
    return data
  }

  async getFileContent(owner: string, repo: string, path: string) {
    const { data } = await this.octokit.repos.getContent({
      owner,
      repo,
      path
    })
    return data
  }

  async createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string
  ) {
    const { data } = await this.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      sha
    })
    return data
  }

  async searchRepositories(query: string) {
    const { data } = await this.octokit.search.repos({
      q: query,
      per_page: 30
    })
    return data.items
  }

  async listBranches(owner: string, repo: string) {
    const { data } = await this.octokit.repos.listBranches({
      owner,
      repo,
      per_page: 100
    })
    return data
  }

  async createBranch(owner: string, repo: string, branchName: string, fromBranch: string = 'main') {
    const { data: refData } = await this.octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${fromBranch}`
    })

    const { data } = await this.octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: refData.object.sha
    })
    return data
  }

  async deleteFile(owner: string, repo: string, path: string, message: string, sha: string) {
    const { data } = await this.octokit.repos.deleteFile({
      owner,
      repo,
      path,
      message,
      sha
    })
    return data
  }

  async deleteRepository(owner: string, repo: string) {
    await this.octokit.repos.delete({
      owner,
      repo
    })
    return { success: true, message: `Repository ${owner}/${repo} deleted successfully` }
  }

  async listFiles(owner: string, repo: string, path: string = '') {
    const { data } = await this.octokit.repos.getContent({
      owner,
      repo,
      path
    })
    return data
  }

  // Issue Management
  async updateIssue(owner: string, repo: string, issueNumber: number, options: { state?: 'open' | 'closed', title?: string, body?: string, labels?: string[] }) {
    const { data } = await this.octokit.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      ...options
    })
    return data
  }

  async addIssueComment(owner: string, repo: string, issueNumber: number, body: string) {
    const { data } = await this.octokit.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body
    })
    return data
  }

  async addLabelsToIssue(owner: string, repo: string, issueNumber: number, labels: string[]) {
    const { data } = await this.octokit.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels
    })
    return data
  }

  async assignIssue(owner: string, repo: string, issueNumber: number, assignees: string[]) {
    const { data } = await this.octokit.issues.addAssignees({
      owner,
      repo,
      issue_number: issueNumber,
      assignees
    })
    return data
  }

  // Repository Management  
  async getRepositoryStats(owner: string, repo: string) {
    const { data } = await this.octokit.repos.get({
      owner,
      repo
    })
    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      watchers: data.watchers_count,
      open_issues: data.open_issues_count,
      language: data.language,
      size: data.size
    }
  }

  async forkRepository(owner: string, repo: string) {
    const { data } = await this.octokit.repos.createFork({
      owner,
      repo
    })
    return data
  }

  async starRepository(owner: string, repo: string) {
    await this.octokit.activity.starRepoForAuthenticatedUser({
      owner,
      repo
    })
    return { success: true, message: 'Repository starred' }
  }

  async unstarRepository(owner: string, repo: string) {
    await this.octokit.activity.unstarRepoForAuthenticatedUser({
      owner,
      repo
    })
    return { success: true, message: 'Repository unstarred' }
  }

  // Commit & History
  async listCommits(owner: string, repo: string, options?: { sha?: string, path?: string, per_page?: number }) {
    const { data } = await this.octokit.repos.listCommits({
      owner,
      repo,
      sha: options?.sha,
      path: options?.path,
      per_page: options?.per_page || 30
    })
    return data
  }

  async getCommit(owner: string, repo: string, ref: string) {
    const { data } = await this.octokit.repos.getCommit({
      owner,
      repo,
      ref
    })
    return data
  }

  async compareCommits(owner: string, repo: string, base: string, head: string) {
    const { data } = await this.octokit.repos.compareCommits({
      owner,
      repo,
      base,
      head
    })
    return data
  }

  async listContributors(owner: string, repo: string) {
    const { data } = await this.octokit.repos.listContributors({
      owner,
      repo,
      per_page: 100
    })
    return data
  }

  // Collaboration
  async addCollaborator(owner: string, repo: string, username: string, permission: 'pull' | 'push' | 'admin' | 'maintain' | 'triage' = 'push') {
    await this.octokit.repos.addCollaborator({
      owner,
      repo,
      username,
      permission
    })
    return { success: true, message: `${username} added as collaborator` }
  }

  async removeCollaborator(owner: string, repo: string, username: string) {
    await this.octokit.repos.removeCollaborator({
      owner,
      repo,
      username
    })
    return { success: true, message: `${username} removed as collaborator` }
  }

  async listCollaborators(owner: string, repo: string) {
    const { data } = await this.octokit.repos.listCollaborators({
      owner,
      repo
    })
    return data
  }

  // GitHub Actions
  async listWorkflows(owner: string, repo: string) {
    const { data } = await this.octokit.actions.listRepoWorkflows({
      owner,
      repo
    })
    return data.workflows
  }

  async triggerWorkflow(owner: string, repo: string, workflowId: number | string, ref: string, inputs?: Record<string, any>) {
    await this.octokit.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: workflowId,
      ref,
      inputs
    })
    return { success: true, message: 'Workflow triggered' }
  }

  async listWorkflowRuns(owner: string, repo: string, workflowId?: number | string) {
    const params: any = {
      owner,
      repo,
      per_page: 30
    }
    if (workflowId) {
      params.workflow_id = workflowId
    }
    const { data } = await this.octokit.actions.listWorkflowRuns(params)
    return data.workflow_runs
  }

  async getWorkflowRun(owner: string, repo: string, runId: number) {
    const { data } = await this.octokit.actions.getWorkflowRun({
      owner,
      repo,
      run_id: runId
    })
    return data
  }

  // Releases & Tags
  async listReleases(owner: string, repo: string) {
    const { data } = await this.octokit.repos.listReleases({
      owner,
      repo,
      per_page: 30
    })
    return data
  }

  async createRelease(owner: string, repo: string, tagName: string, options: { name?: string, body?: string, draft?: boolean, prerelease?: boolean }) {
    const { data } = await this.octokit.repos.createRelease({
      owner,
      repo,
      tag_name: tagName,
      name: options.name,
      body: options.body,
      draft: options.draft,
      prerelease: options.prerelease
    })
    return data
  }

  async createTag(owner: string, repo: string, tag: string, message: string, object: string, type: 'commit' | 'tree' | 'blob' = 'commit') {
    const { data } = await this.octokit.git.createTag({
      owner,
      repo,
      tag,
      message,
      object,
      type
    })
    return data
  }

  // Code Search
  async searchCode(query: string, owner?: string, repo?: string) {
    const q = owner && repo ? `${query} repo:${owner}/${repo}` : query
    const { data } = await this.octokit.search.code({
      q,
      per_page: 30
    })
    return data.items
  }

  async getRepositoryLanguages(owner: string, repo: string) {
    const { data } = await this.octokit.repos.listLanguages({
      owner,
      repo
    })
    return data
  }
}
