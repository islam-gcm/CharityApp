const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['charity_approved',  //notif l charity bli t9blt
               'charity_rejected',  //notif l charity bli trefusat
               'donation_claimed',     //donation claimed
               'donation_failed_insufficient_quantity'], //requested qty ktr mn avaialble qty
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {timestamps: true})

module.exports = mongoose.model('Notification', notificationSchema, 'notifications')
