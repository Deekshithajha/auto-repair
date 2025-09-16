import React from 'react';

interface DashboardBackgroundProps {
  children: React.ReactNode;
  theme?: 'red' | 'blue';
}

export const DashboardBackground: React.FC<DashboardBackgroundProps> = ({ children, theme = 'blue' }) => {
  const isRedTheme = theme === 'red';

  return (
    <div className="min-h-full relative overflow-hidden">
      {/* Background Pattern (same as Login) */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='wrench-red'%3E%3Cpath d='M25 25 L40 10 L47 17 L32 32 L25 25 Z' fill='none' stroke='%23D32F2F' stroke-width='3'/%3E%3Ccircle cx='25' cy='25' r='12' fill='none' stroke='%23D32F2F' stroke-width='3'/%3E%3Ccircle cx='25' cy='25' r='6' fill='%23FF6B6B'/%3E%3C/g%3E%3Cg id='tire-blue'%3E%3Ccircle cx='75' cy='75' r='15' fill='none' stroke='%231976D2' stroke-width='3'/%3E%3Ccircle cx='75' cy='75' r='10' fill='none' stroke='%231976D2' stroke-width='2'/%3E%3Ccircle cx='75' cy='75' r='5' fill='%234FC3F7'/%3E%3Cpath d='M60 75 L90 75 M75 60 L75 90' stroke='%231976D2' stroke-width='2'/%3E%3C/g%3E%3Cg id='key-red'%3E%3Ccircle cx='25' cy='105' r='8' fill='none' stroke='%23D32F2F' stroke-width='3'/%3E%3Crect x='30' y='100' width='15' height='10' fill='%23FF6B6B' stroke='%23D32F2F' stroke-width='2'/%3E%3Cpath d='M45 105 L55 105' stroke='%23D32F2F' stroke-width='3'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px',
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Sculpted Background Panels (same structure as Login) */}
      <div className={`absolute inset-0 ${isRedTheme ? 'bg-auto-red-200' : 'bg-auto-blue-200'} opacity-20`}>
        <div
          className={`absolute top-0 right-0 w-2/3 h-full ${isRedTheme ? 'bg-auto-red-400' : 'bg-auto-blue-400'} opacity-30`}
          style={{
            clipPath: 'polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%)',
          }}
        />
        <div
          className={`absolute bottom-0 left-0 w-1/2 h-1/2 ${isRedTheme ? 'bg-auto-blue-400' : 'bg-auto-red-400'} opacity-20`}
          style={{
            clipPath: 'ellipse(100% 100% at 0% 100%)',
          }}
        />
      </div>

      {/* Foreground content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default DashboardBackground;


