import { SinglePedersen } from '@noir-lang/barretenberg/dest/crypto';
import { BarretenbergWasm } from '@noir-lang/barretenberg';

/**
 * Function to compute the Pedersen hash of the BattleShip board
 * 
 * @param {number[][]} board - 2-d array representing (x, y, z) values of all 5 ships
 * @returns {string} - 32 byte hoard hash
 */
export const createShipHash = async (board: number[][]) => {
    const barrentenberg = await BarretenbergWasm.new();
    const pedersen = new SinglePedersen(barrentenberg);
    const shipBuffer = pedersen.compressInputs(
        board.flat().map((val) => Buffer.from(numToHex(val), 'hex'))
    );
    return `0x${shipBuffer.toString('hex')}`;
};

/**
 * Generates a fixed-time promise to delay execution of subsequent actions 
 * 
 * @param {number} ms - number of millesecond to delay 
 * @returns {Promise<unknown>} - promise that will resolve in fixed time
 */
export const delay = (ms: number): Promise<unknown> =>
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate a random number inside a specified range
 * 
 * @param {number} min - range minimum 
 * @param {number} max - range maximum 
 * @returns {number} - random number
 */
export const getRandomInt = (min: number, max: number): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Shorten ethereum address to provide cleaner display format
 * 
 * @param {string | null | undefined} address - ethereum address 
 * @param {string |null | underfined } ensName - ens name if one exists 
 * @param {number} chars - number of address characters to display on each side of splice
 * @returns {string} - shortened address
 */
export const formatAddress = (
    address: string | null | undefined,
    ensName: string | null | undefined,
    chars = 4
): string => {
    if (ensName) return ensName;
    else if (address)
        return `${address
            .substring(0, chars + 2)
            .toLowerCase()}...${address.substring(42 - chars)}`;
    else return '';
}

/**
 * Converts a number to a 32 byte hex string so structure mirrors Noir's for accurate hashing
 * 
 * @param {number} num - decimal number to be converted to hex format 
 * @returns {string} - 32 bytes hex string
 */
export const numToHex = (num: number) => {
    const hex = num.toString(16);
    return `${'0'.repeat(64 - hex.length)}${hex}`;
};