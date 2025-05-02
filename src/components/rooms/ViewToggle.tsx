
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, LayoutList } from "lucide-react";
import { motion } from "framer-motion";

interface ViewToggleProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

const ViewToggle = ({ viewMode, setViewMode }: ViewToggleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ToggleGroup 
        type="single" 
        value={viewMode}
        onValueChange={(value) => {
          if (value) setViewMode(value as "grid" | "list");
        }}
      >
        <ToggleGroupItem value="grid" aria-label="Grid View">
          <LayoutGrid className="mr-1" size={18} />
          <span className="hidden sm:inline">Grid</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List View">
          <LayoutList className="mr-1" size={18} />
          <span className="hidden sm:inline">List</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </motion.div>
  );
};

export default ViewToggle;
