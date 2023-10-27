// App framework

const express = require('express');
const cors = require('cors');

// Util

const fs = require('fs');
const path = require('path');

// Handlers

const handle_all_documents = require('./actions/handle_all_documents');
const handle_document_info = require('./actions/handle_document_info');
const handle_new_brew = require('./actions/handle_new_brew');
const handle_num_pages = require('./actions/handle_num_pages');
const handle_script_info = require('./actions/handle_script_info');
const handle_search = require('./actions/handle_search');
const handle_send_all_pages = require('./actions/handle_send_all_pages');
const handle_send_page = require('./actions/handle_send_page');
const handle_send_pdf = require('./actions/handle_send_pdf');
const handle_send_logo = require('./actions/handle_send_logo'); 
const handle_send_json = require('./actions/handle_send_json');

// Configure app

const app = express();
app.use(express.json());
app.use(cors());

// Frontend 

const dist = path.join(__dirname, "dist");
app.use(express.static(dist));

// API

app.post('/api/brew', handle_new_brew);
app.post("/api/search", handle_search);

app.get('/api/:scriptid', handle_script_info);
app.get('/api/:scriptid/documents', handle_all_documents);
app.get('/api/:scriptid/documents/:document', handle_document_info);
app.get('/api/:scriptid/documents/:document/download', handle_send_pdf);
app.get('/api/:scriptid/documents/:document/pages', handle_num_pages);
app.get('/api/:scriptid/documents/:document/pages/all', handle_send_all_pages);
app.get('/api/:scriptid/documents/:document/pages/:page', handle_send_page);
app.get('/api/:scriptid/logo', handle_send_logo);
app.get('/api/:scriptid/script', handle_send_json);

// Kick rest to frontend

app.get("*", (req, res, next) =>
{
    res.redirect("/");
});

// Start server

app.listen(3000, () => 
{
    console.log("Ready and listening on port 3000.");
});