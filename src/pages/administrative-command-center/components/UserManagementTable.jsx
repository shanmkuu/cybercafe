import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { updateUserProfile, deleteUserProfile } from '../../../lib/db';

const UserManagementTable = ({ users, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const usersData = users ? users.map(user => {
    // Derive display name: Full Name -> Username -> Email part -> 'Unknown'
    let displayName = user.full_name;
    if (!displayName || displayName === 'Unknown') {
      if (user.username && user.username.includes('@')) {
        // If username is email, use part before @
        displayName = user.username.split('@')[0];
        // Capitalize first letter
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      } else {
        displayName = user.username || user.email?.split('@')[0] || 'Unknown';
      }
    }

    return {
      id: user.id,
      username: user.username || user.email, // Show email as secondary info
      fullName: displayName,
      email: user.email || '',
      role: user.role || 'customer',
      status: user.status || 'active',
      lastLogin: user.last_login || null,
      totalSessions: user.totalSessions || 0,
      filesUploaded: user.filesUploaded || 0,
    };
  }) : [];

  const filteredUsers = usersData.filter((user) => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ?
        prev.filter((id) => id !== userId) :
        [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'suspended':
        return 'bg-error/10 text-error border-error/20';
      case 'inactive':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'customer':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  // --- Action Handlers ---

  const toggleActionMenu = (userId) => {
    if (activeActionMenu === userId) {
      setActiveActionMenu(null);
    } else {
      setActiveActionMenu(userId);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser({ ...user });
    setActiveActionMenu(null);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsProcessing(true);
    try {
      const updates = {
        full_name: editingUser.fullName,
        role: editingUser.role,
        status: editingUser.status
      };

      const { error } = await updateUserProfile(editingUser.id, updates);
      if (error) {
        alert('Failed to update user: ' + error.message);
      } else {
        setEditingUser(null);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Error updating user:', err);
      alert('An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleStatus = async (user) => {
    setActiveActionMenu(null);
    if (!window.confirm(`Are you sure you want to ${user.status === 'active' ? 'suspend' : 'activate'} this user?`)) {
      return;
    }

    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const { error } = await updateUserProfile(user.id, { status: newStatus });

    if (error) {
      alert('Failed to update status: ' + error.message);
    } else {
      if (onRefresh) onRefresh();
    }
  };

  const handleDeleteUser = async (userId) => {
    setActiveActionMenu(null);
    if (!window.confirm('Are you sure you want to DELETE this user? This action cannot be undone.')) {
      return;
    }

    const { error } = await deleteUserProfile(userId);
    if (error) {
      alert('Failed to delete user: ' + error.message);
    } else {
      if (onRefresh) onRefresh();
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 h-full relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">User Management</h3>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search users by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg mb-4">
          <span className="text-sm text-foreground">
            {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" iconName="Edit" disabled>
              Edit (Bulk N/A)
            </Button>
            <Button variant="outline" size="sm" iconName="UserX" disabled>
              Suspend
            </Button>
            <Button variant="destructive" size="sm" iconName="Trash2" disabled>
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto max-h-96 pb-24"> {/* Added padding bottom for dropdown space */}
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              <th className="text-left p-3">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border"
                />
              </th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">User</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Role</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Last Login</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Sessions</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Files</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors relative">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="rounded border-border"
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-medium text-foreground">{user.fullName}</div>
                      <div className="text-sm text-muted-foreground">{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded border ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded border ${getStatusBadge(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-3 text-sm text-muted-foreground font-mono">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() + ' ' + new Date(user.lastLogin).toLocaleTimeString() : '-'}
                </td>
                <td className="p-3 text-sm text-foreground font-mono">
                  {user.totalSessions}
                </td>
                <td className="p-3 text-sm text-foreground font-mono">
                  {user.filesUploaded}
                </td>
                <td className="p-3 relative">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="MoreHorizontal"
                      onClick={() => toggleActionMenu(user.id)}
                    />
                    {/* Dropdown Menu */}
                    {activeActionMenu === user.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center space-x-2"
                        >
                          <Icon name="Edit" size={14} />
                          <span>Edit Details</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center space-x-2"
                        >
                          <Icon name={user.status === 'active' ? 'UserX' : 'CheckCircle'} size={14} />
                          <span>{user.status === 'active' ? 'Suspend User' : 'Activate User'}</span>
                        </button>
                        <div className="border-t border-border my-1"></div>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors flex items-center space-x-2"
                        >
                          <Icon name="Trash2" size={14} />
                          <span>Delete User</span>
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No users found matching your criteria</p>
        </div>
      )}

      {/* Edit User Modal Overlay */}
      {editingUser && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name</label>
                <Input
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button type="button" variant="ghost" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" loading={isProcessing}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementTable;