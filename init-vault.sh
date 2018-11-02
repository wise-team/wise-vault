#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )" # parent dir of scripts dir
cd "${DIR}"

docker-compose -f docker-compose.yml -f docker-compose.override.yml down

echo "Remove existing vaultfiles"
rm -rf "${DIR}/Vaultfile"
rm -f "${DIR}/Vaultfile.tar.gz"

docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d

#§ 'NODE_IMAGE="node:' + data.config.npm.node.version + '-alpine"'
NODE_IMAGE="node:10.12-alpine"

#§ 'WISE_VAULT_URL="' + data.config.vault.url + '"'
WISE_VAULT_URL="https://127.0.0.1:8200"

docker run -it -w /app  --net=host \
 -v "${DIR}/initvault:/app:rw" \
 -e "NODE_TLS_REJECT_UNAUTHORIZED=0" \
 -e "WISE_VAULT_URL=${WISE_VAULT_URL}" \
 "${NODE_IMAGE}" sh -c "npm install && npm run init-vault"

docker-compose -f docker-compose.yml -f docker-compose.override.yml down

tar -zcvf Vaultfile.tar.gz ./Vaultfile

echo "Vaultfile.tar.gz created"
