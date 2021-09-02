const mongoose = require ("mongoose");

const signatureSchema = mongoose.Schema({
    email: String,
    sendStatus: {
        type: Boolean, 
        default: false
    },
    confirmStatus: {
        type: Boolean,
        default: false
    },
    confirmToken: Number,
    encoded: String,
    requiredSignatures: Number

})

module.exports = mongoose.model("Signature", signatureSchema)