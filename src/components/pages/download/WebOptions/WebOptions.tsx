import {CopyButton} from '@/components/ui/CopyButton/CopyButton';
import {Notice} from '@/components/ui/Notice/Notice';
import {ArrowRightIcon, CopyIcon} from 'lucide-react';
import Link from 'next/link';
import styles from './WebOptions.module.scss';

const COMPOSE_URL = 'https://raw.githubusercontent.com/TabularisDB/tabularis/main/docker/compose.yaml';

const METHODS: {label: string; command: string; hint: string}[] = [
    {
        label: 'Docker',
        command: [
            'docker run -d --name tabularis \\',
            '  -p 127.0.0.1:8080:8080 \\',
            '  -v tabularis-data:/data \\',
            '  ghcr.io/tabularisdb/tabularis',
            'docker logs tabularis',
        ].join('\n'),
        hint: 'Open http://localhost:8080. The log shows the generated login password.',
    },
    {
        label: 'Docker Compose',
        command: [`curl -fsSLO ${COMPOSE_URL}`, 'docker compose up -d'].join('\n'),
        hint: 'Add compose.tls.yaml from the repository for automatic HTTPS with Caddy.',
    },
    {
        label: 'Helm',
        command: [
            'helm install tabularis oci://ghcr.io/tabularisdb/charts/tabularis \\',
            '  --set publicUrl=https://tabularis.example.com \\',
            '  --set ingress.enabled=true',
        ].join('\n'),
        hint: 'Without a password or secret key, the container generates them on the data volume, so keep the volume across upgrades.',
    },
];

export function WebOptions() {
    return (
        <div className={styles.optionList}>
            <p className={styles.intro}>
                Run Tabularis Web on a server or your own machine and use it from any browser. Images for{' '}
                <code>amd64</code> and <code>arm64</code> are published to the GitHub Container Registry.
            </p>

            {METHODS.map((method) => (
                <div key={method.label} className={styles.option}>
                    <span className={styles.optionLabel}>{method.label}</span>
                    <div className={styles.codeBlock}>
                        <pre className={styles.code}>
                            <code>{method.command}</code>
                        </pre>
                        <CopyButton text={method.command} icon={<CopyIcon />} className={styles.copy} />
                    </div>
                    <Notice>{method.hint}</Notice>
                </div>
            ))}

            <Link className={styles.guide} href="/wiki/docker-helm">
                Read the self-hosting guide <ArrowRightIcon aria-hidden="true" />
            </Link>
        </div>
    );
}
