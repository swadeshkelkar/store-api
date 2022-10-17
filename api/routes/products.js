const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-Auth');

const Product = require('../models/product');

// to define storage strategy
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        // null for no error
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + file.originalname);
    }
})

// to define image filter
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype==='image/png'){
        cb(null, true);
    }
    else{
        // can throw error
        cb(null, false);
    }
}

const upload =multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: fileFilter
});

router.get('/', async(req, res, next)=>{
    try {
        const products = await Product.find();
        const response = {
            count : products.length,
            products: products.map(product => {
                return {
                    name: product.name,
                    price: product.price,
                    _id: product.id,
                    productImage: product.productImage,
                    request: {
                        type: "GET",
                        url: "http://localhost:5000/products/" + product._id
                    }
                }
            })
        }

        if(products.length){
            res.status(200).json({response});
        }
        else{
            res.status(404).json({error: "product not found"})
        }
    } catch (err) {
        res.status(500).json({error: err});
    }
    res.status(200).json({
        message: 'Handling GET requests for product routes'
    })
});

router.post('/', checkAuth, upload.single('productImage'), async (req, res, next)=>{

    try {
        console.log(req.file);
        const product = new Product({
            _id: mongoose.Types.ObjectId(),
            name: req.body.name,
            price: req.body.price,
            productImage: req.file.path
        });
    
        const createdProduct = await product.save();
        res.status(201).json({
            message: 'product created successfully',
            product: {
                name: createdProduct.name,
                price: createdProduct.price,
                _id: createdProduct._id,
                productImage: createdProduct.productImage,
                request: {
                    type: "GET",
                    url: "http://localhost:5000/products/" + createdProduct._id
                }
            }
        });
    } catch (err) {
        res.status(500).json({
            error: err
        });
    }

    // product.save()
    // .then(result => {
    //     console.log(result);     
    // })
    // .catch(err=> console.log(err));
    // res.status(200).json({
    //     message: 'Handling post requests for product routes',
    //     createdProduct: product
    // });
    

});

router.get('/:productId', checkAuth, async (req, res, next)=>{
    try {
        const id = req.params.productId;
        const product = await Product.findById(id);
    
        if(product){
            res.status(200).json({
                 product: {
                    name: product.name,
                    price: product.price,
                    _id: product._id,
                    productImage: product.productImage
                 },
                 request: {
                    type: "GET",
                    url: "http://localhost:5000/products"
                 }
                });
        }
        else{
            res.status(404).json({error: 'Product not found'});
        }
    } catch (err) {
        res.status(500).json({error: err});
    }


})


router.patch('/:productId', checkAuth, async (req, res, next)=>{
    try {
        const id = req.params.productId;
        // patch operations object
        const updateOps={};
        // storing operations in the above object
        for(const ops of req.body){
            updateOps[ops.propName]=ops.value;
        }
        // update product with the set keyword and the operations object with the matching id
        const pat = await Product.updateOne({_id: id}, {$set: updateOps});
        res.status(200).json({
            message: "Product updated successfully",
            request: {
                type: "GET",
                url: "http://localhost:5000/products/" + id
            }
        });
    } catch (error) {
        res.status(500).json({error: error});
    }
} )

router.delete('/:productId', checkAuth, async(req, res, next)=>{
    try {
        const isProduct = await Product.findById(req.params.productId);
        if(isProduct){
            const del = await Product.deleteOne({_id: req.params.productId});
            res.status(200).json({
                message: "Product deleted successfully",
                request: {
                    type: "POST",
                    url: "http://localhost/5000/products",
                    body: {
                        name: "String", price: "Number"
                    }
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

module.exports = router;