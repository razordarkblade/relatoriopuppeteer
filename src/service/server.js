const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use( cors());

app.use('/',require('./routes'))

var server = app.listen(4006, () =>{
    var host = server.address().address;
    var port = server.address().port;
    console.log('Listeneing at http://%s:%s', host, port);
});

server.timeout = 600000