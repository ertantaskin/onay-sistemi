'use client';

import { IIDForm } from '@/components/forms/IIDForm';
import { useTheme } from '@/app/ThemeContext';

export default function NewApprovalPage() {
  const { theme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
        <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Yeni Onay Al
        </h1>
        <div className="text-center mb-8">
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            IID numaranızı girerek hemen onay numaranızı alabilirsiniz.
          </p>
        </div>
        <IIDForm />
      </div>
    </div>
  );
} 