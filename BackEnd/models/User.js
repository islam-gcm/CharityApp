const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Name is required'],
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/,'Please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
    },
    role: {
        type: String,
        enum: ['donor', 'charity', 'admin'],     //admin yndar ghir mn DB ida khyri user admin tt9lb donor
        default: 'donor',
    },
    phone: {
        type: String,
        trim: true,
        default: null,
    },
    organization: {    //hdi tkhrj brk ida kant charity
        type: String,
        required: function () {
            return this.role === 'charity' //tkon required ghir ida kant charity
        }
    },
    registrationNumber: {   //hdi tkhrj brk ida kant charity
        type: String,
        required: function () {
            return this.role === 'charity' //tkon required ghir ida kant charity
        }
    },
    status: {  //hdi tkon pending ki admin y checki registrationNumber ida l9aha vrai ydirha approved ida no rejected for charity, donor yji directly approved
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: function () {
            return this.role === 'charity' ? 'pending' : 'approved'
        }
    },
} , {timestamps: true})

module.exports = mongoose.model('User', userSchema, 'users')    //paramater 3 bch ki ycryi f mongoDB yji hd name t3 collection