import React, { useEffect, useState } from 'react';

const DeadlineBanner: React.FC = () => {
  const deadline = new Date('2025-06-01T23:59:59'); // 🔧 Ajuste la deadline ici
  const [timeParts, setTimeParts] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = deadline.getTime() - now;

      if (distance < 0) {
        setTimeParts(['00', '00', '00', '00']);
        clearInterval(interval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeParts([
        String(days).padStart(2, '0'),
        String(hours).padStart(2, '0'),
        String(minutes).padStart(2, '0'),
        String(seconds).padStart(2, '0'),
      ]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center items-center space-x-4 pt-6">
      {timeParts.map((value, index) => (
        <React.Fragment key={index}>
          <div className="bg-white text-[#2D2D2D] px-6 py-4 rounded-lg text-5xl font-bold shadow">
            {value}
          </div>
          {index < timeParts.length - 1 && (
            <span className="text-[#2D2D2D] text-5xl font-bold">:</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default DeadlineBanner;