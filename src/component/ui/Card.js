import React from "react";

export default function Card({ children, className }) {
  return (
    <div className={`border rounded-lg shadow p-4 bg-white ${className}`}>
      {children}
    </div>
  );
}
