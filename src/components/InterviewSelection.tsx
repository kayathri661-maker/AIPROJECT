import { useState } from 'react';
import { Briefcase, Sparkles } from 'lucide-react';
import { INTERVIEW_ROLES } from '../types';

interface Props {
  onStart: (role: string) => void;
}

export default function InterviewSelection({ onStart }: Props) {
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleStart = () => {
    const role = showCustom ? customRole : selectedRole;
    if (role.trim()) {
      onStart(role.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">AI Interview Practice</h1>
        </div>
        <p className="text-lg text-gray-600">
          Practice your interview skills with AI-powered mock interviews
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-blue-600" />
          Select Interview Role
        </h2>

        {!showCustom ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {INTERVIEW_ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedRole === role
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-blue-300 text-gray-700'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCustom(true)}
              className="w-full p-3 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all mb-6"
            >
              + Enter Custom Role
            </button>
          </>
        ) : (
          <div className="mb-6">
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="Enter your custom role..."
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none mb-3"
              autoFocus
            />
            <button
              onClick={() => {
                setShowCustom(false);
                setCustomRole('');
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to predefined roles
            </button>
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={!selectedRole && !customRole.trim()}
          className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
        >
          Start Interview
        </button>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">What to expect:</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>5-6 questions tailored to your selected role</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>Natural conversation flow with follow-up questions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>Comprehensive feedback on your performance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>Score out of 100 with areas for improvement</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
