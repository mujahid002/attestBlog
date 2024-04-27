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
