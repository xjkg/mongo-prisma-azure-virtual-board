const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authorize = require('../middleware/auth')

const prisma = new PrismaClient()

router.get('/', authorize, async (req, res) => {
    console.log("boards / GET")
    try {
        const boards = await prisma.board.findMany({
            where: {
                ownerId: req.userData.sub
            }
        })
        res.send({msg: `Boards for user ${req.userData.name}`, boards: boards})
    } catch (error) {
        console.log(error)
        res.status(500).send({msg: "Error"})
    }

})

router.post('/', authorize, async (req, res) => {
    console.log(req.body)

    try {
        const newBoard = await prisma.board.create({
            data: {
                ownerId: req.userData.sub,
                title: req.body.title
            }
        })

        res.send({msg: "New board created successfully"})
    } catch (error) {
        console.error('Error creating board: ', error)
        res.status(500).send({msg: "Error creating board"})
    }
    
})

router.put('/:id', async (req, res) => {
    console.log(req.body)

    const updateBoard = await prisma.board.update({
        where: {
          id: req.params.id,
        },
        data: {
          title: req.body.title,
        },
      })

    res.send({msg: `Board "${req.body.title}" changed to: "${updateBoard.title}"`})
})

module.exports = router

