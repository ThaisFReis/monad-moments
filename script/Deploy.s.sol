// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/MomentNFT.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        MomentNFT moment = new MomentNFT();

        vm.stopBroadcast();

        console.log("Deployer:", vm.addr(deployerKey));
        console.log("Deployed to:", address(moment));
    }
}
