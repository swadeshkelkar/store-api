const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const checkAuth = require('../middleware/check-Auth');

const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', checkAuth, async (req, res, next)=>{
    try {
        const orders = await Order.find().populate('product', '_id name price');
        res.status(200).json({
            count: orders.length,
            orders: orders.map(order => {
                return {
                    _id: order._id,
                    product: order.product,
                    quantity: order.quantity,
                    request: {
                        type: "GET",
                        url: "http://localhost:5000/orders/" + order._id
                    }
                }
            }),
        });
    } catch (error) {
        res.status(500).json({
            error: error
        });
    }
});

router.post('/', checkAuth, async (req, res, next)=>{
    try {
        const isProduct = await Product.findById(req.body.productId);
        if(isProduct){
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                product: req.body.productId,
                quantity: req.body.quantity
            });
        
            const createdOrder  = await order.save();
            res.status(201).json({
                message: 'Order was created',
                order: {
                    _id: createdOrder._id,
                    product: createdOrder.product,
                    quantity: createdOrder.quantity,
                },
                request: {
                    type: "GET",
                    url: "http://localhost:5000/orders/" + createdOrder._id
                }
            })
        }
        else{
            res.status(404).json({error: 'Product not found'});
        }
        
    } catch (error) {
        res.status(500).json({
            error: error
        })
    }
})

router.get('/:orderId', checkAuth, async (req, res, next)=>{
    try {
        const order = await Order.findById(req.params.orderId).populate('product', '_id name price');
        if(order){
            res.status(200).json({
                order: {
                    _id: order._id,
                    product: order.product,
                    quantity: order.quantity
                },
                request: {
                    type: "GET",
                    url: "http://localhost:5000/orders/"
                }
            })
        }
        else{
            res.status(404).json({error: 'Order not found'});
        }
    } catch (error) {
        res.status(500).json({
            error: error
        })
    }
    
})

router.delete('/:orderId',checkAuth, async (req, res, next)=>{
    try {
        const isOrder = await Order.findById(req.params.orderId);
        if(isOrder){
            const del = await Order.deleteOne({_id: req.params.orderId});
            res.status(200).json({
                message: 'Order deleted successfully',
                request: {
                    type: "POST",
                    url: "http://localhost/5000/orders",
                    body: {
                        product: "Id", quantity: "Number"
                    }
                }
            })
        }
        else{
            res.status(404).json({error: 'Order not found'});
        }
    } catch (error) {
        res.status(500).json({
            error: error
        })
    }
})

module.exports = router;