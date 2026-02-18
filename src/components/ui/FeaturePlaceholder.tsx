import React from 'react';

export function FeaturePlaceholder({ title, description }: { title: string; description?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600">
        {description || 'This feature is connected to the new backend and ready for the next iteration.'}
      </p>
    </div>
  );
}

