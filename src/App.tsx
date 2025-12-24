import { useState } from 'react';
import { History, ArrowLeft } from 'lucide-react';
import InterviewSelection from './components/InterviewSelection';
import InterviewChat from './components/InterviewChat';
import FeedbackDisplay from './components/FeedbackDisplay';
import InterviewHistory from './components/InterviewHistory';
import { supabase } from './lib/supabase';
import { Interview } from './types';

type View = 'home' | 'interview' | 'feedback' | 'history';

function App() {
  const [view, setView] = useState<View>('home');
  const [currentInterview, setCurrentInterview] = useState<Interview | null>(null);

  const startInterview = async (role: string) => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .insert({ role, status: 'in_progress' })
        .select()
        .single();

      if (error) throw error;

      setCurrentInterview(data);
      setView('interview');
    } catch (error) {
      console.error('Error starting interview:', error);
    }
  };

  const completeInterview = async () => {
    if (!currentInterview) return;

    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', currentInterview.id)
        .single();

      if (error) throw error;

      setCurrentInterview(data);
      setView('feedback');
    } catch (error) {
      console.error('Error loading feedback:', error);
    }
  };

  const backToHome = () => {
    setCurrentInterview(null);
    setView('home');
  };

  const viewHistory = () => {
    setView('history');
  };

  const viewInterviewFromHistory = (interview: Interview) => {
    setCurrentInterview(interview);
    setView('feedback');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'home' && (
        <div className="min-h-screen py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex justify-end">
              <button
                onClick={viewHistory}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-all shadow"
              >
                <History className="w-4 h-4" />
                View History
              </button>
            </div>
            <InterviewSelection onStart={startInterview} />
          </div>
        </div>
      )}

      {view === 'interview' && currentInterview && (
        <InterviewChat
          interviewId={currentInterview.id}
          role={currentInterview.role}
          onComplete={completeInterview}
        />
      )}

      {view === 'feedback' && currentInterview && (
        <FeedbackDisplay interview={currentInterview} onBackToHome={backToHome} />
      )}

      {view === 'history' && (
        <div className="min-h-screen py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={backToHome}
              className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
            <InterviewHistory onViewInterview={viewInterviewFromHistory} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
