// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Importing required contracts and libraries from the Ethereum Attestation Service (EAS) contracts
import {IEAS, Attestation} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import {SchemaResolver} from "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";

/// @title DxResolver
/// @dev This contract is an implementation of SchemaResolver from the EAS (Ethereum Attestation Service) framework.
/// It handles attestation approvals and revocations based on the data provided in the attestations.

/// @custom:security-contact mujahidshaik2002@gmail.com
contract DxResolver is SchemaResolver {
    
    /// @dev Constructor that initializes the SchemaResolver contract with the EAS instance.
    /// @param _eas Address of the EAS contract used for attestation management.
    constructor(IEAS _eas) SchemaResolver(_eas) {}

    /// @notice This function is called when an attestation is made.
    /// @dev It processes the attestation data to determine whether the attestation is approved.
    /// @param attestation The attestation data containing details about the attestation.
    /// @return bool Returns true if the attestation is approved, otherwise false.
    function onAttest(
        Attestation calldata attestation,
        uint256 /*value*/
    ) internal pure override returns (bool) {
        // Decode the attestation data into its components
        (, , , , bool approved) = abi.decode(
            attestation.data,
            (string, string, string, uint256, bool)
        );
        // Return true if the attestation is approved
        if (approved) {
            return true;
        }
        return false;
    }

    /// @notice This function is called when an attestation is revoked.
    /// @dev In this implementation, it simply returns true, indicating that the revocation is processed.
    /// @return bool Always returns true.
    function onRevoke(
        Attestation calldata, /*attestation*/
        uint256 /* amount*/
    ) internal pure override returns (bool) {
        return true;
    }
}
