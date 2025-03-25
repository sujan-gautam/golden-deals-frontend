
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import AdminLayout from '@/components/layout/AdminLayout';
import UsersList from '@/components/admin/UsersList';
import PostsList from '@/components/admin/PostsList';
import EventsList from '@/components/admin/EventsList';
import ListingsList from '@/components/admin/ListingsList';
import { BarChart, Activity, Users, ShoppingBag, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-gray-500">Manage your social media platform in one place.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-64">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-3 text-gray-400"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,258</div>
              <p className="text-xs text-gray-500">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <Activity className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3,427</div>
              <p className="text-xs text-gray-500">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <ShoppingBag className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">642</div>
              <p className="text-xs text-gray-500">+15% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-gray-500">-3% from last month</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm">
          <Tabs defaultValue="users">
            <div className="p-4 border-b">
              <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 md:grid-cols-4 h-auto">
                <TabsTrigger value="users" className="text-xs md:text-sm py-2">Users</TabsTrigger>
                <TabsTrigger value="posts" className="text-xs md:text-sm py-2">Posts</TabsTrigger>
                <TabsTrigger value="events" className="text-xs md:text-sm py-2">Events</TabsTrigger>
                <TabsTrigger value="listings" className="text-xs md:text-sm py-2">Listings</TabsTrigger>
              </TabsList>
            </div>
            <div className="p-4">
              <TabsContent value="users">
                <UsersList searchQuery={searchQuery} />
              </TabsContent>
              <TabsContent value="posts">
                <PostsList searchQuery={searchQuery} />
              </TabsContent>
              <TabsContent value="events">
                <EventsList searchQuery={searchQuery} />
              </TabsContent>
              <TabsContent value="listings">
                <ListingsList searchQuery={searchQuery} />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
