#!/bin/bash

#§ 'VAULT_ADDR="' + data.config.vault.url + '"'
VAULT_ADDR="https://127.0.0.1:8200"

docker run --net=host --cap-add IPC_LOCK -it vault "$@" -address="${VAULT_ADDR}" -tls-skip-verify