const mongoose= require('mongoose')

const donationSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    donationType: {
        type: String,
        enum: ['food', 'clothes', 'toys', 'electronics', 'books', 'medicines', 'other', 'others'],
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    remainingQty: {
        type: Number,
        required: true,
        min: 0,
    },
    description: {
        type: String,
        default: '',
        maxlength: [1000, 'Description cannot exceed 1000 characters'], //azzedine request
    },
    status: {
        type: String,
        enum: ['available', 'completed'],
        default: 'available',
    },
    contactPhone: {
        type: String,
        trim: true,
        default: null,
    },
    contactEmail: {
        type: String,
        trim: true,
        default: null,
        match: [/^\S+@\S+\.\S+$/,'Please enter a valid email'],
    },
}, {
    timestamps: true,
})

module.exports = mongoose.model('Donation', donationSchema, 'donations')
