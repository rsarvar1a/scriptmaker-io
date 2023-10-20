// App framework

const express = require('express');
const { Server } = require('http');

// Handlers

const handle_new_brew = require('./actions/handle_new_brew');
const handle_send_pdf = require('./actions/handle_send_pdf');

// Util

const fs = require('fs');
const path = require('path');

// Configure app

const app = express();
const httpserver = Server(app);

app.use('/', express.static(__dirname + '/public'));
app.use('/homebrews', express.static(__dirname + '/homebrews'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.json());

// App routes

app.post('/api/brew', handle_new_brew);
app.get('/api/:scriptid/download/:pdftype', handle_send_pdf);
app.get('*', (req, res) => 
{
    res.render('app');
});

// Start server

httpserver.listen(3000);