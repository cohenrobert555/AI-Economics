
import React from 'react';

export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'outline' | 'ghost';
  type?: 'button' | 'submit';
}> = ({ children, onClick, className = "", variant = 'primary', type = 'button' }) => {
  const base = "px-6 py-3 rounded-md font-bold text-sm tracking-widest uppercase transition-all duration-500 active:scale-95";
  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]",
    outline: "border border-white/20 text-white hover:border-white hover:bg-white/5",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5"
  };
  
  return (
    <button type={type} onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-zinc-900/40 border border-white/5 rounded-none overflow-hidden backdrop-blur-sm transition-colors duration-500 ${className}`}>
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    {...props} 
    className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
  />
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea 
    {...props} 
    className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all min-h-[100px] text-sm"
  />
);
