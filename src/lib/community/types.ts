export interface CommunityIssueLabel {
    name: string;
    color: string;
}

export interface CommunityIssue {
    repo: string;
    number: number;
    title: string;
    url: string;
    labels: CommunityIssueLabel[];
    kind: 'bug' | 'feature' | null;
    assigned: boolean;
    comments: number;
    createdAt: string;
}
