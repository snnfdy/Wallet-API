const express = require ("express");
const mongoose = require("mongoose");

const app = express();
const customerRoutes = require("./api/routes/customers");


mongoose.connect("mongodb+srv://Ifedayo-bank:Ifedayo-bank@mynodebank.aoas9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
mongoose.set('useFindAndModify', false);

app.use(express.json());
app.use("/customers", customerRoutes)


module.exports = app;