'use client';

import { IIDForm } from '@/components/forms/IIDForm';

export default function NewApprovalPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Yeni Onay Al
        </h1>
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            IID numaranızı girerek hemen onay numaranızı alabilirsiniz.
          </p>
        </div>
        <IIDForm />
      </div>
    </div>
  );
} 