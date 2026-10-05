import {ArrowRight} from 'lucide-react';
import {Button} from '@/components/ui/Button/Button';
import styles from './TransitionBlock.module.scss';

export interface TransitionBlockProps {
    title: string;
    text: string;
    buttonHref: string;
    buttonText: string;
}

export function TransitionBlock({title, text, buttonHref, buttonText}: TransitionBlockProps) {
    return (
        <div className={styles.transitionBlock}>
            <h3 className={styles.transitionTitle}>{title}</h3>
            <p className={styles.transitionText}>{text}</p>
            <Button href={buttonHref}>
                {buttonText} <ArrowRight size={16} />
            </Button>
        </div>
    );
}
