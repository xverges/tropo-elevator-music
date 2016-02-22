
var tropoApi = require('tropo-webapi');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var request = require('request');

var app = express();
var port = process.env.VCAP_APP_PORT || 80;

app.use('/audio', express.static(path.join(__dirname, '/audio')));
app.use(bodyParser.json());

app.post('/', function(req, res){
    
    var audioBase = 'https://' + req.get('host') + '/audio/';
	var tropo = new tropoApi.TropoWebAPI();
    var sessionId = req.body.session.id;

    tropo.say(audioBase + 'please-wait.wav');
    tropo.say('I played a short wave file and I can continue');
    tropo.say(audioBase + 'muzak.wav', null, null, 'long', null, null, 'recordingPosted');
    tropo.say('Tropo won\'t get here after we interrupt it');
    tropo.on('continue', 'bye', '/bye');

    function recordingDone() {
        var url = 'https://api.tropo.com/1.0/sessions/' +
                  sessionId +
                  '/signals?action=signal&value=recordingPosted';
                  
        request.get(url)
               .on('error', function(err) {
                    console.error('call to tropo failed');
                    console.log(err);
               })
              .on('response', function(response) {
                    console.log('asked tropo to interrupt the muzak');
              });
    }

    setTimeout(recordingDone, 12000);

    console.log(JSON.stringify(tropo, null, 2));
    res.send(tropoApi.TropoJSON(tropo));
});

app.post('/bye', function(req, res){

	var tropo = new tropoApi.TropoWebAPI();
    tropo.say('I was interrupted, but here I am again!');
    console.log(JSON.stringify(tropo, null, 2));
    res.send(tropoApi.TropoJSON(tropo));
});

app.listen(port);
console.log('Server running on port :' + port);
