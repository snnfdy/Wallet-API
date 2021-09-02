require("dotenv").config();
const express = require("express");
const bcrypt = require ("bcryptjs")
const sha256 = require("sha256")
const { findByIdAndRemove, findByIdAndUpdate, findOneAndUpdate, findOne } = require("../../models/customer");
const router = express.Router();
const Customer = require("../../models/customer");
const Signature = require("../../models/signature");
const Transfer = require("../../models/transfer");
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
        
        const customer = await Customer.create(req.body)
        
        customer.email = email.toLowerCase();
        customer.password = encryptedPassword;
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

router.post("/transfer", verifyToken, async(req,res,next)=>{
    try{
        const confirmToken = Math.floor(100000000 + Math.random() * 900000000);
        const {amount,email} = req.body;
        const customer= await Customer.findOne({email});
        if (!(amount&&email)){
            return res.status(400).send("Enter the email of the recipient and the amount you want to send pls")
        }

        let mailRecipients =[]
        const customers = await Customer.find({account_type:"admin"});
        let custome = customers
                for (i=0;i<custome.length;i++){  
                        mailRecipients.push(custome[i].email)   
                }
        let mailed =mailRecipients;
        console.log(mailed) 
        nodemailer.createTestAccount((err,account)=>{
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.GMAIL_USERNAME,
                    pass: process.env.GMAIL_PASSWORD
                }  
            });
            
            customer.confirmToken = confirmToken;
            customer.save()

                for (i=0;i<mailed.length;i++){

                    let encoded = sha256(mailed[i]);
                    const signature = Signature.create({
                        email: mailed[i],
                        confirmToken: confirmToken,
                        encoded: encoded,
                        requiredSignatures: mailed.length
                    })
                    let mailOptions = {
                                from: 'ifedayosanni93@gmail.com',
                                to: mailed[i],
                                subject: "Confirm Transaction",
                                html: `Press <a href = http://localhost:3000/fighters/verify/${encoded}/${confirmToken}> here </a> to verify the transaction. Thanks`
                            }
                
                             transporter.sendMail(mailOptions, (error,info)=>{
                                if (error){
                                    console.log(error)
                                }
                                console.log("Message sent: %s", info.messageId);
                                sendStatus = true
                                signature.sendStatus = sendStatus
                                signature.save()
                            })
                }
             
            

        })
        req.body.confirmToken = confirmToken;
        req.body.from = req.decoded.email;
        let transfer = await Transfer.create(req.body);

        if(transfer) return res.status(200).json("Transfer Created; awaiting signatures");

        if(!transfer) return res.status(400).json("Transfer Creation failed");

    }catch(e){
        console.error(e);
    } 
})

router.get("/verify/:encoded/:confirmToken", async(req,res)=>{
    const confirmToken = req.params.confirmToken;
    const signee = await Signature.findOne({confirmToken, encoded})
    
    
    if (!signee) return "Not found"

    if (signee && signee.confirmStatus===true) return "User Already Signed"

    if (signee && signee.confirmStatus===false){
        signee.confirmStatus = true;
        await signee.save()
    } else {
        return res.json("Not found")
    }

    let SignatureCount = await Signature.count({confirmToken,confirmStatus: true});

    if (SignatureCount === signee.requiredSignatures){
        transferFunds(confirmToken)
    }


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

const transferFunds = async (confirmToken) =>{
    try{let transfer = await Transfer.findOne({confirmToken})
        let amt = parseInt(transfer.amount,10)
        let sender = await Customer.findOne({email: transfer.from});
        let recipient = await Customer.findOne({email: transfer.email});

        if(recipient && sender){
            recipient.account_balance+=amt;
            sender.account_balance-=amt
        }
    }catch(e){console.log(e)}
} 
    

module.exports = router;