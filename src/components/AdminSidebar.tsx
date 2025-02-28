
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingBag,
  Package,
  BarChart2,
  Tag,
  BookText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const AdminSidebar = () => {
  const location = useLocation();
  const { currentUser, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      title: "Products",
      icon: ShoppingBag,
      path: "/admin",
    },
    {
      title: "Orders",
      icon: Package,
      path: "/admin/orders",
    },
    {
      title: "Analytics",
      icon: BarChart2,
      path: "/admin/analytics",
    },
    {
      title: "Coupons",
      icon: Tag,
      path: "/admin/coupons",
    },
    {
      title: "Blog Posts",
      icon: BookText,
      path: "/admin/blogs",
    },
  ];

  return (
    <div
      className={cn(
        "h-screen border-r border-gray-200 bg-white transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className={cn("font-bold text-xl", collapsed && "hidden")}>Admin</div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-full"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      <div className="flex-grow overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md px-3 py-2.5 transition-colors",
                isActive(item.path) && "bg-gray-100 text-gray-900 font-medium",
                collapsed ? "justify-center" : "justify-start"
              )}
            >
              <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        {!collapsed && (
          <div className="mb-4 flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
              <User className="h-5 w-5" />
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate">{currentUser?.email}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          {collapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="w-full"
              onClick={() => signOut()}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <Link to="/account">
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
