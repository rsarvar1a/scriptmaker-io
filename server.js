// App framework

const express = require('express');
const { Server } = require('http');

// Handlers

const handle_available = require('./actions/handle_available');
const handle_new_brew = require('./actions/handle_new_brew');
const handle_num_pages = require('./actions/handle_num_pages');
const handle_script_info = require('./actions/handle_script_info');
const handle_search = require('./actions/handle_search');
const handle_send_page = require('./actions/handle_send_page');
const handle_send_pdf = require('./actions/handle_send_pdf');

// Util

const fs = require('fs');
const path = require('path');

// Configure app

const app = express();
const httpserver = Server(app);
const dist = path.join(__dirname, "dist");

app.use(express.static(dist));
app.use(express.json());

// Create homebrew route

app.post('/api/brew', handle_new_brew);

// Informational routes

app.post("/api/search", handle_search);

app.get('/api/:scriptid', handle_script_info);

app.get('/api/:scriptid/download', handle_available);
app.get('/api/:scriptid/download/:pdftype', handle_send_pdf);

app.get('/api/:scriptid/pages', handle_num_pages);
app.get('/api/:scriptid/pages/:pagenum', handle_send_page);

// Kick rest up to frontend

app.get('*', (req, res) => 
{
    res.sendFile(path.join(dist, "index.html"));
});

// Start server

httpserver.listen(3000, () => 
{
    console.log("Ready and listening on port 3000.");
});