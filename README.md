# Marblez

- [Marblez](#marblez)
  - [Status](#status)
  - [Setup](#setup)
  - [Staging / Production](#staging--production)
    - [Backend](#backend)
    - [Frontend](#frontend)

## Status

|Server|URL|Status|
|---|---|---|
|Client|https://marblez.netlify.app|[![Netlify Status](https://api.netlify.com/api/v1/badges/8605c81a-03b0-416b-a114-45dec7410ee8/deploy-status)](https://app.netlify.com/sites/marblez/deploys)|
|Server|https://api-marblez.herokuapp.com|![Heroku](https://pyheroku-badge.herokuapp.com/?app=api-marblez)|

## Setup

- Create a service account and invite to the spreadsheet. The spreadsheet id is in code though
- Copy the service account key file to `marble-service-account.json` in server folder
- `lerna bootstrap --hoist` and then `npm run dev`

## Staging / Production

### Backend

- In heroku, set env variables `MONGO_HOST`, `NPM_CONFIG_PRODUCTION = false`, `SERVICE_ACCOUNT_KEY_FILE`

### Frontend

- In netlify, set env variables `API_URL`
- Set build command to be `npm run build` and publish directory to `client/dist`
