const express = require("express");
const noteRouter = express.Router();
const NoteModel = require("../models/NoteModel");
const fetchUser = require("../middlewares/fetchUser");
const { body, validationResult } = require('express-validator');

// ROUTE :1 :: Fetch All Notes of User using : GET "/api/notes/fetchNotes" . Login Required
noteRouter.get("/fetchNotes", fetchUser, async (req, res) => {
    try {
        const notes = await NoteModel.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE :2 :: Add a New Note for User using : POST "/api/notes/addNote" . Login Required
noteRouter.post("/addNote", fetchUser, [
    body('title', 'Enter a Valid Title of Lenght at least 3').isLength({ min: 3 }),
    body('description', 'Description Lenght should be atleast 5').isLength({ min: 5 })], async (req, res) => {
        try {
            const { title, description, tag } = req.body;
            // Validation Checks and Returning Bad request and the errors
            const result = validationResult(req);
            if (!result.isEmpty()) {
                res.status(400).send({ errors: result.array() });
            }

            const note = new NoteModel({
                title, description, tag, user: req.user.id
            })
            const savedNote = await note.save();
            res.json(savedNote);

        } catch (error) {
            console.error(error.message);
            res.status(500).send(" Some Internal Server Error Occured ! We Will Get Back to you very soon");
        }
    })

// ROUTE :3 :: Update an existing Note for User using : PUT "/api/notes/updateNote" . Login Required
noteRouter.put("/updateNote/:id", fetchUser, async (req, res) => {
    const { title, description, tag } = req.body;
    // Create a newNote object
    try {

        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        // Find the note to be updated and update it
        let note = await NoteModel.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Unauthorised Access");
        }

        note = await NoteModel.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send(" Some Internal Server Error Occured ! We Will Get Back to you very soon");
    }
})


// ROUTE :3 :: Delete an existing Note for User using : DELETE "/api/notes/deleteNote" . Login Required
noteRouter.delete("/deleteNote/:id", fetchUser, async (req, res) => {
    try {

        // Find the note to be deleted and delete it
        let note = await NoteModel.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }

        // Allow user only if user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Unauthorised Access");
        }

        note = await NoteModel.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Deleted Note Successfully", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send(" Some Internal Server Error Occured ! We Will Get Back to you very soon");
    }
})

module.exports = noteRouter;