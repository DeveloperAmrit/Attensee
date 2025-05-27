import { useState, useEffect} from "react";
import { motion } from "framer-motion";

const SuccessMessage = ({ title, message, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    setIsAnimating(true);
  }, [title, message]);

  const handleProgressComplete = () => {
    setIsAnimating(false);

    // Call onClose after a short delay to let fade-out animation play
    setTimeout(() => {
      onClose?.();
    }, 100); // match the motion transition duration
  };

  return (
    <div className="w-[250px] fixed top-0 left-1/2 transform -translate-x-1/2 z-50">
      <motion.div
        className="bg-gradient-to-r from-green-100 to-green-200 text-green-600 py-3 px-4 rounded-b-lg flex flex-col items-center border border-gray-200 shadow-lg dark:shadow-black/60"
        initial={{ opacity: 0, y: -80 }}
        animate={{ opacity: isAnimating ? 1 : 0, y: isAnimating ? 0 : -80 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <motion.i
            className="fas fa-check-circle text-green-600 text-3xl"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
          />
          <div className="text-left">
            <div className="text-xl font-semibold text-gray-800">{title}</div>
            <div className="text-sm text-gray-700 mt-1">{message}</div>
          </div>
        </div>
        <div className="relative w-full h-1 mt-2">
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-green-600 rounded-sm"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3 }}
            onAnimationComplete={handleProgressComplete}
          />
          <motion.div
            className="absolute bottom-0 right-0 h-1 bg-green-300 rounded-sm"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 3 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessMessage;