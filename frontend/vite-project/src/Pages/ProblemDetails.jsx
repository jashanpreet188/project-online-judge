import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProblemDetails = () => {
  const { id } = useParams();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [output, setOutput] = useState('');
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    // Disable spell-checking for the entire component
    document.body.spellcheck = false;

    // Re-enable spell-checking when component unounts
    return () => {
      document.body.spellcheck = true;
    };
  }, []);

  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) {
        setError('Problem ID is missing.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://13.127.204.187:8000/problems/${id}`);
        setProblem(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching problem:', err);
        setError('Failed to fetch problem details. Please try again later.');
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  const handleRun = async () => {
    if (!id) {
      setOutput('Error: Problem ID is missing.');
      return;
    }

    try {
      const response = await axios.post('http://3.110.84.103:5000/run', { 
        language, 
        code, 
        input: userInput
      });
      setOutput(response.data.output);
    } catch (error) {
      console.error('Error running code:', error);
      setOutput('Error: ' + (error.response?.data?.error || 'An unexpected error occurred'));
    }
  };

  const handleSubmit = async () => {
    if (!id) {
      setOutput('Error: Problem ID is missing.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post('http://3.110.84.103:5000/submit', {
        problemId: id,
        code,
        language,
        testCases: problem.testCases
      });
      const compilerResponse = await axios.post('http://3.110.84.103:5000/submit', {
        problemId: id,
        code,
        language,
        testCases: problem.testCases
      });
      const { status, message } = compilerResponse.data;
      const submissionResponse = await axios.post('http://13.127.204.187:8000/submissions', {
        problemId: id,
        code,
        language,
        status: compilerResponse.data.status
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming you're using JWT for auth
        }
      });
      setSubmissionResult({
        status: response.data.status,
        message: response.data.message
      });
      setSubmissionResult({ status, message });
      console.log('Submission saved with ID:', submissionResponse.data.submissionId);
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmissionResult({
        status: 'Runtime Error',
        message: 'An unexpected error occurred during submission.'
      });
      const submissionsResponse = await axios.get('http://13.127.204.187:8000/submissions/user');
      // Update state with recent submissions
      // setRecentSubmissions(submissionsResponse.data);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading problem...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  if (!problem) {
    return <div className="text-center mt-8">Problem not found.</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Problem Details (Left Side) */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <h2 className="text-3xl font-bold mb-4">{problem.title}</h2>
        <div className="flex items-center mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
            problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {problem.difficulty}
          </span>
          <span className="ml-4 text-gray-600">Topic: {problem.topic}</span>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-2">Problem Description</h3>
          <p className="text-gray-700 mb-4">{problem.description}</p>
          <h4 className="text-lg font-semibold mb-2">Test Cases:</h4>
          {problem.testCases && problem.testCases.map((testCase, index) => (
            <div key={index} className="mb-4 bg-gray-50 p-4 rounded-md">
              <p className="font-mono">Input: {testCase.input}</p>
              <p className="font-mono">Output: {testCase.expectedOutput}</p>
            </div>
          ))}
          {problem.constraints && problem.constraints.length > 0 && (
            <>
              <h4 className="text-lg font-semibold mb-2">Constraints:</h4>
              <ul className="list-disc list-inside">
                {problem.constraints.map((constraint, index) => (
                  <li key={index} className="text-gray-700">{constraint}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Compiler (Right Side) */}
      <div className="w-1/2 p-6 bg-gray-800 text-white">
        <div className="mb-4">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="py">Python</option>
            <option value="c">C</option>
          </select>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-1/3 p-4 bg-gray-700 text-white font-mono rounded"
          placeholder="Write your code here..."
        />
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Custom Input:</h3>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full h-1/6 p-4 bg-gray-700 text-white font-mono rounded"
            placeholder="Enter your custom input here..."
            spellCheck="false"  // This line disables browser spell-checking
            autoCorrect="off"   // This line disables autocorrect on mobile devices
            autoCapitalize="off" // This line disables auto-capitalization
            data-gramm="false"  // Disables Grammarly
            data-gramm_editor="false"  // Also disables Grammarly
            data-enable-grammarly="false"  // Disables Grammarly
          />
        </div>
        <div className="mt-4 flex space-x-4">
          <button 
            onClick={handleRun}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Run Code
          </button>
          <button 
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Output:</h3>
          <pre className="bg-gray-700 p-4 rounded">{output}</pre>
        </div>
        {submissionResult && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Submission Result:</h3>
            <div className={`p-4 rounded ${
              submissionResult.status === 'Accepted' ? 'bg-green-700' :
              submissionResult.status === 'Wrong Answer' ? 'bg-red-700' :
              submissionResult.status === 'Time Limit Exceeded' ? 'bg-yellow-700' :
              submissionResult.status === 'Runtime Error' ? 'bg-purple-700' :
              'bg-gray-700'
            }`}>
              <p className="font-bold">{submissionResult.status}</p>
              <p>{submissionResult.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDetails;