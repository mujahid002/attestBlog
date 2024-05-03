const { ethers, upgrades, run } = require("hardhat");

const main = async () => {
  // Knowledge Token
  const postComment = await hre.ethers.getContractFactory("PostComment");
  const easAddress = "0x4200000000000000000000000000000000000021";
  console.log("Deploying PostComment Contract...");
  const PostComment = await postComment.deploy(easAddress, {
    gasPrice: 30000000000,
  });
  await PostComment.waitForDeployment();
  const postCommentAddress = await PostComment.getAddress();
  console.log("PostComment Contract Address:", postCommentAddress);
  console.log("----------------------------------------------------------");

  // Verify PostComment Contract
  console.log("Verifying PostComment...");
  await run("verify:verify", {
    address: postCommentAddress,
    constructorArguments: [easAddress],
  });
  console.log("----------------------------------------------------------");
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// CLI commands to deploy and verify PostComment
// yarn hardhat run scripts/deploy.js --network optimismSepolia

// if not verified properly use this:
// yarn hardhat verify --network optimismSepolia DEPLOYED_CONTRACT_ADDRESS
