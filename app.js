const express = require('express');
const ticket = require('./server/routes/ticket');
const healthcheck = require('./server/routes/healthcheck');
const path = require('path');
const fallback = require('express-history-api-fallback');

const app = express();

app.use('/ticket', ticket);
app.use('/healthcheck', healthcheck);
app.use('/', express.static(path.resolve('public/client')));
app.use(fallback('index.html', {
  root: path.resolve('public/client')
}));

app.listen(3002);