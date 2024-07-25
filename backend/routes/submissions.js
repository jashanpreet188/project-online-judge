const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Problem = require('../models/problem');
const authMiddleware = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');
const axios = require('axios');

// Submit a solution
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { problemId, code, language } = req.body;
        
        // Fetch the problem to get the test cases
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        // Send the code and test cases to the compiler service
        const compilerServiceUrl = 'http://3.110.84.103:5000';
        const compilerResponse = await axios.post(`${compilerServiceUrl}/submit`, {
            language,
            code,
            testCases: problem.testCases
        });

        let status;
        if (compilerResponse.data.status === 'Success') {
            status = 'Accepted';
        } else if (compilerResponse.data.status === 'Failed') {
            status = 'Wrong Answer';
        } else if (compilerResponse.data.status === 'TLE') {
            status = 'Time Limit Exceeded';
        } else {
            status = 'Runtime Error';
        }

        const submission = new Submission({
            user: req.user.id,
            problem: problemId,
            code,
            language,
            status
        });
        
        await submission.save();
        
        // Log the submission activity
        await logActivity(req.user.id, 'submission', { 
            problemId, 
            submissionId: submission._id,
            status: submission.status
        });
        
        res.status(201).json({ 
            message: "Submission processed", 
            submissionId: submission._id,
            status: submission.status
        });
    } catch (error) {
        console.error('Error in submission:', error);
        res.status(500).json({ 
            status: 'Runtime Error',
            message: "Server Error",
            error: error.message
        });
    }
});

// Get user's submissions
router.get('/user', authMiddleware, async (req, res) => {
    try {
        const submissions = await Submission.find({ user: req.user.id })
            .sort({ submittedAt: -1 })
            .populate('problem', 'title');
        res.json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// Get a specific submission
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('problem', 'title')
            .populate('user', 'firstname lastname');
        
        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }
        
        // Check if the submission belongs to the user or if the user is an admin
        if (submission.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied" });
        }
        
        res.json(submission);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;