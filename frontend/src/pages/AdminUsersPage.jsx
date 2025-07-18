import React, { useState, useEffect } from 'react';
import AuthService from '../services/auth.service';
import CompanyService from '../services/company.service'; // lista de empresas pro dropdown

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]); // para dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUserData, setNewUserData] = useState({
    login: '',
    password: '',
    profile: 'USUARIO',
    companyId: '' 
  });

  useEffect(() => {
    fetchUsers();
    fetchCompaniesForDropdown();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null); 
    try {
      const data = await AuthService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompaniesForDropdown = async () => {
    try {
      const data = await CompanyService.getAllCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load companies for user dropdown:', err);
      // log de teste
    }
  };

  const handleCreateUserChange = (e) => {
    const { name, value } = e.target;
    setNewUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setError(null); // limpa os erros da criação do user
    try {
      // validação de senha no front antes de enviar
      const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
      if (!passwordRegex.test(newUserData.password)) {
          setError('Password must be at least 8 characters long, include one uppercase, one lowercase, and one number.');
          return;
      }

      await AuthService.createUser({
        ...newUserData,
        companyId: newUserData.profile === 'USUARIO' && newUserData.companyId ? parseInt(newUserData.companyId) : null
      });
      setNewUserData({ login: '', password: '', profile: 'USUARIO', companyId: '' });
      setShowCreateForm(false);
      fetchUsers(); // recarrega a lista de usuarios
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    }
  };

  const handleDeactivate = async (userId) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      try {
        await AuthService.deactivateUser(userId);
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to deactivate user.');
      }
    }
  };

  const handleActivate = async (userId) => {
    try {
      await AuthService.activateUser(userId);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate user.');
    }
  };

  if (loading) return <p className="text-center mt-5">Loading users...</p>;
  if (error && !showCreateForm) return <p className="alert alert-danger">{error}</p>; // display de terro caso nao mostre o display de criar form

  return (
    <div className="container my-4">
      <h2 className="mb-4 text-center">Manage System Users</h2>
      {error && showCreateForm && <div className="alert alert-danger mb-3">{error}</div>} {/* displayy de erro em criar formulario */}

      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Hide Create User Form' : 'Create New User'}
        </button>
      </div>

      {showCreateForm && (
        <div className="card p-4 mb-4 shadow-sm">
          <h4 className="mb-3">Create New User Account</h4>
          <form onSubmit={handleCreateUserSubmit}>
            <div className="mb-3">
              <label htmlFor="newLogin" className="form-label">Login:</label>
              <input type="text" className="form-control" id="newLogin" name="login" value={newUserData.login} onChange={handleCreateUserChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">Password:</label>
              <input type="password" className="form-control" id="newPassword" name="password" value={newUserData.password} onChange={handleCreateUserChange} required />
              <small className="form-text text-muted">Min. 8 chars, 1 uppercase, 1 lowercase, 1 number.</small>
            </div>
            <div className="mb-3">
              <label htmlFor="newProfile" className="form-label">Profile:</label>
              <select className="form-select" id="newProfile" name="profile" value={newUserData.profile} onChange={handleCreateUserChange} required>
                <option value="USUARIO">USUARIO</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            {newUserData.profile === 'USUARIO' && ( // CompanyId relevante para USUARIOS
              <div className="mb-3">
                <label htmlFor="newCompanyId" className="form-label">Company (for USUARIO):</label>
                <select className="form-select" id="newCompanyId" name="companyId" value={newUserData.companyId} onChange={handleCreateUserChange} required={newUserData.profile === 'USUARIO'}>
                    <option value="">Select Company</option>
                    {companies.map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                </select>
                {newUserData.profile === 'USUARIO' && !newUserData.companyId && <div className="text-danger small">Company is required for USUARIO profile.</div>}
              </div>
            )}
            <button type="submit" className="btn btn-success w-100">Create User</button>
          </form>
        </div>
      )}

      <ul className="list-group">
        {users.length === 0 ? (
          <li className="list-group-item text-center text-muted">No users found.</li>
        ) : (
          users.map(user => (
            <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <h5>{user.login} ({user.profile})</h5>
                <small>ID: {user.id} | Status: {user.active ? 'Active' : 'Inactive'} | Company: {user.companyName || 'N/A'}</small>
              </div>
              <div>
                {user.active ? (
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleDeactivate(user.id)}>Deactivate</button>
                ) : (
                  <button className="btn btn-sm btn-success me-2" onClick={() => handleActivate(user.id)}>Activate</button>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default AdminUsersPage;