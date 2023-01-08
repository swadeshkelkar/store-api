const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/user');

router.post('/signup', async (req, res, next)=> {
    try {
        const user = await User.findOne({email: req.body.email});
        if(user){
            res.status(400).json({
                message: 'Email exists'
            })
        }
        else{
            const salt = await bcrypt.genSalt(10);
            const hash= await bcrypt.hash(req.body.password, salt);
            const user = new User({
                _id: mongoose.Types.ObjectId(),
                email: req.body.email,
                password: hash
            });
            const createdUser = await user.save();
            console.log(createdUser);
            res.status(201).json({
                message: 'User created'
            })
        }
    } catch (error) {
        res.status(500).json({
            error: error
        })
    }
});


router.post('/login', async (req, res, next)=>{
    try {
        const user = await User.find({email: req.body.email});
        if(user.length<1){
            res.status(401).json({
                message: "Auth failed"
            })
        }
        else{
            const isMatch = await bcrypt.compare(req.body.password, user[0].password);
            if(!isMatch){
                res.status(401).json({
                    message: "Auth failed"
                })
            }
            else{
                const token = jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id
                },
                process.env.secret,
                {
                    expiresIn: "1h"
                });
                res.status(200).json({
                    message: "Auth Successful",
                    token: token
                });
            }
        }
    } catch (error) {
        res.status(500).json({
            error: error
        })
    }
    
})

router.delete('/:userId', async (req, res)=>{
    try {
        const user = await User.findOne({userId: req.params.userId});
        if(user){
            const deleted = await User.deleteOne({userId: req.params.userId});
            res.status(200).json({
                message: 'User account deleted successfully',
                details: deleted
            })
        }
        else{
            res.status(500).json({
                error: error
            })
        }
    } catch (error) {
        res.status(500).json({
            error: error
        })
    }
})

module.exports = router;