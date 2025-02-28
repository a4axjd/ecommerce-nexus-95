
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Bar, Line, BarChart, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";
import { DollarSign, ShoppingBag, CreditCard, TrendingUp, Users, ShoppingCart, UserPlus, UserCheck, Percent } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AnalyticsAdmin = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const { data, isLoading, error } = useAnalytics(period);

  if (error) {
    console.error("Error fetching analytics:", error);
    toast.error("Failed to load analytics data");
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-semibold mb-8">Analytics Dashboard</h1>

          <Tabs defaultValue="month" className="mb-8">
            <TabsList>
              <TabsTrigger value="week" onClick={() => setPeriod('week')}>Last 7 Days</TabsTrigger>
              <TabsTrigger value="month" onClick={() => setPeriod('month')}>Last 30 Days</TabsTrigger>
              <TabsTrigger value="year" onClick={() => setPeriod('year')}>Last Year</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : data ? (
            <div className="space-y-8">
              {/* Revenue Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${data.totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      For the selected period
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.totalOrders}</div>
                    <p className="text-xs text-muted-foreground">
                      For the selected period
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${data.averageOrderValue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      For the selected period
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Visitor Stats */}
              <h2 className="text-xl font-semibold mb-4">Visitor Activity</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.visitorStats.totalVisitors}</div>
                    <p className="text-xs text-muted-foreground">
                      Unique page visits
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">New Visitors</CardTitle>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.visitorStats.newVisitors}</div>
                    <p className="text-xs text-muted-foreground">
                      First-time visitors
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Returning Visitors</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.visitorStats.returningVisitors}</div>
                    <p className="text-xs text-muted-foreground">
                      Repeat visitors
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Cart Activity */}
              <h2 className="text-xl font-semibold mb-4">Cart Activity</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Added to Cart</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.cartActivity.addedToCart}</div>
                    <p className="text-xs text-muted-foreground">
                      Items added to carts
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Cart Abandonment</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.cartActivity.cartAbandonment}</div>
                    <p className="text-xs text-muted-foreground">
                      Abandoned carts
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.cartActivity.conversionRate.toFixed(2)}%</div>
                    <p className="text-xs text-muted-foreground">
                      Cart to order rate
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Over Time</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={data.salesByDate}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#8884d8" 
                          name="Revenue" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Orders Over Time</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.salesByDate}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="orders" fill="#82ca9d" name="Orders" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              
              {/* Visitor Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Visitor Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'New Visitors', value: data.visitorStats.newVisitors },
                            { name: 'Returning Visitors', value: data.visitorStats.returningVisitors }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'New Visitors', value: data.visitorStats.newVisitors },
                            { name: 'Returning Visitors', value: data.visitorStats.returningVisitors }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Cart Conversion</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Completed Orders', value: data.totalOrders },
                            { name: 'Abandoned Carts', value: data.cartActivity.cartAbandonment }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'Completed Orders', value: data.totalOrders },
                            { name: 'Abandoned Carts', value: data.cartActivity.cartAbandonment }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              
              {/* Products */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Selling Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center">
                          <div className="w-6 text-muted-foreground">{index + 1}.</div>
                          <div className="flex-grow">
                            <div className="font-medium">{product.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.quantity} units sold
                            </div>
                          </div>
                          <div className="text-right font-medium">
                            ${product.revenue.toFixed(2)}
                          </div>
                        </div>
                      ))}
                      
                      {data.topProducts.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          No product data available for this period.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Top Added to Cart Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.cartActivity.topAddedProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center">
                          <div className="w-6 text-muted-foreground">{index + 1}.</div>
                          <div className="flex-grow">
                            <div className="font-medium">{product.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Added to cart {product.count} times
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {data.cartActivity.topAddedProducts.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          No cart data available for this period.
                        </p>
                      )}
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
                    {data.recentOrders.length > 0 ? (
                      <div className="rounded-md border">
                        <div className="grid grid-cols-5 p-3 text-sm font-medium text-muted-foreground bg-muted">
                          <div>Order ID</div>
                          <div>Customer</div>
                          <div>Date</div>
                          <div>Status</div>
                          <div className="text-right">Amount</div>
                        </div>
                        {data.recentOrders.map((order) => (
                          <div key={order.id} className="grid grid-cols-5 p-3 text-sm border-t">
                            <div className="font-medium">{order.id.slice(0, 8)}...</div>
                            <div>{order.shippingAddress.name}</div>
                            <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                            <div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium
                                ${order.status === 'delivered' 
                                  ? 'bg-green-100 text-green-800' 
                                  : order.status === 'shipped' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'processing'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : order.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            <div className="text-right font-medium">
                              ${order.totalAmount.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        No recent orders in this period.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No data available for the selected period.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AnalyticsAdmin;
