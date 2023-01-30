import initNoirWasm, { acir_from_bytes } from "@noir-lang/noir_wasm";
import setup_generic_prover from "./setup_generic_prover";

// Circuit sizes must be known on frontend for valid proof generation
const CIRCUIT_SIZES = {
    board: 8192,
    shot: 4096
}

// Map specific proof to relevant files
const PROOF_TO_FILES = {
    board: {
        acir: 'boardAcir.buf',
        circuit: 'boardCircuit.buf'
    },
    shot: {
        acir: 'shotAcir.buf',
        circuit: 'shotCircuit.buf'
    }
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
export const generateProof = async (proofType: Proof, input: BoardABI | ShotABI) => {
    // Initialize Noir web assembly
    await initNoirWasm();
    // Arbitrary files must be read into react file via fetch
    let response = await fetch(PROOF_TO_FILES[proofType].circuit);
    let buffer = await response.arrayBuffer();
    const circuit = new Uint8Array(buffer);

    response = await fetch(PROOF_TO_FILES[proofType].acir);
    buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const acir = acir_from_bytes(bytes);
    // Use custom function set up proof in React app. Must pass in circuit size
    const [prover] = await setup_generic_prover(circuit, CIRCUIT_SIZES[proofType]);
    const worker = new Worker(new URL('./aztecWorker.js', import.meta.url));
    // Fetch error promise if worker fails
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
    worker.postMessage({ url: document.URL, acir, input });
    const witness: any = await Promise.race([errorPromise, resultPromise]);
    // Pass witness in and create prover
    const proof = await prover.createProof(witness);
    return proof;
}