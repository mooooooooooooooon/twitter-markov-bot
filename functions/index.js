require('dotenv').config()
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const Twitter = require('twitter')
const intoStream = require('into-stream')
const markov = require('markov')

admin.initializeApp()
const db = admin.firestore()
db.settings({timestampsInSnapshots: true})

const twitter = new Twitter({
  consumer_key        : process.env.TWITTER_CONSUMER_KEY,
  consumer_secret     : process.env.TWITTER_CONSUMER_SECRET,
  access_token_key    : process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret : process.env.TWITTER_ACCESS_TOKEN_SECRET
})
const tweetsRef = db.collection('tweets')
const tweetsBy = userId => tweetsRef.where('user_id', '==', userId)

const ingest = async () => {
  const getBounds = async q => {
    const first = async (...args) =>
      (await q.orderBy(...args).limit(1).get()).docs[0].data().id
    const empty = (await q.get()).empty
    return {
      oldest: empty ? null : await first('id') - 1,
      newest: empty ? null : await first('id', 'desc')
    }
  }
  const fetchTweets = options => new Promise(async (resolve, reject) => {
    twitter.get('statuses/user_timeline', {
      user_id: await userId,
      count: 200,
      include_rts: false,
      ...options
    }, (err, tweets) => {
      err && reject(new Error(err))
      resolve(tweets)
    })
  })
  const addTweets = tweets => tweets.forEach(async tweet => {
    await tweetsRef.doc(tweet.id_str).set({
      id: tweet.id,
      body: tweet.text,
      user_id: await userId
    })
  })

  const userId = new Promise((resolve, reject) => twitter.get(
    'users/show',
    {screen_name: process.env.TWITTER_USER},
    (err, user) => {
      err && reject(new Error(err))
      resolve(user.id)
    }
  ))
  const bounds = await getBounds(tweetsBy(await userId))
  await addTweets([
    ...await fetchTweets({since_id: bounds.newest}),
    ...await fetchTweets({max_id: bounds.oldest})
  ])
  await db.doc(`users/${await userId}`).set({ingested: new Date()})
}

const compose = id => new Promise(async resolve => {
  const seeds = (await tweetsBy(id).get()).docs.map(x => `${x.data().body}\n`)
  const save = async tweet =>
    await db.doc(`drafts/${id}`).set({body: tweet}) && resolve(tweet)
  const cb = () => {
    const tweet = m.forward(m.pick(), 10).join(' ')
    if (tweet.length < 10) cb()
    else save(tweet)
  }
  const m = markov(2)
  m.seed(intoStream(seeds), cb)
})

exports.ingest = functions.pubsub
  .topic('hourly-tick')
  .onPublish(ingest)

exports.compose = functions.firestore
  .document(`users/{userId}`)
  .onWrite(async (change, ctx) =>
    change.after.exists && await compose(parseInt(ctx.params.userId))
  )
