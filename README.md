# All References for Schemas:

Basic Resolver Contract for User Registration & Post Schemas: https://sepolia-optimistic.etherscan.io/address/0xd39F5578c1Ff23cD09FAeA4ab6FC11f97cbd46bD#code

User Registration Schema: https://optimism-sepolia.easscan.org/schema/view/0xf35fa2d095ccffae542b34d6c93517447dc5b86b73029bab58a7b337f3a4b4e4

Post Schema: https://optimism-sepolia.easscan.org/schema/view/0xee7db9351cddafb02e6a29ba5f1ac062a2bf741f1f7a9d4bf5b1aa69cab4e9a7

Reaction Schema: https://optimism-sepolia.easscan.org/schema/view/0xbbd7ed70dd8e4f8069f67760ba854e2a9b8355c7df12ef795d229c96be68ae45

## Updated Schema

https://optimism-sepolia.easscan.org/schema/view/0x4a56b373bd7d6804deb561b60eed5b6a981fac23b45fa800f38d53e91bb9f121

## Resolver Contract

https://sepolia-optimistic.etherscan.io/address/0xFF79C42512003C04aA2Dc736be9F22eb60590c1f#code

## Created Schema for Blog, it contains Creator Address and CID from Pinata

Proof: https://optimism-sepolia.blockscout.com/tx/0x6e8355649d8fabcc6a2ab43b56be57f31e74504a3a817bfe1ab2a31957666d28

## My Schema

https://optimism-sepolia.easscan.org/schema/view/0x08cf4bbd043399f5b4ac08c48204c0f4cd7a3cb939ec7a1da08cb5e010e65193

## First Attest

https://optimism-sepolia.blockscout.com/tx/0x00e293e9c1bef19f82afa3b82c66be263fdc80cff45e0169cd00462104196492

## API EndPoints

curl -X POST 'https://api.scorer.gitcoin.co/registry/submit-passport' \
--data '{"address":"0x1c620232Fe5Ab700Cc65bBb4Ebdf15aFFe96e1B5","scorer_id":"7140"}' \
-H "Content-Type: application/json" \
-H 'X-API-KEY: fVK3BmOd.u2Z9xNlNQkcbyQZvrn2j1DfM7kC9vvSp'

curl --request GET 'https://api.scorer.gitcoin.co/registry/score/100/0x1c620232Fe5Ab700Cc65bBb4Ebdf15aFFe96e1B5' \
--header 'X-API-KEY: fVK3BmOd.u2Z9xNlNQkcbyQZvrn2j1DfM7kC9vvSp'

curl --request GET \
 --url https://api.scorer.gitcoin.co/registry/score/7140/0x709d29dc073F42feF70B6aa751A8D186425b2750 \
 --header 'X-API-KEY: fVK3BmOd.u2Z9xNlNQkcbyQZvrn2j1DfM7kC9vvSp'

curl --request GET \
 --url https://api.scorer.gitcoin.co/registry/score/7141/0x1c620232Fe5Ab700Cc65bBb4Ebdf15aFFe96e1B5 \
 --header 'X-API-KEY: fVK3BmOd.u2Z9xNlNQkcbyQZvrn2j1DfM7kC9vvSp'
