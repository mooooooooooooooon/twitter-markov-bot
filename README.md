# twitter-markov-bot

## Setup

### Dependencies
- [`git`](https://git-scm.com/downloads)
- [`node` and `npm`](https://nodejs.org/en/)
- [Google Cloud SDK](http://cloud.google.com/sdk/)

### Configure your local environment
1. `git clone https://github.com/mooooooooooooooon/twitter-markov-bot.git`
2. `npm i -g firebase-tools`

### Configure targets
1. Create a Developers Console project
2. [Enable the Pub/Sub API](https://console.cloud.google.com/flows/enableapi?apiid=pubsub&redirect=https://console.cloud.google.com)
3. [Enable Project Billing](https://support.google.com/cloud/answer/6293499#enable-billing)
4. Create a Firebase project associated with your Developers Console project

### Configure Twitter
1. At project root, `nano functions/.env`
2. Paste this:

    ```
    TWITTER_CONSUMER_KEY=<your consumer key>
    TWITTER_CONSUMER_SECRET=<your consumer secret>
    TWITTER_ACCESS_TOKEN_KEY=<your access token key>
    TWITTER_ACCESS_TOKEN_SECRET=<your access token secret>
    TWITTER_USER=<@username of account to seed generator with (no @ symbol)>
    ```

## Deployment

### App Engine
1. At project root, `gcloud config set project <your-project-id>`
2. `cd appengine`
3. `npm i`
4. `gcloud app create`
5. `npm run deploy`

### Firebase
At project root, `firebase deploy`
