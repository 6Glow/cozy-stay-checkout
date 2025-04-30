
import React from "react";
import { Badge } from "@/components/ui/badge";

interface RoomFeaturesProps {
  amenities: string[];
}

const RoomFeatures = ({ amenities }: RoomFeaturesProps) => {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {amenities.slice(0, 3).map((amenity, index) => (
        <Badge key={index} variant="outline" className="text-xs">
          {amenity}
        </Badge>
      ))}
      {amenities.length > 3 && (
        <Badge variant="outline" className="text-xs">
          +{amenities.length - 3} more
        </Badge>
      )}
    </div>
  );
};

export default RoomFeatures;
