require("dotenv").config();
const express = require("express");
const bcrypt = require ("bcryptjs")
const { findByIdAndRemove, findByIdAndUpdate, findOneAndUpdate } = require("../../models/customer");
const router = express.Router();
const Customer = require("../../models/customer");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");

// router.post("/", (req,res,next)=>{
//     Customer.create(req.body).then((customer)=>{
//         res.send(customer)
//     }).catch(next);     
// });

router.post("/register", async (req,res,next)=>{
    try{
        const {first_name,last_name,account_username,account_password,transaction_pin,email} = req.body;
        if (!(first_name&&last_name&&account_username&&account_password&&transaction_pin&&email)){
            return res.status(200).json("ENTER ALL REQUIRED FIELDS")
        }
        const oldCustomer = await Customer.findOne({email})
        if (oldCustomer){
            return res.status(209).json("USER ALREADY EXISTS, PLEASE LOG IN")
        }
        encryptedPassword = await bcrypt.hash(account_password,10)
        const customer = await Customer.create({
            first_name,
            last_name,
            account_username,
            account_password: encryptedPassword, 
            transaction_pin,
            email: email.toLowerCase()
        })

        const token = jwt.sign(
            {customer_id: customer._id,email}, process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );

        customer.token = token
        res.status(201).json(customer);
        
    }catch(e){
        console.error(e)
    };     
});

router.post("/login", async (req,res,next)=>{
    try{
        const {email,account_password} = req.body;
        if (!(email&&account_password)){
            return res.status(209).send("ENTER YOUR EMAIL AND PASSWORD")
        }
        const customer = await Customer.findOne({email});
        if (customer && (await bcrypt.compare(account_password,customer.account_password))){
            const token = jwt.sign(
                {customer_id: customer._id,email}, process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );
            customer.token = token
            res.status(200).json(customer); 
        } res.status(400).send("Invalid Credentials")

    }catch(e){
        console.log(e)
    };
})
// router.post("/", async (req,res,next)=>{
//     try{
//         const customer= await Customer.create(req.body)
//         res.send(customer)
//     }catch(e){
//         console.error(e)
//     };     
// });

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