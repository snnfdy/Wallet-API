const express = require("express");
const { findByIdAndRemove, findByIdAndUpdate, findOneAndUpdate } = require("../../models/customer");
const router = express.Router();
const Customer = require("../../models/customer")

// router.post("/", (req,res,next)=>{
//     Customer.create(req.body).then((customer)=>{
//         res.send(customer)
//     }).catch(next);     
// });

router.post("/", async (req,res,next)=>{
    try{
        const customer= await Customer.create(req.body)
        res.send(customer)
    }catch(e){
        console.error(e)
    };     
});

// router.get("/", (req,res,next)=>{
//     Customer.find({}).then((customers)=>{
//         res.send(customers)
//     })
// })

router.get("/", async(req,res,next)=>{
    try{
        const customers = await Customer.find({});
        res.status(200).json(customers)
    }catch(e){
        console.error(e);
    }
})

// router.delete("/:id", (req,res,next)=>{
//     const id = req.params.id;
//     Customer.findByIdAndRemove({_id: id}).then((customer)=>{
//         res.send(customer);
//     })
// })

router.delete("/", async(req,res,next)=>{
    const id = req.params.id;
    try{
        const customer = findByIdAndRemove({_id:id});
        res.status(200).json(customer)
    }catch(e){
        console.error(e)
    }
})

// router.put("/:id", (req,res,next)=>{
//     const id = req.params.id;
//     Customer.findByIdAndUpdate({_id: id},req.body).then(()=>{
//         Customer.findOneAndUpdate({id}).then((customer)=>{
//             res.send(customer);
//             console.log(customer);
//         });
//     });
// })

router.put("/:id", async (req,res,next)=>{
    const id = req.params.id;
    try {
        const oldCustomer = await Customer.findByIdAndUpdate({_id:id},req.body);

        if (oldCustomer){
            const customer = await Customer.findOneAndUpdate(oldCustomer.id);
            res.status(200).json(customer)
        }
    }catch(e){
        console.error(e)
    }
});

module.exports = router;