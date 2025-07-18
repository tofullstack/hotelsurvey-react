import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';

const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // pega o usuario atual logado

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    // validação de senha no frontend | tambem no backend
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        setError('New password must be at least 8 characters long, include one uppercase, one lowercase, and one number.');
        return;
    }

    try {
      // user.id do AuthContext
      await AuthService.changePassword( { currentPassword, newPassword });
      setSuccess("Password changed successfully! You can now access the system.");
      
      setTimeout(() => {
        logout(); // força o re-login depois de trocar a senha
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    }
  };

  if (!user) { // redireciona ao login em caso de erro
    navigate('/login');
    return null;
  }

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow-lg" style={{ maxWidth: '450px', width: '100%' }}>
        <h2 className="card-title text-center mb-4">Change Password</h2>
        <p className="text-center text-muted">This is your first login. Please change your password.</p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="currentPassword" className="form-label">Current Password:</label>
            <input
              type="password"
              className="form-control"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label">New Password:</label>
            <input
              type="password"
              className="form-control"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <small className="form-text text-muted">Min. 8 chars, 1 uppercase, 1 lowercase, 1 number.</small>
          </div>
          <div className="mb-3">
            <label htmlFor="confirmNewPassword" className="form-label">Confirm New Password:</label>
            <input
              type="password"
              className="form-control"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Change Password</button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;