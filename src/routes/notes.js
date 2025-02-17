const express = require('express')
const router = express.Router({mergeParams: true})
const { PrismaClient } = require('@prisma/client')
const authorize = require('../middleware/auth')

const prisma = new PrismaClient()

router.get('/', authorize, async (req, res) => {
    console.log("req.params:", req.params)
    console.log("notes / GET")
    try {
        const notes = await prisma.note.findMany({
            where: {
                boardId: req.params.boardId
            }
        })
        res.send({msg: `Notes for board ${req.params.boardId}`, notes: notes})
    } catch (error) {
        console.log(error)
        res.status(500).send({msg: "Error"})
    }
})

router.post('/', authorize, async (req, res) => {
    console.log("req.params:", req.params)
    console.log(req.body)

    try {
        const board = await prisma.board.findUnique({
            where: { id: req.params.boardId, }
        })

        if (!board) {
            return res.status(404).send({ msg: "Board not found" })
        }

        const newNote = await prisma.note.create({
            data: {
                content: req.body.content,
                boardId: req.params.boardId,
                width: 200,
                height: 100,
                x: 50,
                y: 100,
            }
        })

        res.send({ msg: "New note created!", note: newNote })
    } catch (error) {
        console.error("Error creating note:", error)
        res.status(500).send({ msg: "ERROR", error: error.message })
    }
})

router.put('/:boardId/notes/:noteId/position', authorize, async (req, res) => {
    const { x, y } = req.body;
    try {
        const updatedNote = await prisma.note.update({
            where: { id: req.params.noteId },
            data: { x, y }
        });
        res.json({ message: 'Position updated', note: updatedNote });
    } catch (error) {
        console.error('Error updating note position:', error);
        res.status(500).json({ message: 'Failed to update position' });
    }
});

router.put('/:boardId/notes/:noteId/size', authorize, async (req, res) => {
    const { width, height } = req.body;
    try {
        const updatedNote = await prisma.note.update({
            where: { id: req.params.noteId },
            data: { width, height }
        });
        res.json({ message: 'Size updated', note: updatedNote });
    } catch (error) {
        console.error('Error updating note size:', error);
        res.status(500).json({ message: 'Failed to update size' });
    }
});

router.put('/:noteId', authorize, async (req, res) => {
    console.log(req.body)

    try {
        const updateNote = await prisma.note.update({
            where: {
                id: req.params.noteId
            },
            data: {
                content: req.body.content
            }
        })

        res.send({msg: `Note ${req.params.noteId} updated`, note: updateNote})
    } catch (error) {
        console.log(error.message)
        res.status(500).send({msg: "ERROR"})
    }
})

router.delete('/:noteId', authorize, async (req, res) => {
    try {
        await prisma.note.delete({
            where: {
                id: req.params.noteId
            }
        })
        res.send({ msg: `Note ${req.params.noteId} deleted` })
    } catch (error) {
        console.log(error.message)
        res.status(500).send({ msg: "ERROR" })
    }
})

module.exports = router
