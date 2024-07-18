// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Importing required contracts and libraries
import {IEAS, Attestation} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import {SchemaResolver} from "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @custom:security-contact mujahidshaik2002@gmail.com
contract TokenizedNoun is SchemaResolver, Ownable {
    constructor(IEAS _eas) SchemaResolver(_eas) Ownable(_msgSender()) {}

    function onAttest(
        Attestation calldata attestation,
        uint256 /*value*/
    ) internal pure override returns (bool) {
        (, , , , bool approved) = abi.decode(
            attestation.data,
            (string, string, string, uint256, bool)
        );
        if (approved) {
            return true;
        }
        return false;
    }

    /**
     * @dev Handles the revocation event. This function is called when an attestation is revoked.
     * @return bool Always returns false as revocation is not supported.
     */
    function onRevoke(
        Attestation calldata, /*attestation*/
        uint256 /* amount*/
    ) internal pure override returns (bool) {
        return true;
    }
}
