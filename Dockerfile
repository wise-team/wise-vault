FROM debian:9-slim

# '2>&1 | tr -d '{}[]' is a fix por ansible module docker_service

ARG vault_hostname

RUN apt-get update && apt-get install -y openssl && mkdir /certgen 2>&1 | tr -d '{}[]'

# Based on Letsencrypt guidelines for self signed certs: https://letsencrypt.org/docs/certificates-for-localhost/
RUN echo "[dn]                  \n\
CN=localhost                    \n\
[req]                           \n\
distinguished_name = dn         \n\
[EXT]                           \n\
subjectAltName=@alt_names       \n\
keyUsage=digitalSignature       \n\
extendedKeyUsage=serverAuth     \n\
[alt_names]                     \n\
DNS.1 = localhost               \n\
DNS.2 = ${vault_hostname}       \n\
IP.1  = 0.0.0.0                 \n\
IP.2  = 127.0.0.1               \n\
" > /certgen/localhost.conf

RUN cat /certgen/localhost.conf 2>&1 | tr -d '{}[]'

RUN openssl req -x509 -out /certgen/localhost.crt -keyout /certgen/localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -days 365 \
  -subj '/CN=localhost' -extensions EXT -config /certgen/localhost.conf > /dev/null 2>&1


FROM vault

COPY --from=0 /certgen/localhost.crt /etc/certs/vault-localhost.crt
COPY --from=0 /certgen/localhost.key /etc/certs/vault-localhost.key
RUN chmod 555 /etc/certs/vault-localhost.crt && chmod 555 /etc/certs/vault-localhost.key