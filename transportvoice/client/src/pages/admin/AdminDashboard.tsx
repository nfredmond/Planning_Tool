import React from 'react';
import { Box, Typography, Container, Grid, Paper, Card, CardContent, CardHeader } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DataItem {
  name: string;
  value: number;
}

const data: DataItem[] = [
  { name: 'Active Projects', value: 12 },
  { name: 'Completed Projects', value: 8 },
  { name: 'On Hold', value: 3 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const AdminDashboard: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Total Users" />
              <CardContent>
                <Typography variant="h3" align="center">
                  157
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Total Projects" />
              <CardContent>
                <Typography variant="h3" align="center">
                  23
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="New Users (Last 30 Days)" />
              <CardContent>
                <Typography variant="h3" align="center">
                  18
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Project Status Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6" gutterBottom>
                Project Status
              </Typography>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" paragraph>
                  • New user registered: John Smith (10 minutes ago)
                </Typography>
                <Typography variant="body2" paragraph>
                  • Project "City Center Redesign" updated (1 hour ago)
                </Typography>
                <Typography variant="body2" paragraph>
                  • New design alternative added to "Main Street Revitalization" (3 hours ago)
                </Typography>
                <Typography variant="body2" paragraph>
                  • User Maria Johnson changed role to Admin (1 day ago)
                </Typography>
                <Typography variant="body2" paragraph>
                  • Project "Harbor District" completed (2 days ago)
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 