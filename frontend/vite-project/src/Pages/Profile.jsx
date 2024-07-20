import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Award, Edit2 } from 'lucide-react';
import generalProfilePic from '../assets/mac.jpeg';
import EditProfile from './EditProfile';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [submittedProblems, setSubmittedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');
        console.log('Token from localStorage:', token);
        console.log('User string from localStorage:', userString);

        if (!token || !userString) {
          throw new Error('No user data found in localStorage');
        }

        let user;
        try {
          user = JSON.parse(userString);
          console.log('Parsed user object:', user);
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          throw new Error('Failed to parse user data from localStorage');
        }

        if (!user) {
          throw new Error('User object is null after parsing');
        }

        console.log('User token:', token);

        const [profileResponse, statsResponse, problemsResponse] = await Promise.all([
          axios.get('http://localhost:8000/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:8000/user/stats', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:8000/user/submitted-problems', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setProfile(profileResponse.data);
        setStats(statsResponse.data);
        setSubmittedProblems(problemsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchProfileAndStats:', err);
        setError('Failed to fetch profile data: ' + err.message);
        setLoading(false);

        if (err.message.includes('No user data found') || err.message.includes('Invalid user data')) {
          navigate('/login');
        }
      }
    };

    fetchProfileAndStats();
  }, [navigate]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
    
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto p-4">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center">
            <img 
              className="h-24 w-24 rounded-full border-4 border-white mb-4 sm:mb-0 sm:mr-4" 
              src={generalProfilePic}
              alt="General Profile"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              <p className="text-blue-100 flex items-center justify-center sm:justify-start">
                <Mail className="mr-2" size={16} />
                {profile.email}
              </p>
            </div>
          </div>
          <button 
            onClick={handleEditProfile}
            className="mt-4 bg-white text-blue-500 px-4 py-2 rounded-full flex items-center hover:bg-blue-100 transition duration-300"
          >
            <Edit2 className="mr-2" size={16} />
            Edit Profile
          </button>
        </div>
        
        {isEditing ? (
          <EditProfile
            profile={profile}
            onSave={handleSaveProfile}
            onCancel={handleCancelEdit}
          />
        ) : (
          <>
            <div className="p-4 sm:p-6">
              <h2 className="text-xl font-semibold mb-4">Problem Solving Statistics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Solved" value={stats.totalSolved} icon={Award} />
                <StatCard title="Easy" value={stats.easySolved} color="text-green-500" />
                <StatCard title="Medium" value={stats.mediumSolved} color="text-yellow-500" />
                <StatCard title="Hard" value={stats.hardSolved} color="text-red-500" />
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t">
              <h2 className="text-xl font-semibold mb-4">Submitted Problems</h2>
              {submittedProblems.length > 0 ? (
                <ul className="list-disc pl-5">
                  {submittedProblems.map((submission, index) => (
                    <li key={index} className="mb-2">
                      {submission.problem.title} - {submission.problem.difficulty} 
                      <span className={`ml-2 px-2 py-1 rounded ${
                        submission.status === 'Accepted' ? 'bg-green-200 text-green-800' : 
                        submission.status === 'Wrong Answer' ? 'bg-red-200 text-red-800' : 
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {submission.status}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No problems submitted yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color = "text-blue-500" }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
      {Icon && <Icon className={`${color}`} size={24} />}
    </div>
  </div>
);

export default Profile;
