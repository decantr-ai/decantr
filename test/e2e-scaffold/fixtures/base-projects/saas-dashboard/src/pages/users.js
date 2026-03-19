import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { Card, DataTable, Input, Select, Button } from 'decantr/components';

const { div, h1 } = tags;

const mockUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Editor', status: 'Pending' },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'User', status: 'Inactive' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'Admin', status: 'Active' },
];

export function UsersPage() {
  const [search, setSearch] = createSignal('');
  const [roleFilter, setRoleFilter] = createSignal('all');

  const filteredUsers = () => {
    let users = mockUsers;
    if (search()) {
      users = users.filter(u =>
        u.name.toLowerCase().includes(search().toLowerCase()) ||
        u.email.toLowerCase().includes(search().toLowerCase())
      );
    }
    if (roleFilter() !== 'all') {
      users = users.filter(u => u.role === roleFilter());
    }
    return users;
  };

  return div({ class: '_flex _col _gap4 _p4 _overflow[auto] _flex1' },
    h1({ class: '_fslg _fwbold _mb4' }, 'Users'),

    // Filter bar
    Card({
      class: '_p4',
      children: div({ class: '_flex _gap4 _itemscenter' },
        Input({
          placeholder: 'Search users...',
          value: search,
          onInput: (e) => setSearch(e.target.value),
          class: '_w[300px]',
        }),
        Select({
          value: roleFilter,
          onChange: setRoleFilter,
          options: [
            { value: 'all', label: 'All Roles' },
            { value: 'Admin', label: 'Admin' },
            { value: 'Editor', label: 'Editor' },
            { value: 'User', label: 'User' },
          ],
        }),
        Button({ variant: 'primary' }, 'Add User'),
      ),
    }),

    // Users table
    Card({
      children: DataTable({
        columns: [
          { key: 'name', header: 'Name' },
          { key: 'email', header: 'Email' },
          { key: 'role', header: 'Role' },
          { key: 'status', header: 'Status' },
        ],
        data: filteredUsers,
      }),
    })
  );
}
