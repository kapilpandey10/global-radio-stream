import React from "react";
import { motion } from "framer-motion";
import { Music, Radio, Mic, Heart, Zap, Coffee, Cloud, Star } from "lucide-react";

const categories = [
  { name: "Top 40", icon: <Star size={16} />, color: "bg-blue-500" },
  { name: "Pop", icon: <Zap size={16} />, color: "bg-pink-500" },
  { name: "Rock", icon: <Music size={16} />, color: "bg-red-500" },
  { name: "Jazz", icon: <Coffee size={16} />, color: "bg-yellow-600" },
  { name: "Chill", icon: <Cloud size={16} />, color: "bg-indigo-400" },
  { name: "Talk", icon: <Mic size={16} />, color: "bg-green-600" },
  { name: "Classical", icon: <Music size={16} />, color: "bg-gray-600" },
  { name: "House", icon: <Radio size={16} />, color: "bg-purple-600" },
];

export const CategoryDiscovery = ({ onSelect }: { onSelect: (genre: string) => void }) => {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {categories.map((cat, i) => (
        <motion.button
          key={cat.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(cat.name)}
          className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all text-left"
        >
          <div className={`p-2 rounded-lg ${cat.color} text-white`}>
            {cat.icon}
          </div>
          <span className="font-semibold text-sm">{cat.name}</span>
        </motion.button>
      ))}
    </div>
  );
};
