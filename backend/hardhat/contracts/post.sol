// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IEAS, Attestation} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import {SchemaResolver} from "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";

contract PostComment is SchemaResolver, Ownable {
    mapping(address => bool) public s_attesterAccess;

    constructor(IEAS _eas) SchemaResolver(_eas) Ownable(msg.sender) {}

    /**
     * @dev Allows the contract owner to update access for an attester.
     * @param attester The address of the attester.
     * @param access Whether to grant or revoke access for the attester.
     */
    function updateAccessForAttester(address attester, bool access) public onlyOwner {
        s_attesterAccess[attester] = access;
    }

    /**
     * @dev Checks whether the attestation is from an attester with access.
     * @param attestation The attestation data.
     * @return Whether the attester has access to attest.
     */
    function onAttest(Attestation calldata attestation, uint256 /*value*/) internal view override returns (bool) {
        return s_attesterAccess[attestation.attester];
    }

    /**
     * @dev Placeholder function for revocation. Always returns true because revocation is allowed.
     * @return Always returns true.
     */
    function onRevoke(Attestation calldata, uint256 /*value*/) internal pure override returns (bool) {
        return true;
    }
}
