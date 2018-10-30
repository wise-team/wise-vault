#!/bin/bash

#§ 'VAULT_ADDR="' + data.config.vault.url + '"'
VAULT_ADDR="https://127.0.0.1:8200"

docker run --net=host -e 'VAULT_SKIP_VERIFY=1' -e "VAULT_ADDR=${VAULT_ADDR}" --cap-add IPC_LOCK -it vault "$@"