require('dotenv').config()
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const Twitter = require('twitter')

admin.initializeApp()
const db = admin.firestore()

const twitter = new Twitter({
  consumer_key        : process.env.TWITTER_CONSUMER_KEY,
  consumer_secret     : process.env.TWITTER_CONSUMER_SECRET,
  access_token_key    : process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret : process.env.TWITTER_ACCESS_TOKEN_SECRET
})

const ingestTweets = handle => new Promise(resolve => {
  twitter.get('users/show', {screen_name: handle}, async (err, user, res) => {
    if (err) throw err
    const userId = user.id

    const getTweetBounds = query => {
      new Promise(async resolve => {
        const tweetIds = {newest: null, oldest: null}
        const qs = await query.get()
        if (!qs.empty) {
          const first = (...args) => new Promise(async resolve => {
            const qs = await query.orderBy(...args).limit(1).get()
            resolve(qs.docs[0].data().id)
          })
          tweetIds.oldest = await first('id') - 1,
          tweetIds.newest = await first('id', 'desc')
        }
        resolve(tweetIds)
      })
    }
    const getTweets = async (options, cb) => {
      new Promise(resolve => {
        twitter.get('statuses/user_timeline', {
          user_id: userId,
          count: 200,
          include_rts: false,
          ...options
        }, (err, tweets, res) => {
          if (err) throw err
          cb(tweets)
          resolve()
        })
      })
    }
    const addTweets = tweets => tweets.forEach(async (tweet) => {
      await tweetsRef.doc(tweet.id_str).set({
        id: tweet.id,
        body: tweet.text,
        user_id: userId
      })
    })

    const tweetsRef = db.collection('tweets')
    const query = tweetsRef.where('user_id', '==', userId)
    const tweetIds = await getTweetBounds(query)
    console.log(tweetIds)
    console.log('?')

    await getTweets({since_id: tweetIds.newest}, tweets => {
      if (tweets.length) addTweets(tweets)
      else getTweets({max_id: tweetIds.oldest}, tweets => addTweets(tweets))
    })

    resolve()
  })
})

exports.getTweets = functions.pubsub
  .topic('hourly-tick')
  .onPublish(msg => {
    ingestTweets(process.env.TWITTER_USER)
    return true
  })
