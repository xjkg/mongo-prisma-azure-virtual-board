const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authorize = require('../middleware/auth')

const prisma = new PrismaClient()

router.get('/', authorize, async (req, res) => {
    console.log("boards / GET")
    try {
        const ownedBoards = await prisma.board.findMany({
            where: {
                ownerId: req.userData.sub
            }
        })

        const accessibleBoards = await prisma.board.findMany({
            where: {
                id: { in: req.userData.otherBoards }
            }
        })

        const allBoards = [...new Map([...ownedBoards, ...accessibleBoards].map(board => [board.id, board])).values()];


        res.send({msg: `${req.userData.name}'s boards`, boards: allBoards})
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
                title: req.body.title,
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

    try {
        const boardToUpdate = await prisma.board.findUnique({
            where: { id: req.params.id }
        })

        if (boardToUpdate.ownerId !== req.userData.sub) {
            return res.status(403).send({ msg: "You are not authorized to update this board." })
        }

        const updatedBoard = await prisma.board.update({
            where: {
                id: req.params.id,
            },
            data: {
                title: req.body.title,
            },
        })

        res.send({ msg: `Board "${req.body.title}" updated to: "${updatedBoard.title}"` })
    } catch (error) {
        console.error('Error updating board: ', error)
        res.status(500).send({ msg: "Error updating board" })
    }
})

router.post('/:id/invite', authorize, async (req, res) => {
    const { username } = req.body 

    try {
        const board = await prisma.board.findUnique({
            where: { id: req.params.id }
        })

        if (board.ownerId !== req.userData.sub) {
            return res.status(403).send({ msg: "You are not the owner of this board" })
        }

        const invitedUser = await prisma.user.findUnique({
            where: { name: username }
        })

        if (!invitedUser) {
            return res.status(404).send({ msg: "User not found." })
        }

        if (!invitedUser.otherBoards.includes(board.id)) {
            await prisma.user.update({
                where: { id: invitedUser.id },
                data: {
                    otherBoards: {
                        push: board.id
                    }
                }
            });
        }

        if (!board.otherUsers.includes(invitedUser.id)) {
            await prisma.board.update({
                where: { id: req.params.id },
                data: {
                    otherUsers: {
                        push: invitedUser.id
                    }
                }
            });
        }

        res.send({ msg: `${username} was added to: ${board.title}` })
    } catch (error) {
        console.error('Error granting access: ', error.message)
        res.status(500).send({ msg: "Error granting access" })
    }
})

router.delete('/:id', authorize, async (req, res) => {
    try {
        const boardToDelete = await prisma.board.findUnique({
            where: { id: req.params.id }
        })

        if (!boardToDelete) {
            return res.status(404).send({ msg: "Board not found." })
        }

        if (boardToDelete.ownerId !== req.userData.sub) {
            return res.status(403).send({ msg: "You are not authorized to delete this board." })
        }

        for (const userId of boardToDelete.otherUsers) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    otherBoards: {
                        set: (await prisma.user.findUnique({
                            where: { id: userId }
                        })).otherBoards.filter(boardId => boardId !== req.params.id)
                    }
                }
            })
        }

        await prisma.board.delete({
            where: { id: req.params.id }
        })

        res.send({ msg: "Board deleted successfully." })
    } catch (error) {
        console.error('Error deleting board: ', error)
        res.status(500).send({ msg: "Error deleting board." })
    }
})

module.exports = router

