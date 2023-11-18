import { ethers, TransactionResponse, Signer } from 'ethers';
import { ERC20_ABI, LOOPSO_ABI } from './constants';
import { checkAllowance, getLoopsoContractFromContractAddr } from './utils';


export async function bridgeTokens(
	contractAddressSrc: string,
	signer: ethers.Signer,
	tokenAddress: string,
	amount: bigint,
	dstAddress: string,
	dstChain: number
): Promise<TransactionResponse | null> {

	const loopsoContractOnSrc = await getLoopsoContractFromContractAddr(contractAddressSrc, signer)
	const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

	try {
		let convertedAmount = amount * BigInt(10 ** 18);
		await checkAllowance(signer, tokenContract, contractAddressSrc, convertedAmount)

		const bridgeTx = loopsoContractOnSrc.bridgeTokens(
			tokenAddress,
			convertedAmount,
			dstChain,
			dstAddress
		);
		if (!bridgeTx) {
			throw new Error("Bridge transaction failed");
		}
		return bridgeTx;
	} catch (error) {
		console.error("Error bridging tokens:", error);
		return null;
	}
}

export async function bridgeNonFungibleTokens(
	contractAddress: string,
	signerOrProvider: ethers.Signer | ethers.JsonRpcProvider,
	tokenAddress: string,
	tokenId: number,
	tokenChain: number,
	tokenURI: string,
	dstAddress: string,
	dstChain: number
): Promise<TransactionResponse> {
	const loopsoContract = new ethers.Contract(contractAddress, LOOPSO_ABI);
	/* 	const isSupported = await loopsoContract.isTokenSupported(tokenAddress, tokenChain)
		if (isSupported) { */
	const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signerOrProvider);
	const approvalTx = await tokenContract.approve(contractAddress, tokenId)
	if (approvalTx) {
		return loopsoContract.bridgeNonFungibleTokens(tokenAddress, tokenId, tokenURI, dstChain, dstAddress);
	}
	else throw new Error("Could not approve contract spending");
	/* 	} else throw new Error("Token you are trying to bridge is not supported yet");
	 */

}

export async function bridgeNonFungibleTokensBack(
	contractAddress: string,
	signerOrProvider: ethers.Signer | ethers.JsonRpcProvider,
	tokenId: number,
	dstAddress: string,
	attestationId: number) {
	const loopsoContract = new ethers.Contract(contractAddress, LOOPSO_ABI, signerOrProvider);
	return loopsoContract.bridgeNonFungibleTokensBack(tokenId, dstAddress, attestationId);

}

export async function bridgeTokensBack(
	contractAddress: string,
	signerOrProvider: ethers.Signer | ethers.JsonRpcProvider,
	tokenId: number,
	dstAddress: string,
	attestationId: number) {
	const loopsoContract = new ethers.Contract(contractAddress, LOOPSO_ABI, signerOrProvider);
	return loopsoContract.bridgeTokensBack(tokenId, dstAddress, attestationId);

}


export async function getAllSupportedTokens(
	contractAddress: string,
	signerOrProvider: ethers.Signer | ethers.JsonRpcProvider) {
	const loopsoContract = new ethers.Contract(contractAddress, LOOPSO_ABI, signerOrProvider);
	return loopsoContract.getAllSupportedTokens();

}

