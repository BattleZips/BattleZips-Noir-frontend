export { };

/**
 * Used for applying biconomy and torus across the app via the window object. For potential future
 * us in BattleZips-Noir
 */
declare global {
        interface Window {
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                Biconomy: any;
                Torus: any;
        }
}