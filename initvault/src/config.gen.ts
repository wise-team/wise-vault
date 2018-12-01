import * as fs from "fs";
import { adminPolicy } from "./admin-policy.hcl";

export const unseal = 
/*§ "\n" + JSON.stringify(data.config.vault.unseal, undefined, 2) + "\n" §*/
{
  "secret_shares": 4,
  "secret_threshold": 2
}
/*§ §.*/
;

export const auths = 
/*§ "\n" + JSON.stringify(data.config.vault.auths, undefined, 2) + "\n" §*/
{
  "AppRole": {
    "type": "approle",
    "description": "Docker service login",
    "config": {}
  },
  "userpass": {
    "type": "userpass",
    "description": "User login",
    "config": {}
  }
}
/*§ §.*/
;

export const policies: { name: string; policy: string; } [] = [
/*§ "\n" + data.config.vault.policies(data.config).map(policy => "    { name: \"" + policy.name + "\", policy: `\n" + policy.policy(data.config) +  "`},\n").reduce((prev, current) => prev + current) §*/
    { name: "wise-hub-api", policy: `

                    path "secret/hub/public/*" { capabilities = ["create", "read", "update", "delete", "list"] }
                    path "secret/human/steemconnect/client_id" { capabilities = [ "read" ] }
                    path "secret/generated/session/salt" { capabilities = [ "read" ] }
                    path "secret/hub/steemconnect/users/profiles/*" { capabilities = [ "create", "read", "update", "delete", "list" ] }
                    path "secret/hub/steemconnect/users/access_tokens/*" { capabilities = [ "create", "read", "update", "delete" ] }
                    path "secret/hub/steemconnect/users/refresh_tokens/*" { capabilities = [ "create", "read", "update", "delete" ] }
                    `},
    { name: "wise-hub-daemon", policy: `

                    path "secret/hub/public/*" { capabilities = ["create", "read", "update", "delete", "list"] }
                    path "secret/human/steemconnect/client_id" { capabilities = [ "read" ] }
                    path "secret/hub/steemconnect/users/*" { capabilities = [ "create", "read", "update", "delete", "list" ] }
                    path "secret/hub/steemconnect/users/access_tokens/*" { capabilities = [ "read", "update" ] }
                    path "secret/hub/steemconnect/users/refresh_tokens/*" { capabilities = [ "read" ] }
                    `},
/*§ §.*/
  {
    name: "admin",
    policy: adminPolicy
  }
];


export const roles = 
/*§ "\n" + JSON.stringify(data.config.vault.roles(data.config).map(role => { role.policies = role.policies(data.config); return role; }), undefined, 2) + "\n" §*/
[
  {
    "role": "wise-hub-api",
    "policies": [
      "wise-hub-api"
    ]
  },
  {
    "role": "wise-hub-daemon",
    "policies": [
      "wise-hub-daemon"
    ]
  }
]
/*§ §.*/
;

export const users = 
/*§ "\n" + JSON.stringify(data.config.vault.users, undefined, 2) + "\n" §*/
[
  {
    "username": "jblew",
    "policies": [
      "admin"
    ]
  },
  {
    "username": "noisy",
    "policies": [
      "admin"
    ]
  }
]
/*§ §.*/
;

export const secrets = 
/*§ "\n" + JSON.stringify(data.config.vault.secrets, undefined, 2) + "\n" §*/
{
  "humanEnter": {
    "steemConnectClientId": {
      "description": "Steemconnect client_id",
      "key": "/human/steemconnect/client_id"
    },
    "slackWebhookUrl": {
      "description": "Slack Webhook URL",
      "key": "/human/slack/webhook_url"
    }
  },
  "generated": {
    "sessionSalt": "/generated/session/salt"
  }
}
/*§ §.*/
;