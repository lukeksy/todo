require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');

const authRouter     = require('./routes/auth');
const tasksRouter    = require('./routes/tasks');
const emailsRouter   = require('./routes/emails');
const syncRouter     = require('./routes/sync');
const internalRouter = require('./routes/internal');
const requireAuth    = require('./middleware/auth');
const requireApiKey  = require('./middleware/apiKey');

const app = express();

app.use(cors({
  origin:      process.env.FRONTEND_URL || 'https://todo.delaale.fr',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes publiques
app.use('/api/auth',     authRouter);
app.get('/api/health',   (_, res) => res.json({ status: 'ok', ts: new Date() }));

// Routes internes n8n (clé API)
app.use('/api/internal', requireApiKey, internalRouter);

// Routes protégées JWT (frontend)
app.use('/api/tasks',    requireAuth, tasksRouter);
app.use('/api/emails',   requireAuth, emailsRouter);
app.use('/api/sync',     requireAuth, syncRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`todo-api listening on :${PORT}`));
