import { Award, TrendingUp, AlertCircle, Home } from 'lucide-react';
import { Interview } from '../types';

interface Props {
  interview: Interview;
  onBackToHome: () => void;
}

export default function FeedbackDisplay({ interview, onBackToHome }: Props) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-blue-50 border-blue-200';
    if (score >= 40) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const formatFeedback = (feedback: string) => {
    const sections = feedback.split('\n\n');
    return sections.map((section, idx) => {
      if (section.includes('SCORE:')) {
        return null;
      }

      const lines = section.split('\n');
      const title = lines[0];
      const content = lines.slice(1);

      if (title.includes('**') || title.match(/^(Overall|Strengths|Areas|Final)/i)) {
        return (
          <div key={idx} className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {title.replace(/\*\*/g, '')}
            </h3>
            <div className="space-y-2">
              {content.map((line, i) => {
                if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                  return (
                    <div key={i} className="flex items-start gap-2 text-gray-700">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{line.replace(/^[-•]\s*/, '')}</span>
                    </div>
                  );
                }
                return line.trim() ? (
                  <p key={i} className="text-gray-700">
                    {line}
                  </p>
                ) : null;
              })}
            </div>
          </div>
        );
      }

      return (
        <p key={idx} className="text-gray-700 mb-4">
          {section}
        </p>
      );
    });
  };

  const score = interview.score || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${getScoreBgColor(
              score
            )} mb-4`}
          >
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</div>
              <div className="text-sm text-gray-600">/ 100</div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Complete!</h1>
          <p className="text-gray-600">{interview.role} Interview</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Your Feedback</h2>
          </div>
          <div className="prose max-w-none">{formatFeedback(interview.feedback || '')}</div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Performance Level</h3>
            </div>
            <p className="text-gray-600">
              {score >= 80
                ? 'Excellent performance! You demonstrated strong skills.'
                : score >= 60
                ? 'Good performance with room for improvement.'
                : score >= 40
                ? 'Fair performance. Consider more practice.'
                : 'Needs improvement. Keep practicing!'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Next Steps</h3>
            </div>
            <p className="text-gray-600">
              Review the feedback, practice the areas for improvement, and try another interview
              to track your progress.
            </p>
          </div>
        </div>

        <button
          onClick={onBackToHome}
          className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
