/*

This is a simple server router that runs with node.js (http://nodejs.org/)
and processes incoming posts and other requests.

Based on code originally written by Noah Veltman, veltman.com

John Keefe
http://johnkeefe.net
May 2015

*/

// establish all of the dependency modules
// install these modules with "npm" the node packet manager
//    npm install express request body-parser flickrapi cookie-parser twilio

var express = require('express'),
    fs = require('fs'),
    request = require('request'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    app = express(),
    twilio = require('twilio'),
    twilioKeys = require('../bothouse/api_keys/twilio_keys');

// this is needed to read the body!
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// this is needed to read cookies!
app.use(cookieParser());

// Running a Twilio conversation with cookies
//
//  Note: Here I am confirming that the post request came from twilio
//  using the 'twilio.webhook()' paramerter in the next line.
//  That checks the TWILIO_AUTH_TOKEN, which I have stored in a 
//  file outside of this directory so I don't accidentally post my
//  token into Github. It can also be set using: 
//    export TWILIO_AUTH_TOKEN=[my auth token string]
//  ... but that doesn't work with forever, which I use to run the server.
//  More the webhook authorization here:
//  https://www.twilio.com/blog/2014/01/secure-your-nodejs-webhooks-with-middleware-for-express-middleware.html
// 
app.post(/^\/?question-bot/i, twilio.webhook(twilioKeys.TWILIO_AUTH_TOKEN), function(request, response){
    
	// is there a body of information
	if (!request.body) {
		request.send("Posting error");
		return true;
	}
	
	// incoming text message assigned to content
	text_body = request.body.Body.toLowerCase();
	
	// create a TwiML response back to start to build
	var twiml = new twilio.TwimlResponse();
	
	// quick time calculation for cookie expiration
	var timestamp = new Date(); // now
	var hours = timestamp.getUTCHours();       // get current hour
	timestamp.setUTCHours(hours + 4);          // tick the timestamp hours up by 4
	var expire_time = timestamp.toUTCString(); // like 'Wed, 06 May 2015 08:52:22 GMT'
	
	// See if there are cookies for this caller!
	// Great writeup of this here:
	// https://www.twilio.com/blog/2014/07/the-definitive-guide-to-sms-conversation-tracking.html
	
	// if there are no cookies yet, make the dictionary
	if (!request.cookies) {
	    request.cookies = {};  
	    }

	var chat_message = "";
	
	// if the text starts with hello and there's no name cookie ...
	if ( (text_body.match(/^hello/)) && (!request.cookies.name_cookie) ) {
	    chat_message = "Hi! What's your name?";
	    response.cookie('name_cookie', 'waiting', expire_time);
	} 
	
	// if the name cookie exists and it's "waiting" ...
	if ( (request.cookies.name_cookie) && (request.cookies.name_cookie == "waiting") )  {
	    chat_message = "Nice to meet you, " + text_body + ". Do you like dogs?";
	    response.cookie('dog_cookie', 'waiting', expire_time);
	    response.cookie('name_cookie', text_body, expire_time);
	}
	
	// if the dog cookie exists and it's "waiting" ...
	if ((request.cookies.dog_cookie) && (request.cookies.dog_cookie == "waiting")) {
            response.cookie('dog_cookie', text_body, expire_time);
            chat_message="OK! Do you like cats?";
            response.cookie('cat_cookie', 'waiting', expire_time);
	}
	
	// if the cat cookie exists and it's "waiting" ...
	if ((request.cookies.cat_cookie) && (request.cookies.cat_cookie == "waiting")) {
	    var cat_cookie = text_body;
	    if (request.cookies.dog_cookie.match(/^y/) && cat_cookie.match(/^y/)) {
	        chat_message = "I like both cats and dogs, too!";
	    } else 
	    
	    if (request.cookies.dog_cookie.match(/^n/) && cat_cookie.match(/^n/)) {
	        chat_message = "That's okay. Maybe you're more of a bird person!";
	    } else 
	    
	    if (request.cookies.dog_cookie.match(/^y/) && cat_cookie.match(/^n/)) {
	        chat_message = "Arf! Arf! Dogs are a person's best friend!";       
        } else
        
        if (request.cookies.dog_cookie.match(/^n/) && cat_cookie.match(/^y/)) {
            chat_message = "Meow! Cats make great pets!";
        }
        
        // delete the cookies!
        response.clearCookie('name_cookie');
        response.clearCookie('dog_cookie');
        response.clearCookie('cat_cookie');
	    
	}
	
	// catch bye and goodbye and you're welcome
	if (text_body.match(/bye$/) || text_body.match(/welcome$/)) {
	    chat_message="Bye! Nice chatting with you.";
        // delete the cookies!
        response.clearCookie('name_cookie');
        response.clearCookie('dog_cookie');
        response.clearCookie('cat_cookie');
	}
	
	// if we get a hello and name cookie already exists, address the person and give instructino
	if ( (text_body.match(/^hello/)) && (request.cookies.name_cookie) ) {
	    chat_message = "Hello again, " + request.cookies.name_cookie +". (To start over, say 'bye' first.) ";
	}
	
	
	// Render the TwiML response as XML
    twiml.message(chat_message);
	response.type('text/xml');
	response.send(twiml.toString());
	
	console.log(text_body);
	console.log(request.cookies);	
	
});

app.use(express.static(__dirname));
 
app.listen(80);
console.log('running!');

