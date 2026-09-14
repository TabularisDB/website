import type {ReactNode} from 'react';
import {ClaudeIcon, CursorIcon, DevinIcon, McpIcon} from './icons/AgentIcons';
import {PostgreSQLIcon, MySQLIcon, SQLiteIcon, MongoDBIcon, RedisIcon} from '@/components/ui/Icons/PluginIcons';

export interface DiagramItem {
    label: string;
    icon?: ReactNode;
    variant?: 'plugin';
}

export const AI_AGENTS: DiagramItem[] = [
    {label: 'Claude', icon: <ClaudeIcon />},
    {label: 'Cursor', icon: <CursorIcon />},
    {label: 'Devin', icon: <DevinIcon />},
    {label: 'Your agent', icon: <McpIcon />},
];

export const NATIVE_DATABASES: DiagramItem[] = [
    {label: 'PostgreSQL', icon: <PostgreSQLIcon />},
    {label: 'MySQL', icon: <MySQLIcon />},
    {label: 'SQLite', icon: <SQLiteIcon />},
];

export const PLUGIN_DATABASES: DiagramItem[] = [
    {label: 'MongoDB', icon: <MongoDBIcon />, variant: 'plugin'},
    {label: 'Redis', icon: <RedisIcon />, variant: 'plugin'},
    {label: '+10 more', variant: 'plugin'},
];
