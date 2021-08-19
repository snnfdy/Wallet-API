const express = require("express");
const router = express.Router();
const Customer = require("../../models/customer")

router.post("/", (req,res,next)=>{
    Customer.create(req.body).then(function(customer){
        res.send(customer)
    }).catch(next);     
});

router.get("/", (req,res,next)=>{
    Customer.find({}).then(function(customers){
        res.send(customers)
    })
})

router.delete("/:id", (req,res,next)=>{
    const id = req.params.id;
    Customer.findByIdAndRemove({_id: id}).then(function(customer){
        res.send(customer);
    })
})

router.put("/:id", (req,res,next)=>{
    const id = req.params.id;
    Customer.findByIdAndUpdate({_id: id},req.body).then(function(){
        Customer.findOneAndUpdate({id}).then(function(customer){
            res.send(customer);
            console.log(customer);
        });
    });
});
module.exports = router;