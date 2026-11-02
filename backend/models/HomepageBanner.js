const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
    title: {
        type: String,
        required: false,
        trim: true
    },
    subtitle: {
        type: String,
        required: false,
        trim: true
    },
    buttonText: {
        type: String,
        required: false,
        trim: true
    },
    imageFilename: {
        type: String,
        required: false
    },
    linkUrl: {
        type: String,
        required: false,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    // Legacy fields preserved for backward compatibility and rollback
    image: {
        type: String,
        required: false
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false
    },
    primaryProduct: {
        type: mongoose.Schema.Types.Mixed
    },
    secondaryProducts: [{
        type: mongoose.Schema.Types.Mixed
    }]
}, { timestamps: true });

const homepageBannerSchema = new mongoose.Schema({
    slides: [slideSchema],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('HomepageBanner', homepageBannerSchema);
