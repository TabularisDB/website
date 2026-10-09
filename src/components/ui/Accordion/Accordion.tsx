import {Plus, type LucideIcon} from 'lucide-react';
import type {ReactNode} from 'react';
import styles from './Accordion.module.scss';

export interface AccordionItem {
    question: string;
    answer: ReactNode;
    icon?: LucideIcon;
}

export function Accordion({items}: {items: AccordionItem[]}) {
    return (
        <div className={styles.accordion}>
            {items.map(({question, answer, icon: Icon}) => (
                <details key={question} className={styles.item}>
                    <summary className={styles.question}>
                        <span className={styles.label}>
                            {Icon && <Icon size={18} className={styles.questionIcon} aria-hidden="true" />}
                            {question}
                        </span>
                        <Plus size={16} className={styles.icon} aria-hidden="true" />
                    </summary>
                    <div className={styles.answer}>{answer}</div>
                </details>
            ))}
        </div>
    );
}
