import React from 'react';
import { Link } from 'react-router-dom';

const getDifficultyColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'hard':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const ProblemCard = ({ problem }) => {
  return (
    <Link to={`/problems/${problem._id}`} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl text-gray-800">{problem.title}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">Topic: {problem.topic}</p>
        <p className="text-gray-700 mb-4">{problem.description}</p>
        <div className="flex justify-end">
          <span className="text-blue-600 hover:text-blue-800 transition duration-300 ease-in-out">
            Solve Challenge → 
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProblemCard;