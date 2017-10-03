const env = process.env;
const mailgunConfig = {
  publicApiKey: env.MAILGUN_PUBLIC_API_KEY,
  apiKey: env.MAILGUN_API_KEY,
  domain: env.MAILGUN_DOMAIN
};
const list = env.MAILGUN_MAILING_LIST;

for(let key in mailgunConfig) {
  if(!mailgunConfig[key]) {
    console.log(`Make sure you provided all the required environment variables. Failed to detect ${key}.`);
    return false;
  }
}

if(!list) {
  console.log('Make sure you provided the MAILGUN_MAILING_LIST environment variable.');
  return false;
}

const base = env.APP_BASE || '/';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mailgun = require('mailgun-js')(mailgunConfig);

const app = express();
const mailing = express();

const whitelist = env.WHITELIST_DOMAINS ?
  env.WHITELIST_DOMAINS.split(',').map(s => s.trim()) :
  false;
const corsOptions = {
  origin: function(origin, callback) {
    if(!whitelist) {
      callback(null, true);
    } else {
      if(whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  }
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const validateName = function(req, res, next) {
  if(req.body.name) {
    next();
  } else {
    res.status(400).send('name_empty');
  }
}

const validateEmail = function(req, res, next) {
  if(req.body.email) {
    mailgun.validate(req.body.email, function(err, body) {
      if(body && body.is_valid) {
        next();
      } else {
        res.status(400).send('email_invalid');
      }
    });
  } else {
    res.status(400).send('email_empty');
  }
};

const parseSubscription = function (req, res, next) {
  const { name, email, ...vars } = req.body;
  req.member = {
    name: name,
    address: email,
    vars: vars
  };
  next();
};

mailing.post('/validate', validateEmail, function(req, res) {
  res.send('ok');
});

mailing.post('/subscribe',
  validateName,
  validateEmail,
  parseSubscription,
  function(req, res) {
    mailgun
      .lists(list)
      .members()
      .add({members: [req.member], subscribed: true}, function(err, body) {
        if(err) {
          res.status(400).send(err);
        } else {
          res.send(body);
        }
      });
  }
);

app.use(base, mailing);

const port = env.PORT || 3000;
app.listen(port, function() {
  console.log(`Running on port ${port}`);
});
