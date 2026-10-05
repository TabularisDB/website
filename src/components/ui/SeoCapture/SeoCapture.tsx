import {NewsletterForm} from '@/components/ui/NewsletterForm/NewsletterForm';
import styles from './SeoCapture.module.scss';

interface SeoCaptureProps {
    section: 'solutions' | 'compare';
    title: string;
}

const SOLUTION_SUBJECTS: [keywords: string[], subject: string][] = [
    [['mcp', 'ai'], 'AI agent and MCP database workflows'],
    [['explain'], 'visual query optimization and EXPLAIN workflows'],
    [['builder'], 'visual query builder workflows'],
    [['notebook'], 'SQL notebook and reusable analysis workflows'],
    [['postgres'], 'PostgreSQL developer workflows'],
    [['mysql'], 'MySQL and MariaDB workflows'],
    [['sqlite'], 'SQLite workflows'],
    [['secure', 'tunnel'], 'secure database access and SSH tunneling workflows'],
    [['plugin'], 'plugin-based database client extensibility'],
];

function getCompareSubject(title: string): string {
    const cleaned = title
        .replace(/alternative for developers/i, '')
        .replace(/alternative/i, '')
        .replace(/tabularis\s+vs\.?\s+/i, '')
        .trim();
    return cleaned || 'these database clients';
}

function getSolutionSubject(title: string): string {
    const lower = title.toLowerCase();
    const match = SOLUTION_SUBJECTS.find(([keywords]) => keywords.some((keyword) => lower.includes(keyword)));
    return match?.[1] ?? 'this database workflow';
}

export function SeoCapture({section, title}: SeoCaptureProps) {
    const isCompare = section === 'compare';

    return (
        <div className={styles.capture}>
            <NewsletterForm
                title={isCompare ? 'Get the evaluation checklist' : 'Get the workflow guide'}
                description={
                    isCompare
                        ? `Evaluating ${getCompareSubject(title)}? Get release notes, practical evaluation prompts, and product updates without chasing every changelog.`
                        : `Exploring ${getSolutionSubject(title)}? Get practical setup notes, release updates, and workflow tips as Tabularis evolves.`
                }
                buttonLabel={isCompare ? 'Send checklist' : 'Send guide'}
            />
        </div>
    );
}
