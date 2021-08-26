require("dotenv").config();
const express = require("express");
const bcrypt = require ("bcryptjs")
const { findByIdAndRemove, findByIdAndUpdate, findOneAndUpdate, findOne } = require("../../models/customer");
const router = express.Router();
const Customer = require("../../models/customer");
//const auth = require("../../middleware/auth");
const verifyToken = require("../../middleware/auth");
const jwt = require("jsonwebtoken");

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
        const token = jwt.sign({customer}, process.env.TOKEN_KEY,{expiresIn: "2h"});
        customer.token = token
        return res.status(201).json(customer);
        
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
            const token = jwt.sign({customer}, process.env.TOKEN_KEY,{expiresIn: "2h"});
            customer.token = token
            console.log("Token is ",customer.token);
            return res.status(200).json(customer); 
        } res.status(400).send("Invalid Credentials")

    }catch(e){
        console.log(e)
    };
})


router.post("/transfer", verifyToken, async (req,res,next)=>{
    try{
        const {email,amount} =req.body;    
        if(!(email&&amount)){
            return res.status(201).json("Enter all the details")
        }
        const customer = await Customer.findOne({email}); 
        let amt = parseInt(amount,10)
        customer.account_balance+=amt;
        await customer.save();
        return res.status(200).json(customer)

        // jwt.verify(req.token, 'secretkey', (err,customer)=>{
        //     if(err){
        //         return res.sendStatus(403);
        //     }else {
        //         return res.json(200).send(customer)
        //     }
        // })

    }catch(e){console.log(e)}
    
})

router.post("/reset", async (req,res,next)=>{
    try{
        const {email} =req.body;    
        if(!(email)){
            return res.status(201).json("Enter the email")
        }
        const customer = await Customer.findOne({email})
        customer.account_balance=0;
        await customer.save()
        return res.status(201).json(customer);

    }catch(e){console.log(e)}
    
})

router.get("/:id", async (req,res,next)=>{
    try{
        const id = req.params.id
        const customer = await Customer.findById({_id:id})    
        if(!(customer)){
            return res.status(201).json("Not a valid customer")
        }
        return res.status(201).json(customer);

    }catch(e){console.log(e)}
    
})

router.get("/", async(req,res,next)=>{
    try{
        const customers = await Customer.find({});
        return res.status(200).json(customers)
    }catch(e){
        console.error(e);
    }
})

router.delete("/:id", async(req,res,next)=>{
    const id = req.params.id;
    try{
        const customer = await Customer.findByIdAndRemove({_id:id});
        return res.status(200).json(customer)
    }catch(e){
        console.error(e)
    }
})

router.put("/:id", async (req,res,next)=>{
    const id = req.params.id;
    try {
        const oldCustomer = await Customer.findByIdAndUpdate({_id:id},req.body);

        if (oldCustomer){
            const customer = await Customer.findOneAndUpdate(oldCustomer.id);
            return res.status(200).json(customer)
        }
    }catch(e){
        console.error(e)
    }
});

// function verifyToken(req,res,next) {
//     const bearerHeader = req.headers['authorization'];
//     if(typeof bearerHeader !== 'undefined'){
//         const bearer = bearerHeader.split(' ');
//         const bearerToken = bearer[1];
//         req.token = bearerToken 
//         next()
//     }else{
//         return res.sendStatus(403);
//     }
// }

module.exports = router;