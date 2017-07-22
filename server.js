// server.js
// where your node app starts

// init project
const express = require('express'),
  useragent = require('express-useragent'),
  isUrl = require('is-url'),
  mongodb = require('mongodb'),
  GoogleImages = require('google-images')
const app = express()
const MongoClient = mongodb.MongoClient
 
const client = new GoogleImages(process.env.CSE_ID, process.env.API_KEY)

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'))

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

app.get('/api/imagesearch/:search', (req, res) => {
  const search = req.params.search
  const page = +req.query.offset || 1
  MongoClient.connect(process.env.DB_URL)
    .then(db => {
      db.collection('searchHistory')
      .insert({
        term: search,
        when: new Date()
      })
      .then(() => db.close())
      .catch(err => {
        throw err
      })
    })
    .then(() => client.search(search, {page}))
    .then(images => res.json(images))
    .catch(error => res.send(error.messagge))
})

app.get('/api/latest/imagesearch', (req, res) => {
  MongoClient.connect(process.env.DB_URL)
    .then(db => {
      db.collection('searchHistory')
      .find({}, {_id: 0, term: 1, when: 1}).toArray()
      .then(results => {
        db.close()
        res.json(results)
      })
      .catch(err => {
        throw err
      })
    })
    .catch(error => res.send(error.message))
})

// listen for requests :)
const listener = app.listen(process.env.PORT, () =>
  console.log('Your app is listening on port ' + listener.address().port)
)
