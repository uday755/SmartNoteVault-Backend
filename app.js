require('dotenv').config()
const express = require("express"); // Importing the Express Framework/library
var cors = require('cors');

const connectToMongoDB = require('./database');
connectToMongoDB();

const app = express() // app as a Express Application
app.use(cors());
const port = process.env.PORT || 5000;
app.use(express.json()); // Middlewere to use body of Request //
// Available Routes //
app.get('/', (req, res) => {

  res.send('We are Live from Backend at SmartNoteVault, A lot of things are going on in our side !')

})

app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));


app.listen(port, () => {
  console.log(`SmartNoteVault listening at http://localhost:${port}`)
})