import type {ReactNode} from 'react';
import {Card} from '@/components/ui/Card/Card';
import {CardGrid} from '@/components/ui/CardGrid/CardGrid';

export interface SolutionGridItem {
    slug: string;
    href: string;
    title: string;
    excerpt: string;
    icon: ReactNode;
}

export function SolutionsGrid({items}: {items: SolutionGridItem[]}) {
    return (
        <CardGrid variant="joined">
            {items.map((item) => (
                <Card key={item.slug}>
                    <Card.Header icon={item.icon} />
                    <Card.Content>
                        <Card.Title>{item.title}</Card.Title>
                        <Card.Description>{item.excerpt}</Card.Description>
                    </Card.Content>
                    <Card.Link href={item.href} ariaLabel={`Learn more about ${item.title}`}>
                        Learn more
                    </Card.Link>
                </Card>
            ))}
        </CardGrid>
    );
}
