const express= require('express')
const router = new express.Router
const auth = require('../middleware/auth')
const User= require('../models/user')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelationEmail} = require('../emails/accounts')

const upload = multer({
    // dest: 'avatar', to access data outside upload.single middleware
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb) {
        if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
            return cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
    
})
//avatar inside single fn is the key for the photo we want to upload in the body->form
router.post('/users/me/avatar',auth,upload.single('avatar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png.toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error, req, res, next) => {
    res.status(400).send({error : error.message})
})
router.delete('/users/me/avatar',auth, async (req,res)=> {
    req.user.avatar= undefined
    await req.user.save()
    res.send()
})
router.post('/users',async (req,res)=> {
    const user = new User(req.body)
    sendWelcomeEmail(user.email,user.name)
    const token = await user.generateAuthToken()
    try {
        await user.save()
        res.status(201).send({user,token})
        
    } catch (error) {
        res.status(400).send(e)
   
    }
})
router.post('/users/login', async (req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        console.log(user);
        const token = await user.generateAuthToken()
        res.send({user,token})
    } catch (error) {
        res.status(400).send(error)
    }
})
// router.post('/users/logout', auth, async (req, res)=> {
//     try {
//         console.log(11);
//         req.user.tokens = req.user.tokens.filter((token)=> token.token !== req.token)
//         await req.user.save()
//         res.send()

//     } catch (error) {
//         res.status(500).send()
//     }
// })
router.post('/users/logout', auth, async (req, res) => {
    console.log(11);
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req,res)=>{
   
    res.send(users)
    
})

router.delete('/users/me', auth,async (req,res)=> {
    // const _id= req.params.id
    try {
        // const user= await User.findByIdAndDelete(req.user._id)
        // if (!user) {
        //     return res.status(404).send()
        // }
        await req.user.remove()
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }
})
router.patch('/users/me',auth, async (req, res) => {
    
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email','password','age']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(404).send({ error: "Invalid Updates"})

    }
    try {
        // const user = await User.findById(req.params.id)
        updates.forEach((update)=> user[update] = req.body[update])// key is being passed dynamically that's why can't use . operator
        await req.user.save()
        // const user= await User.findByIdAndUpdate(req.params.id,req.body,{ new: true, runValidators: true})
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
        
    }
})

router.get('/users/:id/avatar',async (req, res) => {
    
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw Error()
        }        
        res.set('content-type', 'image/jpg')
        res.send(user.avatar)
    }
     catch (error) {
        res.status(404).send()
        
    }
})

module.exports = router