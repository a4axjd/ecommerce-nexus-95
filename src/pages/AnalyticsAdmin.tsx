
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";
import { LogOut, ShoppingBag, Package, ListOrdered, DollarSign, Tag, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsAdmin = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const { data: analytics, isLoading } = useAnalytics(period);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate("/admin")}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Products
              </Button>
              <Button variant="outline" onClick={() => navigate("/admin/orders")}>
                <Package className="h-4 w-4 mr-2" />
                Orders
              </Button>
              <Button variant="outline" onClick={() => navigate("/admin/coupons")}>
                <Tag className="h-4 w-4 mr-2" />
                Coupons
              </Button>
              <p className="text-sm text-muted-foreground">
                Signed in as {currentUser?.email}
              </p>
              <Button variant="outline" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <Button
                variant={period === 'week' ? 'default' : 'outline'}
                onClick={() => setPeriod('week')}
                className="rounded-r-none"
              >
                Last 7 Days
              </Button>
              <Button
                variant={period === 'month' ? 'default' : 'outline'}
                onClick={() => setPeriod('month')}
                className="rounded-none border-x-0"
              >
                Last 30 Days
              </Button>
              <Button
                variant={period === 'year' ? 'default' : 'outline'}
                onClick={() => setPeriod('year')}
                className="rounded-l-none"
              >
                Last 12 Months
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
                      <div className="ml-auto bg-green-50 text-green-600 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        10.2%
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <ListOrdered className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="text-2xl font-bold">{analytics.totalOrders}</div>
                      <div className="ml-auto bg-green-50 text-green-600 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        5.4%
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Average Order Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="text-2xl font-bold">${analytics.averageOrderValue.toFixed(2)}</div>
                      <div className="ml-auto bg-red-50 text-red-600 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        2.1%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sales Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analytics.salesByDate}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                        />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip 
                          formatter={(value: any) => ['$' + value.toFixed(2), 'Revenue']}
                          labelFormatter={(label) => format(new Date(label), 'MMMM d, yyyy')}
                        />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                          name="Revenue"
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="orders" 
                          stroke="#82ca9d" 
                          name="Orders"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={analytics.topProducts}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis 
                            type="category" 
                            dataKey="title" 
                            tick={{ fontSize: 12 }}
                            width={150}
                          />
                          <Tooltip formatter={(value: any) => ['$' + value.toFixed(2), 'Revenue']} />
                          <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Distribution by Product</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.topProducts}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="revenue"
                            nameKey="title"
                          >
                            {analytics.topProducts.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => ['$' + value.toFixed(2), 'Revenue']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(order.createdAt), 'PPP')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                          <p className="text-sm">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate("/admin/orders")}
                    >
                      View All Orders
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No analytics data available</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnalyticsAdmin;
