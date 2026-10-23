'use client';

import {CopyButton} from '@/components/ui/CopyButton/CopyButton';
import clsx from 'clsx';
import {ContainerIcon, CopyIcon} from 'lucide-react';
import {useState} from 'react';
import styles from './SelfHostSection.module.scss';

const GUIDE_URL = 'https://github.com/TabularisDB/tabularis/blob/main/web-ui-project/docs/WEB_MODE_CONTAINERS.md';
const COMPOSE_URL = 'https://raw.githubusercontent.com/TabularisDB/tabularis/main/docker/compose.yaml';

type Method = 'docker' | 'compose' | 'helm';

const METHODS: {id: Method; label: string}[] = [
    {id: 'docker', label: 'Docker'},
    {id: 'compose', label: 'Compose'},
    {id: 'helm', label: 'Helm'},
];

function snippet(method: Method): {command: string; hint: string} {
    switch (method) {
        case 'docker':
            return {
                command: [
                    'docker run -d --name tabularis \\',
                    '  -p 127.0.0.1:8080:8080 \\',
                    '  -v tabularis-data:/data \\',
                    '  ghcr.io/tabularisdb/tabularis',
                    'docker logs tabularis',
                ].join('\n'),
                hint: 'Open http://localhost:8080. The log shows the generated login password.',
            };
        case 'compose':
            return {
                command: [`curl -fsSLO ${COMPOSE_URL}`, 'docker compose up -d'].join('\n'),
                hint: 'Add compose.tls.yaml from the repository for automatic HTTPS with Caddy.',
            };
        case 'helm':
            return {
                command: [
                    'helm install tabularis oci://ghcr.io/tabularisdb/charts/tabularis \\',
                    '  --set publicUrl=https://tabularis.example.com \\',
                    '  --set ingress.enabled=true',
                ].join('\n'),
                hint: 'The chart generates the login password and secret key and keeps them across upgrades.',
            };
    }
}

function Toggle<T extends string>({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: {id: T; label: string}[];
    value: T;
    onChange: (value: T) => void;
}) {
    return (
        <div className={styles.toggle} role="tablist" aria-label={label}>
            {options.map((option) => (
                <button
                    key={option.id}
                    type="button"
                    role="tab"
                    aria-selected={value === option.id}
                    className={clsx(styles.segment, value === option.id && styles.active)}
                    onClick={() => onChange(option.id)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

export function SelfHostSection() {
    const [method, setMethod] = useState<Method>('docker');
    const {command, hint} = snippet(method);

    return (
        <section className={styles.section} aria-labelledby="self-host-heading">
            <h2 id="self-host-heading" className={styles.heading}>
                <ContainerIcon />
                Self-host in your browser
            </h2>
            <p className={styles.description}>
                Run Tabularis Web on a server or your own machine and use it from any browser. Images for{' '}
                <code>amd64</code> and <code>arm64</code> are published to the GitHub Container Registry.
            </p>

            <Toggle label="Install method" options={METHODS} value={method} onChange={setMethod} />

            <div className={styles.codeBlock}>
                <pre className={styles.code}>
                    <code>{command}</code>
                </pre>
                <CopyButton text={command} icon={<CopyIcon />} className={styles.copy} />
            </div>
            <p className={styles.hint}>
                {hint} <a href={GUIDE_URL}>Container guide</a>
            </p>
        </section>
    );
}
