creds = {"user1" : "pw1" , "user2" : "pw2"};

var express = require('express');
var fs = require('fs');
var formidable = require("formidable");
var util = require('util');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var nextId = 1;
var clients = {};
var exclusion_list = {};

var app = express();

app.use(express.static('public'));
app.use(cookieParser());
app.get('/login', displayForm);
app.post('/login', processAllFieldsOfTheForm);

app.get('/event',function(req, res) {
  console.log("client connected\n");
  var clientId = nextId;
  clients[clientId] = { res: res };
  nextId++;
  console.log("Registering clients");
  res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
});

app.post('/message', bodyParser.json(), function(req, res) {
  console.log(req.body);
  var outMsg = JSON.stringify(req.body);  
  console.log(outMsg+"\n");
  Object.keys(clients).forEach(function(clientId) {
    if(exclusion_list[clientId]!=true){
    clients[clientId].res.write('event: message\n');
    clients[clientId].res.write('data: ' + outMsg + '\n\n');
    }
    else {
      console.log('ignoring : ' + clientId); 
    }
  });
  res.sendStatus(200);
});

app.get('/editor', function(req, res) {
  if(!req.cookies.is_logged_in) {
    res.end('Unauthorized')
  } else {
    res.redirect('/editor.html');
  }
});

app.get('/list', getList);

app.get('/sleep',function(req, res) {
  console.log("client requested sleep\n");
  if(!req.cookies.client_id) {
    res.end('Unauthorized')
  } else {
    exclusion_list[req.cookies.client_id] = true;
  }
});

app.get('/unsleep',function(req, res) {
  console.log("client requested unsleep\n");
  if(!req.cookies.client_id) {
    res.end('Unauthorized')
  } else {
    if(exclusion_list[req.cookies.client_id] == true)
      exclusion_list[req.cookies.client_id]=false;
  }
});


function displayForm(req, res) {
    fs.readFile('./public/login.html', function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
                'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}

function processAllFieldsOfTheForm(req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
      	if (creds[fields.un] == fields.pw) {
      		res.cookie('is_logged_in', 'true');
          res.redirect('/editor');
          var curr_user = fields.pw;
          
      		res.end();
      	} else {
      		res.write('Entry denied');
      		res.end();
      	}

    });
}

app.listen(8000, function() {
  console.log("server listening on 8000");
});

function getList(req, res) {
  fs.readFile('./public/data/list.txt', function(err, data) {
    var json = JSON.parse(data);
    var data = json.filter(function(js) {
      return js.substring(0, parseInt(req.query.l)) === req.query.v;
    });
    res.end(JSON.stringify(data));  
  });
}