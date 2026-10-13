import clsx from 'clsx';
import {ArrowRightIcon, ArrowUpRightIcon} from 'lucide-react';
import Link from 'next/link';
import type {ReactNode} from 'react';
import styles from './Card.module.scss';

interface CardPartProps {
    children?: ReactNode;
    className?: string;
}

export function Card({children, className}: CardPartProps) {
    return <article className={clsx(styles.card, className)}>{children}</article>;
}

function CardCover({children, className}: CardPartProps) {
    return <div className={clsx(styles.cover, className)}>{children}</div>;
}

function CardBody({children, className}: CardPartProps) {
    return <div className={clsx(styles.body, className)}>{children}</div>;
}

interface CardHeaderProps {
    icon?: ReactNode;
    aside?: ReactNode;
    className?: string;
}

function CardHeader({icon, aside, className}: CardHeaderProps) {
    return (
        <div className={clsx(styles.header, className)}>
            {icon && <span className={styles.icon}>{icon}</span>}
            {aside && <div className={styles.aside}>{aside}</div>}
        </div>
    );
}

function CardLabel({children, className}: CardPartProps) {
    return <span className={clsx(styles.label, className)}>{children}</span>;
}

function CardContent({children, className}: CardPartProps) {
    return <div className={clsx(styles.content, className)}>{children}</div>;
}

interface CardTitleProps extends CardPartProps {
    as?: 'h2' | 'h3' | 'h4';
}

function CardTitle({children, as: Title = 'h3', className}: CardTitleProps) {
    return <Title className={clsx(styles.title, className)}>{children}</Title>;
}

function CardDescription({children, className}: CardPartProps) {
    return <p className={clsx(styles.description, className)}>{children}</p>;
}

function CardMeta({children, className}: CardPartProps) {
    return <div className={clsx(styles.meta, className)}>{children}</div>;
}

interface CardMetaItemProps extends CardPartProps {
    icon?: ReactNode;
    title?: string;
}

function CardMetaItem({icon, title, children, className}: CardMetaItemProps) {
    return (
        <span className={clsx(styles.metaItem, className)} title={title}>
            {icon}
            {children}
        </span>
    );
}

interface CardLinkProps {
    children?: ReactNode;
    href?: string;
    onClick?: () => void;
    ariaLabel?: string;
    stretched?: boolean;
    className?: string;
}

function CardLink({children, href, onClick, ariaLabel, stretched = true, className}: CardLinkProps) {
    const external = href?.startsWith('http');
    const Icon = external ? ArrowUpRightIcon : ArrowRightIcon;
    const props = {
        className: clsx(children ? styles.link : styles.coverLink, !stretched && styles.inline, className),
        'aria-label': ariaLabel,
        onClick,
    };
    const content = children && (
        <>
            {children} <Icon aria-hidden="true" />
        </>
    );

    if (href && external) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {content}
            </a>
        );
    }

    if (href) {
        return (
            <Link href={href} {...props}>
                {content}
            </Link>
        );
    }

    return (
        <button type="button" {...props}>
            {content}
        </button>
    );
}

Card.Cover = CardCover;
Card.Body = CardBody;
Card.Header = CardHeader;
Card.Label = CardLabel;
Card.Content = CardContent;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Meta = CardMeta;
Card.MetaItem = CardMetaItem;
Card.Link = CardLink;
