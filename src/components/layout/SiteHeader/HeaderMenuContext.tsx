'use client';

import {createContext, useContext, useState} from 'react';

interface HeaderMenuContextValue {
    openGroupLabel: string | null;
    setOpenGroupLabel: (label: string | null) => void;
}

export const HeaderMenuContext = createContext<HeaderMenuContextValue | null>(null);

export function HeaderMenuProvider({children}: {children: React.ReactNode}) {
    const [openGroupLabel, setOpenGroupLabel] = useState<string | null>(null);
    return (
        <HeaderMenuContext.Provider value={{openGroupLabel, setOpenGroupLabel}}>{children}</HeaderMenuContext.Provider>
    );
}

export function useHeaderMenu() {
    const ctx = useContext(HeaderMenuContext);
    if (!ctx) throw new Error('useHeaderMenu must be used within HeaderMenuProvider');
    return ctx;
}
