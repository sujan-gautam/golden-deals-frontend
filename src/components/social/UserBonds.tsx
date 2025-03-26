
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar: string;
  level: number;
  interactions: number;
}

interface UserBondsProps {
  users: User[];
}

const UserBonds = ({ users = [] }: UserBondsProps) => {
  const calculateBondStrength = (interactions: number) => {
    if (interactions > 100) return 'Platinum';
    if (interactions > 50) return 'Gold';
    if (interactions > 20) return 'Silver';
    return 'Bronze';
  };
  
  const getBondColor = (interactions: number) => {
    if (interactions > 100) return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    if (interactions > 50) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (interactions > 20) return 'bg-gray-100 text-gray-800 border-gray-300';
    return 'bg-amber-100/50 text-amber-800/70 border-amber-300/50';
  };
  
  const getStars = (level: number) => {
    return Array(level).fill(0).map((_, i) => (
      <Star key={i} className="h-3 w-3 fill-current text-primary" />
    ));
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="font-medium text-base mb-3">Your Top Connections</h3>
      
      <div className="space-y-3">
        {users.map(user => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{user.name}</div>
                <div className="flex items-center space-x-1">
                  {getStars(user.level)}
                </div>
              </div>
            </div>
            
            <Badge className={`${getBondColor(user.interactions)} border`}>
              {calculateBondStrength(user.interactions)}
            </Badge>
          </div>
        ))}
        
        {users.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            Start interacting with other users to build bonds!
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBonds;
