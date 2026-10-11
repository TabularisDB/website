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
 * A public PR or issue opened across the org, or a plugin published to the
 * Tabularium registry from the author's own GitHub repo. PR states: merged,
 * self-merged (merged by its own author), open, draft or closed (unmerged).
 * Issue states: open, closed, rejected (not planned, duplicate, invalid, …) or
 * withdrawn (closed by its own author, by hand or through their own PR).
 * Plugins are always published: the registry lists approved plugins only.
 */
export interface Contribution {
    type: 'pr' | 'issue' | 'plugin';
    /** The repo name; the plugin id for plugins. */
    repo: string;
    /** PRs and issues only. */
    number?: number;
    title: string;
    author: string;
    createdAt: string;
    state: 'merged' | 'self-merged' | 'open' | 'draft' | 'closed' | 'rejected' | 'withdrawn' | 'published';
    /** Plugins only: the registry kind ("driver", "theme", …). */
    kind?: string;
    /** Plugins only: the plugin's registry page. */
    url?: string;
    /** PRs only: when it was merged. */
    mergedAt?: string;
    /** Login of whoever closed the issue or merged the PR, when known. */
    closedBy?: string;
    /**
     * Self-merged PRs only: someone else who approved it before the merge, null
     * when nobody did, absent until looked up.
     */
    approvedBy?: string | null;
    /**
     * Closed issues only: author of the merged PR that closed the issue, null
     * when it was closed another way, absent until looked up. The author's own
     * PR makes the issue withdrawn.
     */
    closingPrAuthor?: string | null;
    /** Issues only: a maintainer added a label beyond the issue form's own. */
    triaged?: boolean;
    /** Issues only: the author maintains the repo, so the triage label may be their own. */
    maintainer?: boolean;
    /** GitHub flagged this as the author's first contribution to the repo. */
    firstTime: boolean;
}
