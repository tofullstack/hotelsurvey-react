import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddBoxIcon from '@mui/icons-material/AddBox';
import BarChartIcon from '@mui/icons-material/BarChart';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

const drawerWidth = 120;

const menuItems = [
  {
    text: 'Formulários',
    icon: <DashboardIcon />,
    path: '/admin/forms',
  },
  {
    text: 'Empresas',
    icon: <AddBoxIcon />,
    path: '/admin/companies',
  },
  {
    text: 'Relatórios',
    icon: <BarChartIcon />,
    path: '/admin/reports',
  },
  {
    text: 'Usuários',
    icon: <ManageAccountsIcon />,
    path: '/admin/users',
  }
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open] = React.useState(true);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : 60,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 60,
            transition: 'width 0.3s',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pt: 2,
          },
        }}
      >
        <List sx={{ width: '100%' }}>
          {menuItems.map((item) => {
            const selected = location.pathname === item.path;
            return (
              <ListItem
                key={item.text}
                button
                onClick={() => navigate(item.path)}
                selected={selected}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: 65,
                  color: selected ? 'primary.main' : 'inherit',
                }}
              >
                <ListItemIcon sx={{ minWidth: 'auto', color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    mt: 0.5,
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    opacity: open ? 1 : 0,
                    transition: 'opacity 0.2s',
                  }}
                  primaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* Conteúdo */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
