const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const router = express.Router()
const prisma = new PrismaClient()

router.post("/register", async (req,res) => {
    console.log(req.body)
    const { name, password } = req.body

    if (!name || !password) {
        return res.status(400).send({ msg: "Name and password are required." })
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    try {
        const newUser = await prisma.user.create({
            data: {
                name: req.body.name,
                password: hashedPassword
            }
        })
        res.send({msg: "New user created"})
    } catch (error){
        console.error(error)
        res.status(500).send({msg: "Error creating user"})
    }

})

router.post("/login", async (req,res) => {
    const user = await prisma.user.findUnique({
        where: {name: req.body.name}
    })
    if (user == null){
        console.log("User not found")
        return res.status(401).send({msg: "Authentication failed"})
    }

    const match = await bcrypt.compare(req.body.password, user.password)
    if (!match){
        console.log("Wrong password")
        return res.status(401).send({msg: "Authentication failed"})
    }
    const token = jwt.sign({
        sub: user.id,
        name: user.name,
    }, process.env.JWT_SECRET, {expiresIn: '30d'})
/*
TODO: Refresh token

    const refresh_token = await jwt.sign({
        sub: user.id
    }, process.env.JWT_SECRET, {expiresIn: '30d'})

    res.send({msg: "Successful login", access_token: token, refresh_token: refresh_token})
    
    // access_token expiresin 10m
    // vid login, om access token är expired, meddela error åt frontend,
    // om frontend får en expired access token:
    // GET/refresh: (refresh token exists in DB, here's your new access token)

*/
    res.send({msg: "Successful login", jwt: token})
})
module.exports = router