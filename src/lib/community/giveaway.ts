export interface Giveaway {
    title: string;
    /** Window bounds as Europe/Rome wall times. */
    from: string;
    to: string;
    /** How many contributors win a prize. */
    winners: number;
    /**
     * GitHub usernames of the people who entered by replying to the announcement
     * on Discord. Maintainers add them by hand. Case does not matter.
     */
    entrants: string[];
}

/** Every giveaway, oldest first. Add the next one at the end. */
export const GIVEAWAYS: Giveaway[] = [
    {
        title: 'Community Giveaway',
        from: '2026-10-07T16:00',
        to: '2026-10-13T16:00',
        winners: 3,
        entrants: ['tonypartridge', 'Detoy', 'tosinxt', 'vivekyarra', 'DhruvShah-Dev'],
    },
];
