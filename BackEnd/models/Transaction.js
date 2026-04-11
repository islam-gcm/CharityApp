const mongoose = require('mongoose')

const transacationSchema = new mongoose.Schema({
    donation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation',
        required: true,
    },
    charity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected'], //zdna rejected hna
        default: 'pending',
    },
    claimedAt: {
        type: Date,
        default: Date.now,
    },
    notes: {
        type: String,
        default: '',
    },
}, { timestamps: true })

module.exports = mongoose.model('Transaction', transacationSchema, 'transactions')