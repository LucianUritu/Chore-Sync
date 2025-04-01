
import React from "react";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

type StatusCardProps = {
  title: string;
  count: number;
  color: string;
  icon: LucideIcon;
};

const StatusCard = ({ title, count, color, icon: Icon }: StatusCardProps) => {
  const getColorClass = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-600";
      case "green":
        return "bg-green-100 text-green-600";
      case "yellow":
        return "bg-yellow-100 text-yellow-600";
      case "red":
        return "bg-red-100 text-red-600";
      case "purple":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <Card className="p-3 flex items-center">
      <div className={`${getColorClass(color)} p-2 rounded-lg mr-3`}>
        <Icon size={20} />
      </div>
      <div>
        <h3 className="font-medium text-gray-600">{title}</h3>
        <p className="text-xl font-bold">{count}</p>
      </div>
    </Card>
  );
};

export default StatusCard;
