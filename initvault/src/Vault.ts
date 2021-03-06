import Axios, { AxiosResponse, AxiosRequestConfig } from "axios";

export function d <T> (input: T | undefined): T {
    if (typeof input !== "undefined") return input;
    else throw new Error("Input value is undefined (d() fn)");
}

export class Vault {
    private vaultAddr: string;
    // TODO protect token variable (ensure this in only in-memory, no swap)
    private token: string = "";
    private tokenLeaseUntil: number = 0;

    public constructor(vaultAddr: string) {
        this.vaultAddr = vaultAddr;
    }

    public async init() {
    }

    public async call(method: "GET" | "POST" | "PUT" | "DELETE", path: string, data: any, token: string = this.token): Promise<AxiosResponse> {
        if (!token) throw new Error("Token is not set. Vault client is unauthorized.");
        return await Axios({
            method: method,
            url: this.vaultAddr + path,
            data: data,
            headers: {
                "X-Vault-Token": token
            }
        });
    }

    public async userPassLogin(username: string, password: string, requiredPolicies: string []) {
        const loginResp = await Axios.post(this.vaultAddr + "/v1/auth/userpass/login/" + username,
        { password: password });

        requiredPolicies.forEach(requiredPolicy => {
            if (loginResp.data.auth.policies.indexOf(requiredPolicy) < 0)
                throw new Error("This AppRole does not have " + requiredPolicy + " policy.");
        });

        if (!loginResp.data.auth.renewable)
            throw new Error("Got token that is not renewable!");

        this.token = d(loginResp.data.auth.client_token);
        this.tokenLeaseUntil = Date.now() / 1000 + d(loginResp.data.auth.lease_duration);
    }

    public async appRoleLogin(roleName: string, requiredPolicies: string [], roleId: string, roleSecret: string) {
        const loginResp = await Axios.post(this.vaultAddr + "/v1/auth/approle/login",
        { role_id: roleId, secret_id: roleSecret });

        if (loginResp.data.auth.metadata.role_name !== roleName)
            throw new Error("This AppRole is not " + roleName + ", instead logged in as "
                                                            + loginResp.data.auth.metadata.role_name);

        requiredPolicies.forEach(requiredPolicy => {
            if (loginResp.data.auth.policies.indexOf(requiredPolicy) < 0)
                throw new Error("This AppRole does not have " + requiredPolicy + " policy.");
        });

        if (!loginResp.data.auth.renewable)
            throw new Error("Got token that is not renewable!");

        this.token = d(loginResp.data.auth.client_token);
        this.tokenLeaseUntil = Date.now() / 1000 + d(loginResp.data.auth.lease_duration);
    }

    public async getStatus(): Promise<any> {
        const resp =  await Axios.get(this.vaultAddr + "/v1/sys/health");
        return resp.data;
    }

    public async getSecret(secretPath: string): Promise<any> {
        if (secretPath.substring(0, 1) !== "/") throw new Error("Secret path must start with \"/\"");
        const resp =  await this.call("GET", "/v1/secret" + secretPath, {});
        return d(resp.data.data);
    }

    public async setSecret(secretPath: string, secret: any) {
        if (secretPath.substring(0, 1) !== "/") throw new Error("Secret path must start with \"/\"");
        const resp =  await this.call("PUT", "/v1/secret" + secretPath, secret);
        if (resp.status !== 204) throw new Error("Error while setting the secret. Status is not 204");
    }

    public async deleteSecret(secretPath: string) {
        if (secretPath.substring(0, 1) !== "/") throw new Error("Secret path must start with \"/\"");
        const resp =  await this.call("DELETE", "/v1/secret" + secretPath, {});
        if (resp.status !== 204) throw new Error("Error while deleting the secret. Status is not 204");
    }

    public async initVault(opts: { secret_shares: number, secret_threshold: number }): Promise<{ root_token: string, keys: string [], keys_base64: string [] }> {
        const resp = await Axios.post(this.vaultAddr + "/v1/sys/init", { secret_shares: opts.secret_shares, secret_threshold: opts.secret_threshold });
        this.token = d(resp.data.root_token);
        return d(resp.data);
    }

    public async unseal(key: string) {
        await this.call("POST", "/v1/sys/unseal", { key: key });
    }

    public async seal() {
        await this.call("POST", "/v1/sys/seal", undefined);
    }

    public async putPolicy(policyName: string, policyHcl: string) {
        await this.call("PUT", "/v1/sys/policy/" + policyName, { policy: policyHcl });
    }

    public async enableAuthMethod(method: string, description: string, config: {}) {
        await this.call("POST", "/v1/sys/auth/" + method, { type: method, description: description, config: config });
    }

    public async createUserpassUser(username: string, password: string, policies: string []) {
        await this.call("POST", "/v1/auth/userpass/users/" + username, { password: password, policies: policies.join(",") });
    }

    public async createAppRoleRole(roleName: string, policies: string []) {
        await this.call("POST", "/v1/auth/approle/role/" + roleName, { policies: policies });
    }

    public async getAppRoleId(roleName: string): Promise<string> {
        const resp = await this.call("GET", "/v1/auth/approle/role/" + roleName + "/role-id", undefined);
        return d(resp.data.data.role_id);
    }

    public async generateAppRoleSecretId(roleName: string, metadata: any): Promise<string> {
        const resp = await this.call("POST", "/v1/auth/approle/role/"  + roleName + "/secret-id", { metadata: JSON.stringify(metadata) });
        return d(resp.data.data.secret_id);
    }

    public async revokeSelf() {
        await this.call("POST", "/v1/auth/token/revoke-self", undefined);
    }

    public async revokeToken(token: string) {
        await this.call("POST", "/v1/auth/token/revoke", { token: token });
    }
}