'use client';

import {PluginRequestModal} from '@/components/pages/plugins/bounties/RequestPluginButton/PluginRequestModal/PluginRequestModal';
import {takePendingRequest, type PluginRequestDraft, type PluginRequestKind} from '@/lib/plugins/requests';
import {Button} from '@/components/ui/Button/Button';
import {useEffect, useState, type ReactNode} from 'react';

interface RequestPluginButtonProps {
    kinds: PluginRequestKind[];
    className?: string;
    children: ReactNode;
}

export function RequestPluginButton({kinds, className, children}: RequestPluginButtonProps) {
    const [open, setOpen] = useState(false);
    const [resume, setResume] = useState<PluginRequestDraft | null>(null);

    // Back from the Tabularium sign-in: reopen with the saved draft. The draft is
    // taken once, so only the first button on the page resumes it.
    useEffect(() => {
        const draft = takePendingRequest();
        if (!draft) return;
        setResume(draft);
        setOpen(true);
    }, []);

    return (
        <>
            <Button className={className} onClick={() => setOpen(true)}>
                {children}
            </Button>
            <PluginRequestModal open={open} onClose={() => setOpen(false)} kinds={kinds} resume={resume} />
        </>
    );
}
