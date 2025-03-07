import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOrders, Order, useUpdateOrderStatus } from "@/hooks/useOrders";
import { Search, Bell } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { AdminSidebar } from "@/components/AdminSidebar";
import { collection, onSnapshot, query, orderBy, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const OrdersAdmin = () => {
  const { data: orders = [], isLoading, refetch } = useOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [lastChecked, setLastChecked] = useState<number>(Date.now());
  
  useEffect(() => {
    const lastCheckedTime = new Date(lastChecked);
    
    const q = query(
      collection(db, "orders"),
      where("createdAt", ">", lastCheckedTime.getTime()),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newOrders = snapshot.docs.length;
      
      if (newOrders > 0 && lastChecked > 0) {
        setNewOrdersCount(prevCount => prevCount + newOrders);
        toast.info(`${newOrders} new order${newOrders > 1 ? 's' : ''} received!`, {
          action: {
            label: "View",
            onClick: () => {
              refetch();
              setNewOrdersCount(0);
              setLastChecked(Date.now());
            }
          }
        });
      }
    }, (error) => {
      console.error("Error setting up order listener:", error);
    });
    
    return () => unsubscribe();
  }, [lastChecked, refetch]);
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      searchQuery === "" || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      
      refetch();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "processing":
        return "text-blue-600 bg-blue-100";
      case "shipped":
        return "text-indigo-600 bg-indigo-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleRefresh = () => {
    refetch();
    setNewOrdersCount(0);
    setLastChecked(Date.now());
    toast.success("Orders refreshed");
  };

  const formatDateTime = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold">Order Management</h1>
            <div className="flex items-center gap-4">
              {newOrdersCount > 0 && (
                <div className="relative">
                  <Button 
                    variant="outline" 
                    onClick={handleRefresh}
                    className="flex items-center gap-2"
                  >
                    <Bell className="h-4 w-4" />
                    <span>{newOrdersCount} new order{newOrdersCount > 1 ? 's' : ''}</span>
                  </Button>
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                </div>
              )}
              <Button variant="outline" onClick={handleRefresh}>
                Refresh
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders by ID or customer name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No orders found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                          <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                          <TableCell>{order.shippingAddress.name}</TableCell>
                          <TableCell>
                            {order.shippingAddress.email ? (
                              <div className="text-xs">
                                {order.shippingAddress.email}<br />
                                {order.shippingAddress.phone}
                              </div>
                            ) : (
                              order.shippingAddress.phone
                            )}
                          </TableCell>
                          <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => viewOrderDetails(order)}
                              >
                                View
                              </Button>
                              <Select
                                value={order.status}
                                onValueChange={(value) => handleStatusChange(order.id, value as Order["status"])}
                              >
                                <SelectTrigger className="w-32 h-8 text-xs">
                                  <SelectValue placeholder="Update Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Order Information</h3>
                  <p className="font-medium">Order ID: {selectedOrder.id}</p>
                  <p>Date: {formatDateTime(selectedOrder.createdAt)}</p>
                  <p>Status: 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </p>
                  <p>Payment Method: {selectedOrder.paymentMethod}</p>
                  {selectedOrder.couponCode && (
                    <p>Coupon: {selectedOrder.couponCode} 
                      {selectedOrder.discountAmount && 
                        <span className="text-green-600 ml-1">(-${selectedOrder.discountAmount.toFixed(2)})</span>
                      }
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Customer Information</h3>
                  <p>Name: {selectedOrder.shippingAddress.name}</p>
                  <p>Address: {selectedOrder.shippingAddress.address}</p>
                  <p>City: {selectedOrder.shippingAddress.city}</p>
                  <p>Postal Code: {selectedOrder.shippingAddress.postalCode}</p>
                  <p>Country: {selectedOrder.shippingAddress.country}</p>
                  {selectedOrder.shippingAddress.email && (
                    <p>Email: {selectedOrder.shippingAddress.email}</p>
                  )}
                  {selectedOrder.shippingAddress.phone && (
                    <p>Phone: {selectedOrder.shippingAddress.phone}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Order Items</h3>
                <div className="border rounded-md divide-y">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center p-3">
                      <div className="w-16 h-16 flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="ml-4 flex-grow">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
                {selectedOrder.discountAmount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${selectedOrder.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg mt-2">
                  <span>Total</span>
                  <span>${(selectedOrder.totalAmount - (selectedOrder.discountAmount || 0)).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button onClick={() => setOrderDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersAdmin;
