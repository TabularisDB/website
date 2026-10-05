import {Urbanist, JetBrains_Mono} from 'next/font/google';

export const urbanist = Urbanist({subsets: ['latin'], variable: '--font-sans', display: 'swap'});
export const jetbrainsMono = JetBrains_Mono({subsets: ['latin'], variable: '--font-mono', display: 'swap', preload: false});
