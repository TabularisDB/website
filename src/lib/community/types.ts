export interface CommunityIssueLabel {
    name: string;
    color: string;
}

export interface CommunityIssueAssignee {
    login: string;
    avatarUrl: string;
}

export interface CommunityIssue {
    repo: string;
    number: number;
    title: string;
    url: string;
    labels: CommunityIssueLabel[];
    kind: 'bug' | 'feature' | null;
    assignees: CommunityIssueAssignee[];
    comments: number;
    createdAt: string;
}
