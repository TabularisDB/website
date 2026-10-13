import {cleanIssueTitle, formatIssueDate, labelTextColor, type CommunityIssue} from '@/lib/community';
import {GitPullRequestIcon, MessageSquareIcon} from 'lucide-react';
import Image from 'next/image';
import {Card} from '@/components/ui/Card/Card';
import styles from './IssueCard.module.scss';

export function IssueCard({issue}: {issue: CommunityIssue}) {
    const title = cleanIssueTitle(issue.title);

    return (
        <Card>
            <Card.Header
                icon={
                    <Card.Label>
                        {issue.repo} #{issue.number}
                    </Card.Label>
                }
                aside={
                    issue.pullRequests.length > 0 && (
                        <span
                            className={styles.pullRequests}
                            title={issue.pullRequests.map((pr) => `#${pr.number}`).join(', ')}
                        >
                            <GitPullRequestIcon aria-hidden="true" />
                            {issue.pullRequests.length} open {issue.pullRequests.length === 1 ? 'PR' : 'PRs'}
                        </span>
                    )
                }
            />

            <Card.Title>{title}</Card.Title>
            <Card.Link href={issue.url} ariaLabel={title} />

            {issue.labels.length > 0 && (
                <ul className={styles.labels}>
                    {issue.labels.map((label) => (
                        <li
                            key={label.name}
                            className={styles.label}
                            style={{background: `#${label.color}`, color: labelTextColor(label.color)}}
                        >
                            {label.name}
                        </li>
                    ))}
                </ul>
            )}

            <div className={styles.footer}>
                <span>Opened {formatIssueDate(issue.createdAt)}</span>
                {issue.comments > 0 && (
                    <span className={styles.footerItem}>
                        <MessageSquareIcon aria-hidden="true" />
                        {issue.comments}
                    </span>
                )}
                {issue.assignees.length > 0 && (
                    <span className={styles.footerItem}>
                        Claimed by
                        <span className={styles.assignees}>
                            {issue.assignees.map((assignee) => (
                                <a
                                    key={assignee.login}
                                    href={`https://github.com/${assignee.login}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.assignee}
                                    title={`@${assignee.login}`}
                                >
                                    <Image
                                        src={`${assignee.avatarUrl}${assignee.avatarUrl.includes('?') ? '&' : '?'}s=48`}
                                        alt={`@${assignee.login}`}
                                        width={22}
                                        height={22}
                                        className={styles.avatar}
                                    />
                                </a>
                            ))}
                        </span>
                    </span>
                )}
            </div>
        </Card>
    );
}
