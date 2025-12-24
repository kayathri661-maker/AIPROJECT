import { useEffect, useState } from 'react';
import { History, Calendar, Award, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Interview } from '../types';

interface Props {
  onViewInterview: (interview: Interview) => void;
}

export default function InterviewHistory({ onViewInterview }: Props) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setInterviews(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <History className="w-8 h-8 text-blue-600" />
        <h2 className="text-3xl font-bold text-gray-900">Interview History</h2>
      </div>

      {interviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No completed interviews yet</h3>
          <p className="text-gray-600">Start your first interview to see your history here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <button
              key={interview.id}
              onClick={() => onViewInterview(interview)}
              className="w-full bg-white rounded-xl shadow hover:shadow-lg transition-all p-6 text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {interview.role}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(interview.created_at)}</span>
                    </div>
                    {interview.score !== null && (
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        <span
                          className={`font-semibold px-2 py-1 rounded ${getScoreColor(
                            interview.score
                          )}`}
                        >
                          {interview.score}/100
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
