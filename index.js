const express = require('express')
const app = express()
const routes = require('./routes.js')
const path = require('path')
require('./models/db')   //for connecting to database only

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/',routes);
app.post('/register',routes);
app.get('/login',routes);
app.post('/login',routes);
app.get('/success',routes);
app.get('/logout',routes);
app.post('/addmessage',routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Server started at Port ${PORT}`);
})