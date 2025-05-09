import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface Answer {
  id: string;
  answer_text: string;
  question: {
    id: string;
    type: 'MC' | 'SA';
    correct_answer: string;
  };
}

interface UserTryout {
  id: string;
  user_id: string;
  session_id: string;
  answers: Answer[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { session_id } = await req.json();

    if (!session_id) {
      throw new Error('Session ID is required');
    }

    // Get all user tryouts for this session
    const { data: userTryouts, error: tryoutsError } = await supabase
      .from('user_tryouts')
      .select(`
        id,
        user_id,
        session_id,
        answers:user_answers (
          id,
          answer_text,
          question:questions (
            id,
            type,
            correct_answer
          )
        )
      `)
      .eq('session_id', session_id)
      .eq('status', 'completed');

    if (tryoutsError) throw tryoutsError;

    // Calculate scores for each user
    for (const tryout of userTryouts) {
      let correctAnswers = 0;
      const totalQuestions = tryout.answers.length;

      for (const answer of tryout.answers) {
        if (answer.question.type === 'MC') {
          // For multiple choice, exact match
          if (answer.answer_text === answer.question.correct_answer) {
            correctAnswers++;
          }
        } else {
          // For short answer, case-insensitive match after trimming
          const userAnswer = answer.answer_text?.trim().toLowerCase();
          const correctAnswer = answer.question.correct_answer.trim().toLowerCase();
          if (userAnswer === correctAnswer) {
            correctAnswers++;
          }
        }
      }

      // Calculate final score (0-1000 scale)
      const finalScore = Math.round((correctAnswers / totalQuestions) * 1000);

      // Update user_tryout with final score
      const { error: updateError } = await supabase
        .from('user_tryouts')
        .update({
          final_score: finalScore,
          status: 'scored'
        })
        .eq('id', tryout.id);

      if (updateError) throw updateError;
    }

    return new Response(
      JSON.stringify({ message: 'Scores calculated successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});