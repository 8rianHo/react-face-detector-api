const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt-nodejs');

const register = require('./controllers/register');
const image = require('./controllers/image');

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  }
});

const application = express();

application.use(bodyParser.json());
application.use(cors());

application.get('/', (req, res) => {
  res.send('This is working');
})

application.post('/signin', (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(400).json('incorrect form submission');
  }
  db.select('email', 'hash').from('login').where('email', '=', email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db.select().from('users').where('email', '=', email)
          .then(user => {
            res.json(user[0])
          })
          .catch(err => res.status(400).json('unable to get user'))
        res.json()
      } else {
        res.status(400).json('wrong credentials')
      }
    })
    .catch(err => res.status(400).json('wrong credentials'))
})

application.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) } )

application.get('/profile/:id', (req, res) => {
  const { id } = req.params;

  db.select('*').from('users').where({
    id: id
  }).then(user => {
    if (user.length > 0){
      res.json(user);
    } else {
      res.status(400).json("user cannot be found in the database")
    }
  })

})

application.put('/image', (req, res) => {
  const { id } = req.body;

  db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries)
  }).catch(err => res.status(400).json('unable to get entries'))

})

application.post('/imageurl', (req, res) => { image.handleImageURL(req, res) } )

application.listen(process.env.PORT || 3000, () => {
  console.log(`Application is running on port ${process.env.PORT}`);
})

// PLAN
/*
/ --> res = this is working
/signin --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT = updated user
*/