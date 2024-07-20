    const express = require('express');
    const router = express.Router();
    const Problem = require('../models/problem');
    const authMiddleware = require('../middleware/auth');
    const adminMiddleware = require('../middleware/admin');
    const { logActivity } = require('../utils/activityLogger');

    // Get all problems
    router.get('/', async (req, res) => {
        try {
            const problems = await Problem.find({}, 'title difficulty topic');
            res.json(problems);
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    });

    // Get a specific problem
    router.get('/:id', authMiddleware, async (req, res) => {
        try {
            const problem = await Problem.findById(req.params.id);
            if (!problem) {
                return res.status(404).json({ message: "Problem not found" });
            }
            
            // Log the problem view activity
            await logActivity(req.user.id, 'problem_view', { problemId: problem._id });
            
            res.json(problem);
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    });

    // Create a new problem (admin only)
    router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
        try {
            const { title, description, difficulty, topic, testCases } = req.body;
            const problem = new Problem({
                title,
                description,
                difficulty,
                topic,
                testCases,
                createdBy: req.user.id
            });
            await problem.save();
            res.status(201).json(problem);
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    });

    // Update a problem (admin only)
    router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
        try {
            const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!problem) {
                return res.status(404).json({ message: "Problem not found" });
            }
            res.json(problem);
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    });

    // Delete a problem (admin only)
    router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
        try {
            const problem = await Problem.findByIdAndDelete(req.params.id);
            if (!problem) {
                return res.status(404).json({ message: "Problem not found" });
            }
            res.json({ message: "Problem deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    });

    module.exports = router;