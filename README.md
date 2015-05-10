# question-bot
A bot that answers questions via text, as an example of using Twilio cookies. Part of #MakeEveryWeek.

## Description

This is an experiment in using [Twilio](http://twilio.com) to collect and convey information in a bot-driven conversation over SMS texting. Read more about it [on my blog](http://johnkeefe.net/make-every-week-question-bot).

## Dependencies

This is written in [node.js](http://nodejs.org) and runs on an Amazon EC2 instance in the cloud. For more about setting that up, [see how I teach this](https://github.com/jkeefe/make-map-blink-class-10) to journalism undergraduates.

This uses additional node modules, installed via [npm](https://www.npmjs.com/). They are:

- [Express](https://www.npmjs.com/package/express)
- [body-parser](https://www.npmjs.com/package/body-parser)
- [cookie-parser](https://www.npmjs.com/package/cookie-parser)
- [Twilio](http://twilio.github.io/twilio-node/)

All of which can be installed with npm like this:

	npm install express body-parser cookie-parser twilio

## Keys

I store my API keys, tokens and other sensitive values in a directory outside of the application, mainly so I don't accidentally post those values here in the github repo.

The key file, say its name is `service_keys.js`, looks like this:

	var SOMESERVICE_AUTH_TOKEN = 'abcdefghijklmnop1234567',
		SOMEWEBSITE_API_KEY = 'qrstuvwxyz987654321';
	
		module.exports.SOMESERVICE_AUTH_TOKEN = SOMESERVICE_AUTH_TOKEN;
		module.exports.SOMEWEBSITE_API_KEY = SOMEWEBSITE_IO_API_KEY;

In the application code, I pull in all of the keys like this:

	var keys = require('../path-to-keys-directory/service_keys');
	
And instead of the actual key in the code, I'll use this in its place:

	keys.SOMEWEBSITE_API_KEY
	
## Running

I use [Forever](https://github.com/foreverjs/forever) to run this on my server as part of my (larger) `server.js` file, which handles requests on port 80, the http: port. 

The command I use to run the script and to keep a log file is:

	sudo forever start -a -l /path-to-log-directory/serverlog.txt server.js
	



