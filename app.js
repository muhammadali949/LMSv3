const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
// DB Config
const db = require('./config/keys').mongoURI;
const PORT = require('./config/keys').PORT;

app.use(express.json());
app.use(cors());
app.use(express.json({ type: 'application/*+json' }));

// Connect to mongodb

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connect to mongodb');
  })
  .catch((err) => console.warn(err));

//routes
app.use('/users', require('./routes/auth'));
app.use('/users', require('./routes/userRequest'));
app.use('/admin', require('./routes/leavetype'));
app.use('/admin', require('./routes/department'));

const PORT1 = process.env.PORT || PORT;

app.use(express.static(path.join(__dirname, './client/build')));
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});
app.listen(PORT1, console.log(`Server running o  ${PORT1}`));
module.exports = app;
