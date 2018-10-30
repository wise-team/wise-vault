FROM debian:9-slim

# '2>&1 | tr -d '{}[]' is a fix por ansible module docker_service

RUN bash -c "apt-get update && apt-get install -y openssl && mkdir /certgen" 2>&1 | tr -d '{}[]'

# Based on Letsencrypt guidelines for self signed certs: https://letsencrypt.org/docs/certificates-for-localhost/
COPY ./localhost-cert-conf.conf /certgen/localhost.conf
RUN openssl req -x509 -out /certgen/localhost.crt -keyout /certgen/localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -days 365 \
  -subj "/CN=localhost" -extensions EXT -config /certgen/localhost.conf > /dev/null 2>&1


FROM vault

COPY --from=0 /certgen/localhost.crt /etc/certs/vault-localhost.crt
COPY --from=0 /certgen/localhost.key /etc/certs/vault-localhost.key
RUN chmod 555 /etc/certs/vault-localhost.crt && chmod 555 /etc/certs/vault-localhost.key