require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'));

io.on('connection', (socket) => {
  socket.on('new-expense', (data) => io.emit('update-expenses', data));
});

app.use('/api/auth', authRoutes);
app.use('/api/expense', expenseRoutes);

const PORT = process.env.PORT || 5030;
server.listen(PORT, () => console.log(`listening to port : ${PORT}`));
