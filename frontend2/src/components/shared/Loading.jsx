import { motion } from 'framer-motion';

const Loading = () => {
  const radius = 50;
  const diameter = radius * 2;

  const getPosition = (angle) => {
    const radian = (angle * Math.PI) / 180;
    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);
    return { x, y };
  };

  const balls = Array.from({ length: 20 }, (_, index) => {
    const angle = index * 18;
    const { x, y } = getPosition(angle);
    return { angle, x, y };
  });

  return (
    <div className="flex justify-center items-center h-screen w-full m-auto overflow-x-hidden">
      <div className="relative w-40 h-40">
        {balls.map((ball, index) => (
          <motion.div
            key={index}
            className={`absolute w-6 h-6 rounded-full`}
            style={{
              top: `calc(50% + ${ball.y}px)`,
              left: `calc(50% + ${ball.x}px)`,
              background: `linear-gradient(to right, hsl(${50 - index * 30}, ${50 - index * 2}%, ${70 - index * 2}%),
                        hsl(${(index * 18 - 180) % 360}, ${100 + index * 2}%, ${50 + index * 2}%))`,
            }}
            initial={{
              x: ball.x,
              y: ball.y
            }}
            animate={{
              x: [ball.x, ball.x - 2 * diameter * Math.cos(ball.angle * (Math.PI / 180)), ball.x],
              y: [ball.y, ball.y - 2 * diameter * Math.sin(ball.angle * (Math.PI / 180)), ball.y],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
              delay: index * 0.01
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Loading;
