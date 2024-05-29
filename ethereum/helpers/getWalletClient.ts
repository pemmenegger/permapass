export const getWalletClient = async (viem: any) => {
	// Hardhat default account
	const dummyAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
	return await viem.getWalletClient(dummyAddress)
}
