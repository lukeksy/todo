require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const tasksRouter = require('./routes/tasks');
const emailsRouter = require('./routes/emails');
const syncRouter  = require('./routes/sync');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.use('/api/tasks',  tasksRouter);
app.use('/api/emails', emailsRouter);
app.use('/api/sync',   syncRouter);

app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`todo-api listening on :${PORT}`));
