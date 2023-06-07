const dotenv = require('dotenv');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(cors());

dotenv.config({path: './config.env'});
require('./db/conn');

const User = require('./model/userSchema');

app.use(require('./router/auth'));

const PORT = process.env.PORT || 6000;


app.listen(PORT, () => {
    console.log(`server is listening on ${PORT}`);
})