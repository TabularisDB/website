import styles from './CategoryLabel.module.scss';
import {WikiCategory} from '@/lib/wiki';
import {Rocket, LayoutGrid, Database, Shield, Bot, Plug, Settings2, BookOpen} from 'lucide-react';
import {ReactNode} from 'react';

export const CATEGORY_ICONS: Record<WikiCategory, ReactNode> = {
    'Getting Started': <Rocket size={18} />,
    'Core Features': <LayoutGrid size={18} />,
    'Database Objects': <Database size={18} />,
    'Security & Networking': <Shield size={18} />,
    'AI & MCP': <Bot size={18} />,
    Integration: <Plug size={18} />,
    Customization: <Settings2 size={18} />,
    Reference: <BookOpen size={18} />,
};

export function CategoryLabel({category}: {category: WikiCategory}) {
    return (
        <span className={styles.label}>
            {CATEGORY_ICONS[category]}
            {category}
        </span>
    );
}
