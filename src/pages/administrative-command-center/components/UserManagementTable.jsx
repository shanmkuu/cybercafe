import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const UserManagementTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [showAddUser, setShowAddUser] = useState(false);

  const usersData = [
  {
    id: 'usr-001',
    username: 'john.smith',
    fullName: 'John Smith',
    email: 'john.smith@email.com',
    role: 'customer',
    status: 'active',
    lastLogin: '2025-10-28 15:30:22',
    totalSessions: 45,
    filesUploaded: 23,
    avatar: "https://images.unsplash.com/photo-1641479160067-5ae7bde244b0",
    avatarAlt: 'Professional headshot of young man with brown hair in casual shirt'
  },
  {
    id: 'usr-002',
    username: 'sarah.johnson',
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    role: 'customer',
    status: 'active',
    lastLogin: '2025-10-28 16:45:10',
    totalSessions: 67,
    filesUploaded: 89,
    avatar: "https://images.unsplash.com/photo-1684262855358-88f296a2cfc2",
    avatarAlt: 'Professional woman with blonde hair in white blazer smiling at camera'
  },
  {
    id: 'usr-003',
    username: 'mike.davis',
    fullName: 'Mike Davis',
    email: 'mike.davis@email.com',
    role: 'customer',
    status: 'suspended',
    lastLogin: '2025-10-26 09:15:33',
    totalSessions: 12,
    filesUploaded: 5,
    avatar: "https://images.unsplash.com/photo-1597945310606-a54b1774e175",
    avatarAlt: 'Young professional man with dark hair in navy suit jacket'
  },
  {
    id: 'usr-004',
    username: 'emma.wilson',
    fullName: 'Emma Wilson',
    email: 'emma.wilson@email.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2025-10-28 17:20:45',
    totalSessions: 156,
    filesUploaded: 234,
    avatar: "https://images.unsplash.com/photo-1654463313333-3bccfaee8430",
    avatarAlt: 'Professional woman with curly brown hair in business attire'
  },
  {
    id: 'usr-005',
    username: 'alex.chen',
    fullName: 'Alex Chen',
    email: 'alex.chen@email.com',
    role: 'customer',
    status: 'active',
    lastLogin: '2025-10-28 14:22:18',
    totalSessions: 89,
    filesUploaded: 145,
    avatar: "https://images.unsplash.com/photo-1698072556534-40ec6e337311",
    avatarAlt: 'Asian man with glasses and black hair in casual button-up shirt'
  }];


  const filteredUsers = usersData?.filter((user) => {
    const matchesSearch = user?.fullName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    user?.username?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    user?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesRole = filterRole === 'all' || user?.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
    prev?.includes(userId) ?
    prev?.filter((id) => id !== userId) :
    [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers?.length === filteredUsers?.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers?.map((user) => user?.id));
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

  return (
    <div className="bg-card rounded-lg border border-border p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">User Management</h3>
        <div className="flex items-center space-x-2">
         
        </div>
      </div>
      {/* Search and Filter Controls */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search users by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)} />

        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e?.target?.value)}
          className="px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring">

          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
        </select>
      </div>
      {/* Bulk Actions */}
      {selectedUsers?.length > 0 &&
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg mb-4">
          <span className="text-sm text-foreground">
            {selectedUsers?.length} user{selectedUsers?.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" iconName="Edit">
              Edit
            </Button>
            <Button variant="outline" size="sm" iconName="UserX">
              Suspend
            </Button>
            <Button variant="destructive" size="sm" iconName="Trash2">
              Delete
            </Button>
          </div>
        </div>
      }
      {/* Users Table */}
      <div className="overflow-x-auto max-h-96">
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              <th className="text-left p-3">
                <input
                  type="checkbox"
                  checked={selectedUsers?.length === filteredUsers?.length && filteredUsers?.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border" />

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
            {filteredUsers?.map((user) =>
            <tr key={user?.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-3">
                  <input
                  type="checkbox"
                  checked={selectedUsers?.includes(user?.id)}
                  onChange={() => handleSelectUser(user?.id)}
                  className="rounded border-border" />

                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-3">
                    <img
                    src={user?.avatar}
                    alt={user?.avatarAlt}
                    className="w-8 h-8 rounded-full object-cover" />

                    <div>
                      <div className="font-medium text-foreground">{user?.fullName}</div>
                      <div className="text-sm text-muted-foreground">{user?.username}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded border ${getRoleBadge(user?.role)}`}>
                    {user?.role}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded border ${getStatusBadge(user?.status)}`}>
                    {user?.status}
                  </span>
                </td>
                <td className="p-3 text-sm text-muted-foreground font-mono">
                  {new Date(user.lastLogin)?.toLocaleDateString()} {new Date(user.lastLogin)?.toLocaleTimeString()}
                </td>
                <td className="p-3 text-sm text-foreground font-mono">
                  {user?.totalSessions}
                </td>
                <td className="p-3 text-sm text-foreground font-mono">
                  {user?.filesUploaded}
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" iconName="Edit" />
                    <Button variant="ghost" size="sm" iconName="Eye" />
                    <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredUsers?.length === 0 &&
      <div className="text-center py-8">
          <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No users found matching your criteria</p>
        </div>
      }
    </div>);

};

export default UserManagementTable;