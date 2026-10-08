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

/** A contributor of the leaderboard; `team` marks org members and owners. */
export interface ContributorProfile {
    avatarUrl: string;
    team: boolean;
}

/**
 * A public PR or issue opened across the org. PR states: merged, self-merged
 * (merged by its own author), open, draft or closed (unmerged). Issue states:
 * open, closed, rejected (not planned, duplicate, invalid, …) or withdrawn
 * (closed by its own author).
 */
export interface Contribution {
    type: 'pr' | 'issue';
    repo: string;
    number: number;
    title: string;
    author: string;
    createdAt: string;
    state: 'merged' | 'self-merged' | 'open' | 'draft' | 'closed' | 'rejected' | 'withdrawn';
    /** PRs only: when it was merged. */
    mergedAt?: string;
    /** Login of whoever closed the issue or merged the PR, when known. */
    closedBy?: string;
    /** Issues only: a maintainer added a label beyond the issue form's own. */
    triaged?: boolean;
    /** GitHub flagged this as the author's first contribution to the repo. */
    firstTime: boolean;
}
