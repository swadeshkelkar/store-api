const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');
// app.use((req, res, next)=> {
//     res.status(200).json({
//         'message': 'It works!'
//     })
// })

mongoose.connect(process.env.mongoURI);

app.use(morgan('dev'));
// make uploads folder public with uploads at beginning of URL
// another approach is to set up a route for accessing images
// put /uploads to take urls targeted only at /uploads
// then that part will be ignored by static
app.use('/uploads',express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// handling CORS errors
app.use((req, res, next)=>{
    // to handle no access control allow origin header present error
    res.header('Acess-Control-Allow-Origin', '*');
    // list of allowed headers with requests
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Accept, Authorizaton');
    // browser send options header first in case of post, put, etc. requests to check 
    // whether it can send this type of request
    if(req.method === 'OPTIONS'){
        // list of allowed methods
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
})

// routes for handing requests
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);

// create not found error
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

// send error
app.use((error, req, res, next) =>{
    res.status(error.status || 500);
    res.json({
        message: error.message
    });
});

module.exports = app;