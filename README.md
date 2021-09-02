# Marblez

## Status

|Server|URL|Status|
|---|---|---|
|Client|https://marblez.fly.dev|[![CD](https://github.com/IniZio/marblez/actions/workflows/cd.yaml/badge.svg)](https://github.com/IniZio/marblez/actions/workflows/cd.yaml)|
|Server|https://api-marblez.fly.dev|[![CD](https://github.com/IniZio/marblez/actions/workflows/cd.yaml/badge.svg)](https://github.com/IniZio/marblez/actions/workflows/cd.yaml)|

## Setup

- `blackbox_postdeploy`
- `yarn dev`

### Github Secrets

```sh
# Secret key
gpg -a --export-secret-keys deploy-marblez > deploy-marblez.private
cat -e deploy-marblez.private | sed 's/\$/\\n/g'

# Public key
gpg -a --export deploy-marblez > deploy-marblez.public
cat -e deploy-marblez.public | sed 's/\$/\\n/g'
```
