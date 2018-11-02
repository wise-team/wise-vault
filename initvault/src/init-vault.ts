import { Vault } from "./Vault";
import Axios from "axios";
import { unseal, policies, roles, auths, users, secrets } from "./config.gen";
import * as fs from "fs";
import * as _ from "lodash";
import * as readline from "readline";
import * as crypto from "crypto";

export function d <T> (input: T | undefined): T {
    if (typeof input !== "undefined") return input;
    else throw new Error("Input value is undefined (d() fn)");
}
async function run() {
    const toSave: any = {};

    const vaultAddr = process.env.WISE_VAULT_URL;
    if (!vaultAddr) throw new Error("Env WISE_VAULT_URL does not exist.");

    const vault = new Vault(vaultAddr);

    console.log("Initialize vault");
    const init = await vault.initVault({ secret_shares: unseal.secret_shares, secret_threshold: unseal.secret_threshold });
    const rootToken = d(init.root_token);

    // console.log("VAULT_ROOT_TOKEN=\"" + rootToken + "\"");
    // console.log("Enter this vault:");
    // console.log("$ docker exec -it vault-dev sh -c \"vault login " + rootToken + " && sh\"");

    toSave.unseal = { keys: init.keys, keys_base64: init.keys_base64 };

    for(let i = 0; i < unseal.secret_threshold; i++) {
        const unsealResp = await vault.unseal(init.keys_base64[i]);
    }
    const status = await vault.getStatus();
    if (d(status.sealed)) throw new Error("Unseal failed");

    // create all policies
    for (let i = 0; i < policies.length; i++) {
        const policy = policies[i];
        console.log("Create policy " + policy.name);
        await vault.putPolicy(policy.name, policy.policy);
    }

    // enable auth methods
    console.log();
    console.log("Enable auth methods");
    const authValues = _.values(auths);
    for (let i = 0; i < authValues.length;i++) {
        const auth = authValues[i];
        console.log("Enable auth method " + auth.type);
        await vault.enableAuthMethod(auth.type, auth.description, auth.config);
    }

    console.log();
    console.log("Create users");
    toSave.users = [];
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        console.log("Create user " + user.username);
        const password = crypto.randomBytes(20).toString("base64");
        await vault.createUserpassUser(user.username, password, user.policies);
        if (user.policies.indexOf("admin") !== -1) {
            console.log("Login as " + user.username);
            await vault.userPassLogin(user.username, password, user.policies);
        }
        
        toSave.users.push({ username: user.username, password: password, policies: user.policies });
    }

    console.log();
    console.log("Create AppRole roles for machine clients");
    toSave.appRoles = [];
    for (let i = 0; i < roles.length; i++) {
        const role = roles[i];
        console.log("Create role " + role.role);
        const createRoleResp = await vault.createAppRoleRole(role.role, role.policies);
        const roleId = await vault.getAppRoleId(role.role);
        
        toSave.appRoles.push({ role: role.role, role_id: roleId });
    }


    console.log();
    console.log("Generate session salt");
    const sessionSalt = crypto.randomBytes(25).toString("base64");
    await vault.setSecret(secrets.generated.sessionSalt, { v: sessionSalt });
    

    console.log();
    console.log("Ask human for his secrets");
    console.log("-------------------");
    console.log("I will ask you to type several secrets:");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const humanEnterSecretsKeys = _.keys(secrets.humanEnter);
    for (let i = 0; i < humanEnterSecretsKeys.length;i++) {
        const obj: { key: string, description: string; } = (secrets.humanEnter as any)[humanEnterSecretsKeys[i]];
        const enteredValue: string = (await new Promise((resolve) => {
            rl.question(obj.description + ": ", (ret: string) => { resolve(ret) })
        })) as string;
        if (!enteredValue) throw new Error("Entered an empty value!");
        await vault.setSecret(obj.key, { v: enteredValue.trim() });
        console.log("Written " + obj.key + " secret");
    }

    console.log();

    console.log("Sealing vault");

    console.log("Revoking root token");
    await vault.revokeToken(rootToken);

    console.log("Init done");

    console.log("Save the following:");
    console.log("----------");
    console.log(JSON.stringify(toSave, undefined, 2));
    console.log("----------");
    console.log();
    console.log("Finished");
    process.exit(0);
}

(async () => {
    try {
        await run();
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
})();