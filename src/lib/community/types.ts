export interface CommunityIssueLabel {
    name: string;
    color: string;
}

export interface CommunityIssueAssignee {
    login: string;
    avatarUrl: string;
}

/** An open, non-bot PR whose title or body closes the issue ("fixes #N"). */
export interface CommunityIssuePullRequest {
    number: number;
    url: string;
    author: string | null;
}

export interface CommunityIssue {
    repo: string;
    number: number;
    title: string;
    url: string;
    labels: CommunityIssueLabel[];
    kind: 'bug' | 'feature' | null;
    assignees: CommunityIssueAssignee[];
    pullRequests: CommunityIssuePullRequest[];
    comments: number;
    createdAt: string;
}

/** Repos of the issue board's project filter, grouped by registry kind ("app", "driver", "theme", …). */
export interface CommunityProjectGroup {
    kind: string;
    label: string;
    repos: string[];
}
