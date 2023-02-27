import initNoirWasm, { acir_read_bytes } from "@noir-lang/noir_wasm";

// Map specific proof to relevant files
const PROOF_TO_FILES = {
    board: 'boardAcir.buf',
    shot: 'shotAcir.buf',
}

export type BoardABI = {
    hash: string,
    ships: number[],
}

export type ShotABI = {
    hash: string,
    hit: number,
    ships: number[],
    shot: number[];
}

type Proof = 'board' | 'shot'

/**
 * Generate Noir proof on the frontend. Works with Board and Shot proof as specified. Currently
 * aztec backend must be initialized in a web worker to deal with abis above 4kb in size
 * 
 * @param {Proof} proofType - board or shot proof 
 * @param {BoardABI | ShotABI} input - ABI corresponding to specific proof 
 * @returns {Buffer} - Noir proof
 */
export const createProof = async (proofType: Proof, input: BoardABI | ShotABI): Promise<Uint8Array> => {
    // Initialize Noir WebAssembly
    await initNoirWasm();
    // Fetch acir representation of circuit from buffer
    const res = await fetch(PROOF_TO_FILES[proofType]);
    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    // Convert bytes to acir
    const acir = acir_read_bytes(bytes);
    // Initialize web worker
    const worker = new Worker(new URL('./aztecWorker.js', import.meta.url));
    const errorPromise = new Promise((_resolve, reject) => {
        worker.onerror = (e) => {
            reject(e);
        }
    });
    // Fetch result promise if worker successfully runs
    const resultPromise = new Promise((resolve, _reject) => {
        worker.onmessage = (e) => {
            resolve(e.data);
        }
    });
    // Pass in acir and abi to webworker to generate witness
    worker.postMessage({ acir, input });
    const proof = await Promise.race([errorPromise, resultPromise]);
    return proof as Uint8Array;
}