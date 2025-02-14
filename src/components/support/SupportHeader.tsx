'use client';

import { HiOutlineQuestionMarkCircle } from 'react-icons/hi';

interface SupportHeaderProps {
  title: string;
  description?: string;
}

export default function SupportHeader({ title, description }: SupportHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
          <HiOutlineQuestionMarkCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-gray-600 dark:text-gray-300">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 