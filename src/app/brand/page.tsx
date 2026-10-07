import Image from 'next/image';
import {JsonLd} from '@/components/layout/JsonLd';
import {Button} from '@/components/ui/Button/Button';
import {CopyButton} from '@/components/ui/CopyButton/CopyButton';
import {buildBreadcrumbJsonLd} from '@/lib/seo';
import {ArrowUpRight, ArrowUpRightIcon, Box, CopyIcon, Download, Droplet, Palette, Shapes, Type} from 'lucide-react';
import type {Metadata} from 'next';
import styles from './BrandPage.module.scss';

import {ogImages} from '@/lib/og/registry';

const path = '/brand';
const title = 'Brand assets | Tabularis';

export const metadata: Metadata = {
    title,
    description:
        'Download the Tabularis logo, icon and fonts in SVG and PNG, in color, white and black, with the brand colors.',
    alternates: {canonical: path},
    openGraph: {
        type: 'website',
        url: path,
        title,
        description: 'Logos, icons, fonts and colors for press, partners and community projects.',
        images: ogImages(path, 'Tabularis brand assets: logos, icons, colors and fonts to download'),
    },
    twitter: {card: 'summary_large_image'},
};

const BRAND_DIR = '/img/brand';

const VARIANTS = [
    {id: 'color', label: 'Color', tone: 'dark'},
    {id: 'black', label: 'Black', tone: 'white'},
    {id: 'white', label: 'White', tone: 'gray'},
] as const;

const ASSET_GROUPS = [
    {type: 'logo', title: 'The full logo, for any background', icon: Shapes},
    {type: 'icon', title: 'The icon, for tight spaces', icon: Box},
] as const;

const FONTS = [
    {
        name: 'Urbanist',
        usage: 'Headings & interface',
        sample: 'The open-source database client.',
        className: styles.fontSans,
        url: 'https://fonts.google.com/specimen/Urbanist',
    },
    {
        name: 'JetBrains Mono',
        usage: 'Code & data',
        sample: 'SELECT * FROM users;',
        className: styles.fontMono,
        url: 'https://fonts.google.com/specimen/JetBrains+Mono',
    },
];

const COLORS = [
    {name: 'Teal', hex: '#35d0c0'},
    {name: 'Blue', hex: '#2563eb'},
    {name: 'White', hex: '#eef0f3'},
    {name: 'Black', hex: '#030712'},
];

export default function BrandPage() {
    return (
        <div className="container with-gap">
            <JsonLd
                data={[
                    buildBreadcrumbJsonLd([
                        {name: 'Home', path: '/'},
                        {name: 'Brand assets', path: '/brand'},
                    ]),
                ]}
            />

            <header className="page-header">
                <span className="eyebrow">
                    <Palette />
                    Brand assets
                </span>
                <h1 className="title">The Tabularis brand kit.</h1>
                <p className="description">
                    Logos, icons, fonts and colors for articles, talks and community projects. Please don&apos;t
                    distort, recolor or crop the marks.
                </p>
                <Button href={`${BRAND_DIR}/tabularis-brand-kit.zip`} external download className={styles.downloadAll}>
                    <Download />
                    Download all assets
                </Button>
            </header>

            <div className={styles.categoriesWrapper}>
                {ASSET_GROUPS.map(({type, title, icon: GroupIcon}) => (
                    <section key={type} className={styles.category}>
                        <h2 className={styles.categoryTitle}>
                            <GroupIcon className={styles.categoryIcon} />
                            {title}
                        </h2>

                        <div className={`${styles.grid} ${styles.assetsGrid}`}>
                            {VARIANTS.map((variant) => {
                                const file = `${BRAND_DIR}/tabularis-${type}-${variant.id}`;

                                return (
                                    <article key={variant.id} className={styles.card}>
                                        <div className={styles.preview} data-tone={variant.tone}>
                                            <Image
                                                src={`${file}.svg`}
                                                alt={`Tabularis ${title.toLowerCase()}, ${variant.label.toLowerCase()}`}
                                                width={type === 'logo' ? 2400 : 1024}
                                                height={type === 'logo' ? 489 : 1024}
                                                className={type === 'logo' ? styles.logo : styles.icon}
                                            />
                                        </div>

                                        <div className={styles.cardFooter}>
                                            <span className={styles.cardName}>{variant.label}</span>
                                            <div className={styles.downloads}>
                                                <a href={`${file}.svg`} download className={styles.download}>
                                                    SVG <ArrowUpRightIcon />
                                                </a>
                                                <a href={`${file}.png`} download className={styles.download}>
                                                    PNG <ArrowUpRightIcon />
                                                </a>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                ))}

                <section className={styles.category}>
                    <h2 className={styles.categoryTitle}>
                        <Type className={styles.categoryIcon} />
                        Two typefaces, one voice
                    </h2>

                    <div className={`${styles.grid} ${styles.fontsGrid}`}>
                        {FONTS.map((font) => (
                            <article key={font.name} className={styles.card}>
                                <div className={`${styles.preview} ${font.className}`} data-tone="dark">
                                    <span className={styles.fontGlyph}>Aa</span>
                                    <span className={styles.fontSample}>{font.sample}</span>
                                </div>

                                <div className={styles.cardFooter}>
                                    <div className={styles.cardText}>
                                        <span className={styles.cardName}>{font.name}</span>
                                        <span className={styles.cardMeta}>{font.usage}</span>
                                    </div>
                                    <a
                                        href={font.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.download}
                                    >
                                        Google Fonts <ArrowUpRight />
                                    </a>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className={styles.category}>
                    <h2 className={styles.categoryTitle}>
                        <Droplet className={styles.categoryIcon} />
                        The colors we live in
                    </h2>

                    <div className={`${styles.grid} ${styles.colorsGrid}`}>
                        {COLORS.map((color) => (
                            <article key={color.name} className={styles.card}>
                                <div className={styles.swatch} style={{backgroundColor: color.hex}} />

                                <div className={styles.cardFooter}>
                                    <div className={styles.cardText}>
                                        <span className={styles.cardName}>{color.name}</span>
                                        <span className={styles.cardMeta}>{color.hex}</span>
                                    </div>
                                    <CopyButton text={color.hex} icon={<CopyIcon />} />
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
