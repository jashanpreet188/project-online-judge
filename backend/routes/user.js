// routes/user.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Submission = require('../models/Submission');
const authMiddleware = require('../middleware/auth');

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// Get user statistics
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const submissions = await Submission.find({ user: req.user.id }).populate('problem', 'difficulty');
        
        const stats = {
            totalSolved: 0,
            easySolved: 0,
            mediumSolved: 0,
            hardSolved: 0
        };

        const solvedProblems = new Set();

        submissions.forEach(submission => {
            if (submission.status === 'Accepted' && !solvedProblems.has(submission.problem._id.toString())) {
                solvedProblems.add(submission.problem._id.toString());
                stats.totalSolved++;
                switch (submission.problem.difficulty) {
                    case 'Easy':
                        stats.easySolved++;
                        break;
                    case 'Medium':
                        stats.mediumSolved++;
                        break;
                    case 'Hard':
                        stats.hardSolved++;
                        break;
                }
            }
        });

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});
router.get('/submitted-problems', authMiddleware, async (req, res) => {
    try {
        const submissions = await Submission.find({ user: req.user.id })
            .sort({ submittedAt: -1 })
            .populate('problem', 'title difficulty')
            .lean();

        // Create a unique list of problems from submissions
        const uniqueProblems = submissions.reduce((acc, submission) => {
            if (!acc.some(p => p.problem._id.toString() === submission.problem._id.toString())) {
                acc.push({
                    problem: submission.problem,
                    status: submission.status,
                    submittedAt: submission.submittedAt
                });
            }
            return acc;
        }, []);

        res.json(uniqueProblems);
    } catch (error) {
        console.error('Error fetching submitted problems:', error);
        res.status(500).json({ message: "Server Error" });
    }
});



module.exports = router;