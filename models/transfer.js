const mongoose = require ("mongoose");

const transferSchema = mongoose.Schema({
    email: String,
    amount: Number,
    from: String,
    confirmToken: Number
})

module.exports = mongoose.model("Transfer", transferSchema)