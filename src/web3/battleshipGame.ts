import { Contract, providers, utils, BigNumberish } from 'ethers';
import { BATTLESHIP_GAME_CONTRACT, ABI } from './constants';

// define everything needed for a transaction
export interface ITx {
  provider: providers.Web3Provider; // wallet/ rpc to send to
  functionName: string, // name of BattleshipGame.sol function being called
  args: any[] // function parameters
}

/**
 * Send an arbitrary transaction to the BattleshipGame.sol contract
 * @param {ITx} - the transaction parameters as defined in the ITx interface
 * @return {providers.TransactionReceipt} - transaction confirmation receipt
 */
export const transaction = async ({ provider, functionName, args }: ITx):
  Promise<providers.TransactionReceipt> => {
  // instantiate new contract
  const chainId = (await provider.getNetwork()).chainId;
  const contract = new Contract(
    BATTLESHIP_GAME_CONTRACT[chainId],
    ABI,
    provider.getSigner()
  )
  const tx = await contract[functionName](...args);
  return await tx.wait()
}

/**
 * Create new game with proof of valid board placement
 * 
 * @param {number} chainId - chain id of selected network 
 * @param {providers.Web3Provider} ethersProvider - web3 provider
 * @param {BigNumberish} boardHash - pedersen hash of a board
 * @param {Buffer} proof - noir proof of valid board 
 * @returns newGame function from BattleZips-Noir BattleshipGame contract
 */
export const createGame = async (
  chainId: number,
  ethersProvider: providers.Web3Provider,
  boardHash: BigNumberish,
  proof: Buffer
) => {
  if (!ethersProvider) return;
  const abi = new utils.Interface([
    'function newGame(uint256 _boardHash, bytes calldata _proof) external'
  ]);
  const contract = new Contract(
    BATTLESHIP_GAME_CONTRACT[chainId],
    abi,
    ethersProvider.getSigner()
  );
  return contract.newGame(boardHash, proof);
};

/**
 * Grab the current game nonce from the BattleZips-Noir BattleshipGame contract
 * 
 * @param {number} chainId - chain id of selected network
 * @param {providers.Web3Provider} ethersProvider - web3 provider
 * @returns gameIndex public variable from BattleZips-Noir BattleshipGame contract
 */
export const getGameIndex = async (chainId: number, ethersProvider: providers.Web3Provider) => {
  if (!ethersProvider) return;
  const abi = new utils.Interface([
    'function gameIndex() external view returns(uint256)'
  ]);
  const contract = new Contract(
    BATTLESHIP_GAME_CONTRACT[chainId],
    abi,
    ethersProvider.getSigner()
  );
  return contract.gameIndex();
};

/**
 * Leave an active game prematurely. If user is only active player simply leave game. If there is another
 * active player then this action will be treated as a forfeit with an adversary made the winner
 * 
 * @param {number} chaindId - chain id of the selected network
 * @param {providers.Web3Provider} ethersProvider - web3 provider
 * @param {number} gameId - game id
 * @returns leaveGame function from BattleZips-Noir BattleshipGame contract
 */
export const leaveGame = async (
  chaindId: number,
  ethersProvider: providers.Web3Provider,
  gameId: number,
) => {
  if (!ethersProvider) return;
  const abi = new utils.Interface([
    'function leaveGame(uint256 _game) external'
  ]);
  const contract = new Contract(
    BATTLESHIP_GAME_CONTRACT[chaindId],
    abi,
    ethersProvider.getSigner()
  );
  return contract.leaveGame(gameId);
};

/**
 * Join pre-existing game with proof of valid board placement
 * 
 * @param {number} chaindId - chain id of selected network 
 * @param {providers.Web3Provider} ethersProvider - web3 provider 
 * @param {number} gameId - game id 
 * @param {BigNumberish} boardHash - - pedersen hash of a board
 * @param {Buffer} proof - Noir proof of valid ship placement 
 * @returns joinGame function from BattleZips-Noir BattleshipGame contract
 */
export const joinGame = async (
  chaindId: number,
  ethersProvider: providers.Web3Provider,
  gameId: number,
  boardHash: BigNumberish,
  proof: Buffer
) => {
  if (!ethersProvider) return;
  const abi = new utils.Interface([
    'function joinGame(uint256 _game, uint256 _boardHash, bytes calldata _proof) external'
  ]);
  const contract = new Contract(
    BATTLESHIP_GAME_CONTRACT[chaindId],
    abi,
    ethersProvider.getSigner()
  );
  return contract.joinGame(gameId, boardHash, proof);
};

/**
 * Accesses public mapping of players engaged in active games. Returns id of game a player is in
 * 
 * @param {number} chainId - chain id of selected network 
 * @param {providers.Web3Provider} ethersProvider - web3 provider
 * @param {string} player - address of user 
 * @returns playingGame public mapping value from BattleZips-Noir BattleshipGame contract
 */
export const playingGame = async (
  chainId: number,
  ethersProvider: providers.Web3Provider,
  player: string
) => {
  if (!ethersProvider) return;
  const abi = new utils.Interface([
    'function playing(address player) public view returns(uint256)'
  ]);
  const contract = new Contract(BATTLESHIP_GAME_CONTRACT[chainId], abi, ethersProvider);
  return contract.playing(player);
};

/**
 * Take the first shot in a Battleship game. Does not require a proof as input since all proofs are based
 * off shot reports from adversary
 * 
 * @param {number} chainId - chaind id of selected network
 * @param {providers.Web3Provider} ethersProvider - web3 provider
 * @param {number} gameId - game id 
 * @param {number[]} shot - x and y coordinate of shot
 * @returns firstTurn function from BattleZips-Noir BattleshipGame contract
 */
export const firstTurn = async (
  chainId: number,
  ethersProvider: providers.Web3Provider,
  gameId: number,
  shot: number[]
) => {
  if (!ethersProvider) return;
  const abi = new utils.Interface([
    'function firstTurn(uint256 _game, uint[2] memory _shot) external'
  ]);
  const contract = new Contract(
    BATTLESHIP_GAME_CONTRACT[chainId],
    abi,
    ethersProvider.getSigner()
  );
  return contract.firstTurn(gameId, shot);
};

/**
 * Shot taken against an adversary in Battheship game. Contains a proof of the previous shot
 * and whether or a not the shot was a hit
 * 
 * @param {number} chainId - chain id of selected network 
 * @param {providers.Web3Provider} ethersProvider - web3 provider
 * @param {number} gameId - game id 
 * @param {boolean} hit - whether shot has contacted ship or not
 * @param {number[]} next - next shot 
 * @param {Buffer} proof - Noir proof of valid shot
 * @returns turn function from BattleZips-Noir BattleshipGame contract
 */
export const turn = async (
  chainId: number,
  ethersProvider: providers.Web3Provider,
  gameId: number,
  hit: boolean,
  next: number[],
  proof: Buffer
) => {
  if (!ethersProvider) return;
  const abi = new utils.Interface([
    'function turn(uint256 _game, bool _hit, uint[2] memory _next, bytes calldata _proof) external'
  ]);
  const contract = new Contract(
    BATTLESHIP_GAME_CONTRACT[chainId],
    abi,
    ethersProvider.getSigner()
  );
  return contract.turn(gameId, hit, next, proof);
};
