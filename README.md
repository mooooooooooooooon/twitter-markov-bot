# twitter-markov-bot

## Dependencies
- [`git`](https://git-scm.com/downloads)
- [`node` and `npm`](https://nodejs.org/en/)
- [Google Cloud SDK](http://cloud.google.com/sdk/)

## Configure your local environment
1. `git clone https://github.com/mooooooooooooooon/twitter-markov-bot.git`
2. `npm i -g firebase-tools`

## Configure targets
1. Create a Developers Console project
2. [Enable the Pub/Sub API](https://console.cloud.google.com/flows/enableapi?apiid=pubsub&redirect=https://console.cloud.google.com)
3. [Enable Project Billing](https://support.google.com/cloud/answer/6293499#enable-billing)
4. Create a Firebase project associated with your Developers Console project

## Deploying

### App Engine
1. At project root, `gcloud config set project <your-project-id>`
2. `cd appengine`
3. `npm i`
4. `gcloud app create`
5. `npm run deploy`

### Firebase
At project root, `firebase deploy`
