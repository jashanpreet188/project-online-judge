import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="text-white font-bold text-xl">
            <Link to="/">CodeArena</Link>
          </div>
          <ul className="flex space-x-4">
            <li>
              <Link className="text-white hover:text-gray-300" to="/problems">Problems</Link>
            </li>
            <li>
              <Link className="text-white hover:text-gray-300" to="/contest">Contest</Link>
            </li>
            <li>
              <Link className="text-white hover:text-gray-300" to="/discussion">Discussion</Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link className="text-white hover:text-gray-300" to="/profile">Profile</Link>
                </li>
                <li>
                  <button 
                    onClick={handleLogout} 
                    className="text-white hover:text-gray-300 bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link className="text-white hover:text-gray-300" to="/login">Login</Link>
                </li>
                <li>
                  <Link className="text-white hover:text-gray-300" to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;