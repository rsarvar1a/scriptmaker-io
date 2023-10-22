// App framework

const express = require('express');
const { Server } = require('http');

// Handlers

const handle_available = require('./actions/handle_available');
const handle_new_brew = require('./actions/handle_new_brew');
const handle_num_pages = require('./actions/handle_num_pages');
const handle_send_page = require('./actions/handle_send_page');
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

// Create homebrew route

app.post('/api/brew', handle_new_brew);

// PDF routes

app.get('/api/:scriptid/download', handle_available);
app.get('/api/:scriptid/download/:pdftype', handle_send_pdf);

// PNG routes

app.get('/api/:scriptid/pages', handle_num_pages);
app.get('/api/:scriptid/pages/:pagenum', handle_send_page);

// Kick rest up to frontend

app.get('*', (req, res) => 
{
    res.render('app');
});

// Start server

httpserver.listen(3000, () => {
    console.log("Ready and listening on port 3000.");
});