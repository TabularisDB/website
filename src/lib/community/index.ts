import {COMMUNITY_ISSUES, FEATURED_LABELS, ISSUES_FETCHED_AT, ISSUES_ORG} from './issues';
import type {CommunityIssueLabel} from './types';

export type {CommunityIssue, CommunityIssueAssignee, CommunityIssueLabel} from './types';
export {COMMUNITY_ISSUES, FEATURED_LABELS, ISSUES_FETCHED_AT, ISSUES_ORG};

export interface LabelCount extends CommunityIssueLabel {
    count: number;
}

/** Issue titles come from the app's issue forms ("[Bug]: …", "[Feat]: …"); the board shows the kind as a tag instead. */
export function cleanIssueTitle(title: string): string {
    return title.replace(/^\[[^\]]+\]:?\s*/, '');
}

/** GitHub search URL for the open issues of the org, optionally narrowed to one label. */
export function issueSearchUrl(label?: string): string {
    const q = `org:${ISSUES_ORG} is:issue is:open${label ? ` label:"${label}"` : ''}`;
    return `https://github.com/search?type=issues&q=${encodeURIComponent(q)}`;
}

/** Every label used by an open issue, featured labels first, then by issue count. */
export function getIssueLabels(): LabelCount[] {
    const counts = new Map<string, LabelCount>();
    for (const issue of COMMUNITY_ISSUES) {
        for (const label of issue.labels) {
            const entry = counts.get(label.name) ?? {...label, count: 0};
            entry.count += 1;
            counts.set(label.name, entry);
        }
    }
    const rank = (name: string) => {
        const i = FEATURED_LABELS.indexOf(name);
        return i === -1 ? FEATURED_LABELS.length : i;
    };
    return [...counts.values()].sort(
        (a, b) => rank(a.name) - rank(b.name) || b.count - a.count || a.name.localeCompare(b.name),
    );
}

export function getIssueStats() {
    return {
        total: COMMUNITY_ISSUES.length,
        repos: new Set(COMMUNITY_ISSUES.map((issue) => issue.repo)).size,
        goodFirst: COMMUNITY_ISSUES.filter((issue) => issue.labels.some((l) => l.name === 'good first issue')).length,
    };
}
