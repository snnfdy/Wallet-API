const mongoose = require ("mongoose");

const customerSchema = mongoose.Schema({
    first_name: String,
    last_name: String,
    account_username: String,
    account_password: String,
    transaction_pin: Number,
    email: String, 
    account_balance: {
        type:Number,
        default: 0
    },
    account_type: {
        type: String,
        enum: ["user","admin"],
        default: "user"
    },
    confirmToken: Number   
})

module.exports = mongoose.model("Customer", customerSchema)