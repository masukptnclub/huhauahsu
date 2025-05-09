import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Clock, AlertCircle, Flag, ChevronLeft, ChevronRight } from 'lucide-react';

interface TryoutSession {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  package: {
    id: string;
    name: string;
    description: string;
  };
}

interface Subtest {
  id: string;
  name: string;
  duration: number;
  order: number;
}

interface Question {
  id: string;
  text: string;
  type: 'MC' | 'SA';
  options: { [key: string]: string } | null;
}

interface UserAnswer {
  question_id: string;
  answer_text: string | null;
  is_flagged: boolean;
}

export function TryoutSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<TryoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [currentSubtest, setCurrentSubtest] = useState<Subtest | null>(null);
  const [subtests, setSubtests] = useState<Subtest[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: UserAnswer }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [userTryoutId, setUserTryoutId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const { data, error } = await supabase
          .from('tryout_sessions')
          .select(`
            *,
            package:packages (
              id,
              name,
              description
            )
          `)
          .eq('id', sessionId)
          .single();

        if (error) throw error;
        setSession(data);
      } catch (err) {
        setError('Failed to load tryout session');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    if (!currentSubtest || !isStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 0) {
          clearInterval(timer);
          handleSubtestComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSubtest, isStarted]);

  const startTryout = async () => {
    try {
      // Create user_tryout record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: tryout, error: tryoutError } = await supabase
        .from('user_tryouts')
        .insert({
          user_id: user.id,
          package_id: session?.package.id,
          session_id: sessionId,
          status: 'in_progress'
        })
        .select()
        .single();

      if (tryoutError) throw tryoutError;
      setUserTryoutId(tryout.id);

      // Fetch subtests
      const { data: subtestData, error: subtestError } = await supabase
        .from('subtests')
        .select('*')
        .eq('package_id', session?.package.id)
        .order('order');

      if (subtestError) throw subtestError;
      setSubtests(subtestData);
      setCurrentSubtest(subtestData[0]);
      setTimeLeft(subtestData[0].duration * 60);

      // Fetch questions for first subtest
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select('*')
        .eq('subtest_id', subtestData[0].id)
        .order('created_at');

      if (questionError) throw questionError;
      setQuestions(questionData);
      setIsStarted(true);
    } catch (err) {
      console.error('Error starting tryout:', err);
      setError('Failed to start tryout');
    }
  };

  const handleAnswerChange = async (answer: string) => {
    if (!currentSubtest || !userTryoutId) return;

    const question = questions[currentQuestionIndex];
    const newAnswer: UserAnswer = {
      question_id: question.id,
      answer_text: answer,
      is_flagged: answers[question.id]?.is_flagged || false
    };

    setAnswers(prev => ({ ...prev, [question.id]: newAnswer }));

    // Save to database
    try {
      const { error } = await supabase
        .from('user_answers')
        .upsert({
          user_tryout_id: userTryoutId,
          question_id: question.id,
          answer_text: answer,
          is_flagged: newAnswer.is_flagged
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving answer:', err);
    }
  };

  const toggleFlag = async () => {
    if (!currentSubtest || !userTryoutId) return;

    const question = questions[currentQuestionIndex];
    const newAnswer: UserAnswer = {
      ...answers[question.id],
      question_id: question.id,
      is_flagged: !answers[question.id]?.is_flagged
    };

    setAnswers(prev => ({ ...prev, [question.id]: newAnswer }));

    try {
      const { error } = await supabase
        .from('user_answers')
        .upsert({
          user_tryout_id: userTryoutId,
          question_id: question.id,
          answer_text: newAnswer.answer_text,
          is_flagged: newAnswer.is_flagged
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error toggling flag:', err);
    }
  };

  const handleSubtestComplete = async () => {
    const currentIndex = subtests.findIndex(s => s.id === currentSubtest?.id);
    if (currentIndex === subtests.length - 1) {
      // Last subtest completed
      try {
        const { error } = await supabase
          .from('user_tryouts')
          .update({ status: 'completed' })
          .eq('id', userTryoutId);

        if (error) throw error;
        navigate('/dashboard');
      } catch (err) {
        console.error('Error completing tryout:', err);
      }
    } else {
      // Load next subtest
      const nextSubtest = subtests[currentIndex + 1];
      setCurrentSubtest(nextSubtest);
      setTimeLeft(nextSubtest.duration * 60);
      
      // Fetch questions for next subtest
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('subtest_id', nextSubtest.id)
          .order('created_at');

        if (error) throw error;
        setQuestions(data);
        setCurrentQuestionIndex(0);
      } catch (err) {
        console.error('Error loading next subtest:', err);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Session</h2>
        <p className="text-gray-600">{error || 'Session not found'}</p>
      </Card>
    );
  }

  if (!isStarted) {
    const startDate = new Date(session.start_date);
    const endDate = new Date(session.end_date);
    const now = new Date();
    const isUpcoming = startDate > now;
    const isOngoing = startDate <= now && endDate >= now;
    const isCompleted = endDate < now;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{session.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h2 className="text-lg font-semibold">{session.package.name}</h2>
              <p className="text-gray-600">{session.package.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Start Date</p>
                  <p>{startDate.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">End Date</p>
                  <p>{endDate.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {isOngoing && (
              <Button onClick={startTryout} className="w-full md:w-auto">
                Start Tryout
              </Button>
            )}
            
            {isUpcoming && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-blue-700">
                  This tryout session hasn't started yet. Please come back at the scheduled time.
                </p>
              </div>
            )}
            
            {isCompleted && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <p className="text-gray-700">
                  This tryout session has ended. Check your results in the dashboard.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold">{currentSubtest?.name}</h2>
            <p className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={timeLeft && timeLeft < 300 ? 'danger' : 'primary'}>
              <Clock className="h-4 w-4 mr-1" />
              {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFlag}
              className={answers[currentQuestion?.id]?.is_flagged ? 'text-warning-600' : ''}
            >
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <Card>
        <CardContent className="p-6">
          <div className="prose max-w-none mb-6">
            <p className="text-lg">{currentQuestion?.text}</p>
          </div>

          {currentQuestion?.type === 'MC' && currentQuestion.options && (
            <div className="space-y-4">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <div
                  key={key}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion.id]?.answer_text === key
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-200'
                  }`}
                  onClick={() => handleAnswerChange(key)}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                      answers[currentQuestion.id]?.answer_text === key
                        ? 'border-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQuestion.id]?.answer_text === key && (
                        <div className="w-3 h-3 rounded-full bg-primary-500" />
                      )}
                    </div>
                    <span>{value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentQuestion?.type === 'SA' && (
            <Input
              value={answers[currentQuestion.id]?.answer_text || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`w-8 h-8 rounded-full text-sm font-medium ${
                  index === currentQuestionIndex
                    ? 'bg-primary-600 text-white'
                    : answers[questions[index].id]?.is_flagged
                    ? 'bg-warning-100 text-warning-700'
                    : answers[questions[index].id]?.answer_text
                    ? 'bg-success-100 text-success-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={handleSubtestComplete}>
              {currentSubtest && subtests.indexOf(currentSubtest) === subtests.length - 1
                ? 'Finish Tryout'
                : 'Next Subtest'}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}