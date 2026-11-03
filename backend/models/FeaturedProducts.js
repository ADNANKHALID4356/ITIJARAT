const mongoose = require('mongoose');

const featuredProductsSchema = new mongoose.Schema({
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    layoutConfig: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        slotSize: {
            type: String,
            enum: ['hero', 'wide', 'tall', 'small'],
            default: 'small'
        },
        order: {
            type: Number,
            default: 0
        }
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('FeaturedProducts', featuredProductsSchema);
