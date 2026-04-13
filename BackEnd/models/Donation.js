const mongoose= require('mongoose')

const allowedDonationTypes = [
    'food',
    'clothes',
    'toys',
    'electronics',
    'books',
    'medicines',
    'furniture',
    'school_supplies',
    'hygiene',
    'baby_items',
    'household',
    'other',
    'others',
]

const donationSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        trim: true,
        required: [true, 'Donation name is required'],
        maxlength: [120, 'Donation name cannot exceed 120 characters'],
    },
    donationType: {
        type: String,
        enum: allowedDonationTypes,
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
module.exports.allowedDonationTypes = allowedDonationTypes
