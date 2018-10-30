
# Wise Vault

<!--§ data.config.repository.readme.generateDefaultBadges(data) §-->
[![License](https://img.shields.io/github/license/wise-team/wise-vault.svg?style=flat-square)](https://github.com/wise-team/wise-vault/blob/master/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![Chat](https://img.shields.io/badge/chat%20on%20discord-6b11ff.svg?style=flat-square)](https://discordapp.com/invite/CwxQDbG) [![Wise operations count](https://img.shields.io/badge/dynamic/json.svg?label=wise%20operations%20count&url=https%3A%2F%2Fsql.wise.vote%2Foperations%3Fselect%3Dcount&query=%24%5B0%5D.count&colorB=blue&style=flat-square)](https://sql.wise.vote/operations?select=moment,delegator,voter,operation_type&order=moment.desc)
<!--§§.-->

User security is a top priority for us at @wise-team. That is why Wise uses industry-standard top-security Hashicopr's vault to store steemconnect tokens.

## Instructions

### Deployment
Vault is deployed with ansible playbooks. Just run the wise-vote playbook with `--tags "vault"`

### Init
```bash
$ ./scripts/vault-exec.sh status # check if vault is accessible
$ ./scripts/vault-exec.sh operator init 
# This command will output 5 unseal keys. Distribute them among wise-team members.
# Warning! This can be done only once. There is no possibility to reset unseal keys. 
```

### Unseal
At least three of us has to run to the production server and run:
```bash
$ ./scripts/vault-exec.sh status # check if vault is accessible
$ ./scripts/vault-exec.sh operator unseal 
# The command will prompt for unseal key.
```

### Backup
Manual backup is done with ansible.
Run the wise-vote playbook with `--tags "vault-backup"`. It will download sealed and sealed and gzipped version of vault to
the local machine. As it is sealed, it can be securely stored anywhere. To unseal it someone needs at least 3 of the 5 unseal keys 
that are distributed among @wise-team members. 




<!--§ data.config.repository.readme.generateHelpMd(data) §-->
## Where to get help?

- Feel free to talk with us on our chat: [https://discordapp.com/invite/CwxQDbG](https://discordapp.com/invite/CwxQDbG) .
- You can read [The Wise Manual](https://wise.vote/introduction)
- You can also contact Jędrzej at jedrzejblew@gmail.com (if you think that you found a security issue, please contact me quickly).

You can also ask questions as issues in appropriate repository: See [issues for this repository](https://github.com/wise-team/wise-vault/issues).

<!--§§.-->

<!--§ data.config.repository.readme.generateHelpUsMd(data) §-->
## Contribute to steem Wise

We welcome warmly:

- Bug reports via [issues](https://github.com/wise-team/wise-vault).
- Enhancement requests via via [issues](https://github.com/wise-team/wise-vault/issues).
- [Pull requests](https://github.com/wise-team/wise-vault/pulls)
- Security reports to _jedrzejblew@gmail.com_.

**Before** contributing please **read [Wise CONTRIBUTING guide](https://github.com/wise-team/steem-wise-core/blob/master/CONTRIBUTING.md)**.

Thank you for developing WISE together!



## Like the project? Let @wise-team become your favourite witness!

If you use & appreciate our software — you can easily support us. Just vote for "wise-team" to become you one of your witnesses. You can do it here: [https://steemit.com/~witnesses](https://steemit.com/~witnesses).

<!--§§.-->

<!-- Prayer: Gloria Patri, et Filio, et Spiritui Sancto, sicut erat in principio et nunc et semper et in saecula saeculorum. Amen. In te, Domine, speravi: non confundar in aeternum. -->
