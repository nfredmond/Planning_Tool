import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer 
} from 'recharts';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';

// Import AI components
import CommentModerationSystem from '../ai/CommentModerationSystem';
import LLMPanel from '../ai/LLMPanel';

// Define types for the dashboard data
interface OverviewData {
  totalUsers: number;
  totalProjects: number;
  activeProjects: number;
  totalComments: number;
  engagement: number;
  engagementChange: number;
  userGrowth: number;
  commentGrowth: number;
  projectGrowth: number;
  timeSeriesData: Array<{
    date: string;
    newUsers: number;
    activeUsers: number;
    pageViews: number;
    revenue: number;
  }>;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  plan: string;
  projects: number;
  comments: number;
  lastActive: string;
  joinDate: string;
  selected?: boolean;
}

interface ContentData {
  commentDistribution: {
    name: string;
    value: number;
  }[];
  topProjects: {
    id: string;
    name: string;
    comments: number;
    users: number;
    activity: number;
  }[];
  contentTrends: {
    date: string;
    comments: number;
    replies: number;
  }[];
}

interface RevenueData {
  total: number;
  recurring: number;
  growth: number;
  conversionRate: number;
  plans: {
    name: string;
    users: number;
    revenue: number;
    growth: number;
  }[];
  timeSeriesData: {
    date: string;
    revenue: number;
    subscriptions: number;
  }[];
}

interface SystemData {
  serverStatus: 'operational' | 'degraded' | 'down';
  cpuUsage: number;
  memoryUsage: number;
  storage: number;
  apiRequests: number;
  errorRate: number;
  responseTime: number;
  uptimePercentage: number;
  serverMetrics: {
    time: string;
    cpu: number;
    memory: number;
    requests: number;
  }[];
}

interface DashboardData {
  overview: OverviewData;
  users: UserData[];
  content: ContentData;
  revenue: RevenueData;
  system: SystemData;
}

interface KpiCardProps {
  title: string;
  value: number | string;
  change: number;
  icon?: string;
  format?: 'number' | 'percentage' | 'currency' | 'compact';
}

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface PeriodSelectorProps {
  period: string;
  onPeriodChange: (period: string) => void;
}

interface TabContentProps {
  data: any;
}

// Utility type for time series data with indexable properties
interface TimeSeriesDataItem {
  date: string;
  newUsers: number;
  activeUsers: number;
  pageViews: number;
  revenue: number;
  [key: string]: string | number; // Add index signature
}

// Utility type for server metrics with indexable properties
interface ServerMetricItem {
  date: string;
  time: string;
  cpu: number;
  memory: number;
  responseTime: number;
  errors: number;
  requests: number;
  [key: string]: string | number; // Add index signature
}

// Add this interface for Pie chart label props
interface PieChartLabelProps {
  name: string;
  percent: number;
}

// Content Tab components
interface ContentTabsProps {
  data: ContentData;
}

const ContentTabsNav: React.FC<ContentTabsProps> = ({ data }) => {
  const [contentTabValue, setContentTabValue] = useState(0);

  const handleContentTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setContentTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={contentTabValue} 
          onChange={handleContentTabChange} 
          aria-label="content tabs"
        >
          <Tab label="Content Analytics" />
          <Tab label="Top Projects" />
          <Tab label="AI Moderation" />
        </Tabs>
      </Box>
      
      {contentTabValue === 0 && (
        <Box>
          <div className="chart-row">
            <div className="chart-card">
              <h3>Comment Distribution</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.commentDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }: PieChartLabelProps) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.commentDistribution.map((entry: { name: string; value: number }, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'][index % 6]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="chart-card">
              <h3>Content Trends</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.contentTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="comments" stroke="#8884d8" />
                    <Line type="monotone" dataKey="replies" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Box>
      )}
      
      {contentTabValue === 1 && (
        <Box>
          <div className="chart-card">
            <h3>Top Projects</h3>
            <table className="top-projects-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Comments</th>
                  <th>Users</th>
                  <th>Activity</th>
                </tr>
              </thead>
              <tbody>
                {data.topProjects.map((project: { id: string; name: string; comments: number; users: number; activity: number }) => (
                  <tr key={project.id}>
                    <td>{project.name}</td>
                    <td>{project.comments}</td>
                    <td>{project.users}</td>
                    <td>
                      <div className="progress-bar">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${(project.activity / 200) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Box>
      )}
      
      {contentTabValue === 2 && (
        <Box>
          <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              AI-Powered Comment Moderation
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Leverage artificial intelligence to automatically identify and flag problematic content, 
              reducing moderation workload and ensuring community standards are maintained.
            </Typography>
            <CommentModerationSystem />
          </Paper>
          
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Content Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Use AI to generate insights about content trends, sentiment analysis, and engagement patterns.
            </Typography>
            <LLMPanel 
              projectId="admin-dashboard" 
              onInsightsGenerated={(insights) => console.log("Insights generated:", insights)} 
            />
          </Paper>
        </Box>
      )}
    </Box>
  );
};

// Main Admin Dashboard Component
const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [period, setPeriod] = useState<string>('7days');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    overview: {} as OverviewData,
    users: [] as UserData[],
    content: {} as ContentData,
    revenue: {} as RevenueData,
    system: {} as SystemData
  });
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch real data from the API
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        try {
          // Get overview data
          const overviewResponse: AxiosResponse = await axios.get(`/api/admin/dashboard/overview?period=${period}`, { headers });
          
          // Get users data
          const usersResponse: AxiosResponse = await axios.get(`/api/admin/dashboard/users?period=${period}`, { headers });
          
          // Get content data
          const contentResponse: AxiosResponse = await axios.get(`/api/admin/dashboard/content?period=${period}`, { headers });
          
          // Get revenue data (if applicable)
          const revenueResponse: AxiosResponse = await axios.get(`/api/admin/dashboard/revenue?period=${period}`, { headers });
          
          // Get system data
          const systemResponse: AxiosResponse = await axios.get(`/api/admin/dashboard/system`, { headers });
          
          setDashboardData({
            overview: overviewResponse.data,
            users: usersResponse.data,
            content: contentResponse.data,
            revenue: revenueResponse.data,
            system: systemResponse.data
          });
          
          return; // Exit early if API calls succeed
        } catch (apiError) {
          const error = apiError as AxiosError;
          console.error("API Error:", error);
          
          // More detailed error handling
          if (error.response) {
            const status = error.response.status;
            if (status === 401) {
              setError("Authentication error. Please log in again.");
            } else if (status === 403) {
              setError("You don't have permission to access this data.");
            } else if (status >= 500) {
              setError("Server error. Please try again later.");
            } else {
              // Use type assertion for the error.response.data
              const responseData = error.response.data as { message?: string };
              setError(`Error fetching data: ${responseData.message || 'Unknown error'}`);
            }
          } else if (error.request) {
            setError("Network error. Please check your connection and try again.");
          } else {
            setError(`Error setting up request: ${error.message}`);
          }
          
          // Don't throw, continue to use mock data
          console.log("Falling back to mock data due to API failure");
        }
      } catch (err) {
        // This catch handles any other errors (like JSON parsing)
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred. Using demo data instead.");
      } finally {
        // Always generate mock data if we reach this point (means API didn't succeed)
        console.log("Using mock data");
        setDashboardData({
          overview: generateOverviewData(period),
          users: generateUserData(period),
          content: generateContentData(period),
          revenue: generateRevenueData(period),
          system: generateSystemData(period)
        });
        
        setLoading(false);
      }
    };
    
    fetchData();
  }, [period, refreshTrigger]);
  
  // Function to handle refresh button click  
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Mock data generators
  const generateOverviewData = (period: string): OverviewData => {
    let days;
    switch(period) {
      case '7days': days = 7; break;
      case '30days': days = 30; break;
      case '90days': days = 90; break;
      default: days = 7;
    }
    
    // Generate time series data
    const timeSeriesData: TimeSeriesDataItem[] = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      
      return {
        date: date.toISOString().split('T')[0],
        newUsers: Math.floor(Math.random() * 100) + 50,
        activeUsers: Math.floor(Math.random() * 500) + 200,
        pageViews: Math.floor(Math.random() * 5000) + 1000,
        revenue: Math.floor(Math.random() * 2000) + 500,
      };
    });
    
    // Calculate totals and changes
    const calcTotal = (key: string) => timeSeriesData.reduce((sum, item) => sum + (item[key] as number), 0);
    const calcChange = (key: string) => {
      const half = Math.floor(timeSeriesData.length / 2);
      const firstHalf = timeSeriesData.slice(0, half).reduce((sum, item) => sum + (item[key] as number), 0);
      const secondHalf = timeSeriesData.slice(half).reduce((sum, item) => sum + (item[key] as number), 0);
      
      return firstHalf === 0 ? 100 : ((secondHalf - firstHalf) / firstHalf * 100);
    };
    
    return {
      timeSeriesData,
      totalUsers: calcTotal('newUsers'),
      totalProjects: calcTotal('activeUsers'),
      activeProjects: calcTotal('pageViews'),
      totalComments: calcTotal('revenue'),
      engagement: calcTotal('newUsers'),
      engagementChange: parseFloat(calcChange('newUsers').toFixed(1)),
      userGrowth: calcTotal('activeUsers'),
      commentGrowth: calcTotal('pageViews'),
      projectGrowth: calcTotal('revenue')
    };
  };
  
  const generateUserData = (period: string): UserData[] => {
    let userCount = 100;
    switch(period) {
      case '7days': userCount = 100; break;
      case '30days': userCount = 300; break;
      case '90days': userCount = 600; break;
      default: userCount = 100;
    }
    
    const statuses = ['active', 'inactive', 'pending', 'banned'];
    const roles = ['user', 'moderator', 'admin', 'editor'];
    const plans = ['free', 'basic', 'premium', 'enterprise'];
    
    return Array.from({ length: userCount }, (_, i) => {
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365));
      
      const lastLoginDate = new Date();
      if (Math.random() > 0.8) {
        lastLoginDate.setTime(0);
      } else {
        lastLoginDate.setDate(lastLoginDate.getDate() - Math.floor(Math.random() * 30));
      }
      
      return {
        id: `user-${i + 1}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        role: roles[Math.floor(Math.random() * roles.length)],
        plan: plans[Math.floor(Math.random() * plans.length)],
        projects: Math.floor(Math.random() * 10),
        comments: Math.floor(Math.random() * 20),
        lastActive: lastLoginDate.getTime() === 0 ? 'Never' : lastLoginDate.toISOString(),
        joinDate: createdDate.toISOString()
      } as UserData;
    });
  };
  
  const generateContentData = (period: string): ContentData => {
    let contentCount = 50;
    switch(period) {
      case '7days': contentCount = 50; break;
      case '30days': contentCount = 150; break;
      case '90days': contentCount = 300; break;
      default: contentCount = 50;
    }
    
    const types = ['post', 'comment', 'article', 'video', 'image'];
    const statuses = ['published', 'draft', 'archived', 'flagged', 'deleted'];
    
    return {
      commentDistribution: Array.from({ length: contentCount }, (_, i) => ({
        name: statuses[i % statuses.length],
        value: Math.floor(Math.random() * 100)
      })),
      topProjects: Array.from({ length: 5 }, (_, i) => ({
        id: `project-${i + 1}`,
        name: `Project ${i + 1}`,
        comments: Math.floor(Math.random() * 100),
        users: Math.floor(Math.random() * 50),
        activity: Math.floor(Math.random() * 200)
      })),
      contentTrends: Array.from({ length: contentCount }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          comments: Math.floor(Math.random() * 50),
          replies: Math.floor(Math.random() * 20)
        };
      })
    } as ContentData;
  };
  
  const generateRevenueData = (period: string): RevenueData => {
    let days;
    switch(period) {
      case '7days': days = 7; break;
      case '30days': days = 30; break;
      case '90days': days = 90; break;
      default: days = 7;
    }
    
    const dailyRevenue = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 2000) + 500,
        subscriptions: Math.floor(Math.random() * 500) + 100,
        oneTime: Math.floor(Math.random() * 1000) + 200,
        refunds: Math.floor(Math.random() * 100)
      };
    });
    
    return {
      total: dailyRevenue.reduce((sum, day) => sum + day.revenue, 0),
      recurring: dailyRevenue.reduce((sum, day) => sum + day.subscriptions, 0),
      growth: Math.random() * 100,
      conversionRate: Math.random() * 100,
      plans: [
        { name: 'Basic', users: Math.floor(Math.random() * 500) + 100, revenue: Math.floor(Math.random() * 5000) + 1000, growth: Math.random() * 100 },
        { name: 'Premium', users: Math.floor(Math.random() * 1000) + 500, revenue: Math.floor(Math.random() * 10000) + 5000, growth: Math.random() * 100 },
        { name: 'Enterprise', users: Math.floor(Math.random() * 2000) + 1500, revenue: Math.floor(Math.random() * 20000) + 15000, growth: Math.random() * 100 }
      ],
      timeSeriesData: dailyRevenue
    } as RevenueData;
  };
  
  const generateSystemData = (period: string): SystemData => {
    let days;
    switch(period) {
      case '7days': days = 7; break;
      case '30days': days = 30; break;
      case '90days': days = 90; break;
      default: days = 7;
    }
    
    const serverMetrics: ServerMetricItem[] = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const dateStr = date.toISOString().split('T')[0];
      return {
        date: dateStr,
        time: dateStr, // Add the time property
        cpu: Math.floor(Math.random() * 50) + 20,
        memory: Math.floor(Math.random() * 40) + 30,
        responseTime: Math.floor(Math.random() * 200) + 100,
        errors: Math.floor(Math.random() * 50),
        requests: Math.floor(Math.random() * 1000) + 500 // Add the requests property
      };
    });
    
    return {
      serverStatus: 'operational',
      cpuUsage: serverMetrics[serverMetrics.length - 1].cpu,
      memoryUsage: serverMetrics[serverMetrics.length - 1].memory,
      storage: Math.floor(Math.random() * 30) + 60,
      apiRequests: serverMetrics.reduce((sum, metric) => sum + metric.errors, 0),
      errorRate: Math.random() * 10,
      responseTime: serverMetrics[serverMetrics.length - 1].responseTime,
      uptimePercentage: Math.random() * 100,
      serverMetrics: serverMetrics.map(metric => ({
        time: metric.time,
        cpu: metric.cpu,
        memory: metric.memory,
        requests: metric.requests
      }))
    };
  };
  
  // Tab content components
  const OverviewTab: React.FC<TabContentProps> = ({ data }) => {
    if (!data || !data.timeSeriesData) {
      return <div>No overview data available</div>;
    }
    
    // Create derived KPI data from the timeSeriesData
    const kpis = {
      newUsers: {
        total: data.totalUsers,
        change: data.engagementChange
      },
      activeUsers: {
        total: data.totalProjects,
        change: data.engagementChange
      },
      pageViews: {
        total: data.activeProjects,
        change: data.engagementChange
      },
      revenue: {
        total: data.totalComments,
        change: data.engagementChange
      }
    };
    
    return (
      <div className="overview-tab">
        <div className="kpi-cards">
          <KpiCard 
            title="New Users" 
            value={kpis.newUsers.total} 
            change={kpis.newUsers.change} 
            icon="👤"
          />
          <KpiCard 
            title="Active Users" 
            value={kpis.activeUsers.total} 
            change={kpis.activeUsers.change} 
            icon="👥"
          />
          <KpiCard 
            title="Page Views" 
            value={kpis.pageViews.total} 
            change={kpis.pageViews.change}
            icon="👁️"
            format="number"
          />
          <KpiCard 
            title="Revenue" 
            value={kpis.revenue.total} 
            change={kpis.revenue.change}
            icon="💰"
            format="currency"
          />
        </div>
        
        <div className="chart-section">
          <h3>Performance Metrics</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="newUsers" 
                  name="New Users" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="activeUsers" 
                  name="Active Users" 
                  stroke="#82ca9d"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="pageViews" 
                  name="Page Views" 
                  stroke="#ffc658"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-button">
              <span className="icon">📊</span>
              <span className="label">Export Reports</span>
            </button>
            <button className="action-button">
              <span className="icon">📧</span>
              <span className="label">Send Newsletter</span>
            </button>
            <button className="action-button">
              <span className="icon">🔒</span>
              <span className="label">Security Check</span>
            </button>
            <button className="action-button">
              <span className="icon">⚙️</span>
              <span className="label">System Settings</span>
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const UsersTab: React.FC<TabContentProps> = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;
    
    const filteredUsers = data.filter((user: UserData) => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (a[sortField as keyof UserData] < b[sortField as keyof UserData]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField as keyof UserData] > b[sortField as keyof UserData]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
    
    const handleSort = (field: string) => {
      if (field === sortField) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    };
    
    const handleSelectUser = (userId: string) => {
      if (selectedUsers.includes(userId)) {
        setSelectedUsers(selectedUsers.filter(id => id !== userId));
      } else {
        setSelectedUsers([...selectedUsers, userId]);
      }
    };
    
    const handleSelectAll = () => {
      if (selectedUsers.length === currentUsers.length) {
        setSelectedUsers([]);
      } else {
        setSelectedUsers(currentUsers.map((user: UserData) => user.id));
      }
    };
    
    const userStatusData = Object.entries(
      data.reduce((acc: any, user: UserData) => {
        acc[user.status] = (acc[user.status] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));
    
    const userRoleData = Object.entries(
      data.reduce((acc: any, user: UserData) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));
    
    const userPlanData = Object.entries(
      data.reduce((acc: any, user: UserData) => {
        acc[user.plan] = (acc[user.plan] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));
    
    const generateDateRanges = () => {
      const result: any = {};
      const now = new Date();
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(now.getMonth() - i);
        const monthYear = `${date.getMonth()+1}/${date.getFullYear()}`;
        result[monthYear] = 0;
      }
      data.forEach((user: UserData) => {
        const created = new Date(user.joinDate);
        const monthYear = `${created.getMonth()+1}/${created.getFullYear()}`;
        if (result[monthYear] !== undefined) {
          result[monthYear]++;
        }
      });
      return Object.entries(result)
        .map(([date, count]) => ({ date, count }))
        .reverse();
    };
    
    const registrationData = generateDateRanges();
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];
    
    return (
      <div className="users-tab">
        <div className="charts-section">
          <div className="chart-row">
            <div className="chart-card small">
              <h3>User Status</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={userStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }: PieChartLabelProps) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {userStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="chart-card small">
              <h3>User Roles</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={userRoleData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }: PieChartLabelProps) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {userRoleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="chart-card small">
              <h3>User Plans</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={userPlanData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }: PieChartLabelProps) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {userPlanData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="chart-card">
            <h3>User Registrations</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={registrationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Users" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="table-tools">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="bulk-actions">
            <select disabled={selectedUsers.length === 0}>
              <option value="">Bulk Actions</option>
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
              <option value="delete">Delete</option>
              <option value="export">Export</option>
            </select>
            <button 
              className="apply-button"
              disabled={selectedUsers.length === 0}
            >
              Apply
            </button>
          </div>
        </div>
        
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className={sortField === 'id' ? `sort-${sortDirection}` : ''} onClick={() => handleSort('id')}>
                  User ID
                </th>
                <th className={sortField === 'name' ? `sort-${sortDirection}` : ''} onClick={() => handleSort('name')}>
                  Name
                </th>
                <th className={sortField === 'email' ? `sort-${sortDirection}` : ''} onClick={() => handleSort('email')}>
                  Email
                </th>
                <th className={sortField === 'status' ? `sort-${sortDirection}` : ''} onClick={() => handleSort('status')}>
                  Status
                </th>
                <th className={sortField === 'role' ? `sort-${sortDirection}` : ''} onClick={() => handleSort('role')}>
                  Role
                </th>
                <th className={sortField === 'plan' ? `sort-${sortDirection}` : ''} onClick={() => handleSort('plan')}>
                  Plan
                </th>
                <th className={sortField === 'joinDate' ? `sort-${sortDirection}` : ''} onClick={() => handleSort('joinDate')}>
                  Registered
                </th>
                <th className={sortField === 'lastActive' ? `sort-${sortDirection}` : ''} onClick={() => handleSort('lastActive')}>
                  Last Login
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user: UserData) => (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </td>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`status-badge ${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`plan-badge ${user.plan}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td>{new Date(user.joinDate).toLocaleDateString()}</td>
                  <td>{user.lastActive !== 'Never' ? new Date(user.lastActive).toLocaleDateString() : 'Never'}</td>
                  <td className="actions">
                    <button className="action-icon edit">✏️</button>
                    <button className="action-icon delete">🗑️</button>
                    <button className="action-icon more">⋯</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            First
          </button>
          <button 
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages} ({sortedUsers.length} users)
          </span>
          <button 
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
          <button 
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </button>
        </div>
      </div>
    );
  };
  
  const ContentTab: React.FC<TabContentProps> = ({ data }) => {
    if (!data || !data.commentDistribution || !data.topProjects || !data.contentTrends) {
      return <div>No content data available</div>;
    }
    
    return (
      <div className="content-tab">
        <ContentTabsNav data={data} />
      </div>
    );
  };
  
  const RevenueTab: React.FC<TabContentProps> = ({ data }) => {
    if (!data || !data.timeSeriesData || !data.plans) {
      return <div>No revenue data available</div>;
    }
    
    // Colors for the charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
    
    return (
      <div className="revenue-tab">
        <div className="kpi-cards">
          <KpiCard 
            title="Total Revenue" 
            value={data.total} 
            change={data.growth} 
            icon="💰"
            format="currency"
          />
          <KpiCard 
            title="Recurring Revenue" 
            value={data.recurring} 
            change={data.growth} 
            icon="🔄"
            format="currency"
          />
          <KpiCard 
            title="Conversion Rate" 
            value={data.conversionRate} 
            change={0}
            icon="📈"
            format="percentage"
          />
        </div>
        
        <div className="chart-row">
          <div className="chart-card">
            <h3>Revenue Over Time</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                  <Line type="monotone" dataKey="subscriptions" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="chart-card">
            <h3>Revenue by Plan</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.plans}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" />
                  <Bar dataKey="users" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const SystemTab: React.FC<TabContentProps> = ({ data }) => {
    if (!data || !data.serverMetrics) {
      return <div>No system data available</div>;
    }
    
    const getStatusColor = (status: string) => {
      switch(status) {
        case 'operational': return '#4caf50';
        case 'degraded': return '#ff9800';
        case 'down': return '#f44336';
        default: return '#999';
      }
    };
    
    return (
      <div className="system-tab">
        <div className="system-status">
          <div className="status-card">
            <h3>Server Status</h3>
            <div className="status-indicator" style={{ backgroundColor: getStatusColor(data.serverStatus) }}>
              {data.serverStatus.toUpperCase()}
            </div>
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-label">Uptime</span>
                <span className="stat-value">{data.uptimePercentage.toFixed(2)}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Response Time</span>
                <span className="stat-value">{data.responseTime}ms</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Error Rate</span>
                <span className="stat-value">{data.errorRate.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="resource-usage">
          <div className="chart-row">
            <div className="chart-card">
              <h3>CPU Usage</h3>
              <div className="gauge">
                <div className="gauge-value" style={{ width: `${data.cpuUsage}%` }}>
                  {data.cpuUsage}%
                </div>
              </div>
            </div>
            
            <div className="chart-card">
              <h3>Memory Usage</h3>
              <div className="gauge">
                <div className="gauge-value" style={{ width: `${data.memoryUsage}%` }}>
                  {data.memoryUsage}%
                </div>
              </div>
            </div>
            
            <div className="chart-card">
              <h3>Storage</h3>
              <div className="gauge">
                <div className="gauge-value" style={{ width: `${data.storage}%` }}>
                  {data.storage}%
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Server Metrics Over Time</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.serverMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="cpu" name="CPU %" stroke="#8884d8" />
                <Line yAxisId="left" type="monotone" dataKey="memory" name="Memory %" stroke="#82ca9d" />
                <Line yAxisId="right" type="monotone" dataKey="requests" name="Requests" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };
  
  // Dashboard Layout Components
  const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
    const tabs = [
      { id: 'overview', label: 'Overview', icon: '📊' },
      { id: 'users', label: 'Users', icon: '👥' },
      { id: 'content', label: 'Content', icon: '📝' },
      { id: 'revenue', label: 'Revenue', icon: '💰' },
      { id: 'system', label: 'System', icon: '⚙️' }
    ];
    
    return (
      <div className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    );
  };
  
  const PeriodSelector: React.FC<PeriodSelectorProps> = ({ period, onPeriodChange }) => {
    const periods = [
      { id: '7days', label: 'Last 7 Days' },
      { id: '30days', label: 'Last 30 Days' },
      { id: '90days', label: 'Last 90 Days' }
    ];
    
    return (
      <div className="period-selector">
        <label>Time Period:</label>
        <select value={period} onChange={(e) => onPeriodChange(e.target.value)}>
          {periods.map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </div>
    );
  };
  
  const KpiCard: React.FC<KpiCardProps> = ({ title, value, change, icon, format = 'number' }) => {
    const formatValue = (val: number | string) => {
      switch (format) {
        case 'currency':
          return `$${typeof val === 'number' ? val.toLocaleString() : val}`;
        case 'percentage':
          return `${val}%`;
        default:
          return typeof val === 'number' ? val.toLocaleString() : val;
      }
    };
    
    const isPositive = parseFloat(change.toString()) >= 0;
    
    return (
      <div className="kpi-card">
        <div className="kpi-icon">{icon}</div>
        <div className="kpi-content">
          <h3 className="kpi-title">{title}</h3>
          <div className="kpi-value">{formatValue(value)}</div>
          <div className={`kpi-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <PeriodSelector period={period} onPeriodChange={setPeriod} />
          <button className="refresh-button" onClick={handleRefresh} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>
      
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="dashboard-content">
        {loading ? (
          <div className="loading">Loading dashboard data...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab data={dashboardData.overview} />}
            {activeTab === 'users' && <UsersTab data={dashboardData.users} />}
            {activeTab === 'content' && <ContentTab data={dashboardData.content} />}
            {activeTab === 'revenue' && <RevenueTab data={dashboardData.revenue} />}
            {activeTab === 'system' && <SystemTab data={dashboardData.system} />}
          </>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-dashboard {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .dashboard-header h1 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .period-selector {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .period-selector select {
          padding: 6px 12px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        
        .refresh-button {
          padding: 8px 16px;
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .refresh-button:hover:not(:disabled) {
          background-color: #e0e0e0;
        }
        
        .refresh-button:disabled {
          background-color: #f9f9f9;
          color: #999;
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .tab-navigation {
          display: flex;
          border-bottom: 1px solid #ddd;
          margin-bottom: 20px;
        }
        
        .tab-button {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: 16px;
          color: #666;
        }
        
        .tab-button:hover {
          background-color: #f9f9f9;
        }
        
        .tab-button.active {
          border-bottom-color: #0066cc;
          color: #0066cc;
          font-weight: 500;
        }
        
        .tab-icon {
          font-size: 20px;
        }
        
        .dashboard-content {
          min-height: 400px;
        }
        
        .loading, .error {
          text-align: center;
          padding: 40px;
          font-size: 18px;
        }
        
        .error {
          color: #d32f2f;
        }
        
        .kpi-cards {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .kpi-card {
          flex: 1;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 16px;
          display: flex;
          align-items: center;
        }
        
        .kpi-icon {
          font-size: 32px;
          margin-right: 16px;
        }
        
        .kpi-content {
          flex: 1;
        }
        
        .kpi-title {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #666;
        }
        
        .kpi-value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
        }
        
        .kpi-change {
          font-size: 14px;
        }
        
        .kpi-change.positive {
          color: #4caf50;
        }
        
        .kpi-change.negative {
          color: #f44336;
        }
        
        .chart-section, .charts-section {
          margin-bottom: 24px;
        }
        
        .chart-section h3, .charts-section h3, .chart-card h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          color: #333;
        }
        
        .chart-container {
          background-color: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .chart-row {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }
        
        .chart-card {
          background-color: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 16px;
        }
        
        .chart-card.small {
          flex: 1;
        }
        
        .quick-actions h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          color: #333;
        }
        
        .action-buttons {
          display: flex;
          gap: 16px;
        }
        
        .action-button {
          flex: 1;
          padding: 16px;
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        
        .action-button:hover {
          background-color: #f9f9f9;
        }
        
        .action-button .icon {
          font-size: 24px;
        }
        
        .action-button .label {
          font-size: 14px;
          color: #666;
        }
        
        .table-tools {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        
        .search-bar input {
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #ddd;
          width: 300px;
        }
        
        .bulk-actions {
          display: flex;
          gap: 8px;
        }
        
        .bulk-actions select {
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        
        .apply-button {
          padding: 8px 16px;
          background-color: #0066cc;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .apply-button:hover:not(:disabled) {
          background-color: #0055aa;
        }
        
        .apply-button:disabled {
          background-color: #99bbdd;
          cursor: not-allowed;
        }
        
        .users-table {
          margin-bottom: 16px;
          overflow-x: auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        th {
          background-color: #f9f9f9;
          font-weight: 500;
          color: #333;
          cursor: pointer;
          user-select: none;
        }
        
        th.sort-asc::after {
          content: " ↑";
        }
        
        th.sort-desc::after {
          content: " ↓";
        }
        
        tr:hover {
          background-color: #f5f5f5;
        }
        
        .status-badge, .plan-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .status-badge.active {
          background-color: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-badge.inactive {
          background-color: #fafafa;
          color: #616161;
        }
        
        .status-badge.pending {
          background-color: #fff8e1;
          color: #f57c00;
        }
        
        .status-badge.banned {
          background-color: #ffebee;
          color: #c62828;
        }
        
        .plan-badge.free {
          background-color: #e3f2fd;
          color: #1565c0;
        }
        
        .plan-badge.basic {
          background-color: #e8f5e9;
          color: #2e7d32;
        }
        
        .plan-badge.premium {
          background-color: #fff8e1;
          color: #f57c00;
        }
        
        .plan-badge.enterprise {
          background-color: #f3e5f5;
          color: #6a1b9a;
        }
        
        .actions {
          display: flex;
          gap: 8px;
        }
        
        .action-icon {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }
        
        .pagination {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .pagination button {
          padding: 6px 12px;
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .pagination button:hover:not(:disabled) {
          background-color: #e0e0e0;
        }
        
        .pagination button:disabled {
          background-color: #f9f9f9;
          color: #ccc;
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .page-info {
          margin: 0 8px;
          color: #666;
        }

        /* Styles for ContentTabs */
        .MuiTabs-root {
          margin-bottom: 16px;
        }
        
        .MuiTab-root {
          text-transform: none;
          font-weight: 500;
        }
        
        /* Ensure AI components have proper spacing */
        .ai-component-container {
          margin-bottom: 20px;
          padding: 16px;
          background-color: #f9f9f9;
          border-radius: 8px;
        }
      `}} />
    </div>
  );
};

export default AdminDashboard; 