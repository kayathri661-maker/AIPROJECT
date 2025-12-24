import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Message {
  role: string;
  content: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { interviewId, userMessage, action } = await req.json();

    if (action === 'start') {
      const { data: interview } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', interviewId)
        .single();

      if (!interview) {
        throw new Error('Interview not found');
      }

      const welcomeMessage = `Hello! I'll be conducting your ${interview.role} interview today. This will be a comprehensive interview covering your skills, experience, and problem-solving abilities. I'll ask you 5-6 questions, and we'll have a natural conversation. Let's begin.\n\nQuestion 1: Can you tell me about your background and what interests you about the ${interview.role} role?`;

      await supabase.from('messages').insert({
        interview_id: interviewId,
        role: 'ai',
        content: welcomeMessage,
      });

      return new Response(
        JSON.stringify({ message: welcomeMessage }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'respond') {
      await supabase.from('messages').insert({
        interview_id: interviewId,
        role: 'user',
        content: userMessage,
      });

      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('interview_id', interviewId)
        .order('created_at', { ascending: true });

      const { data: interview } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', interviewId)
        .single();

      const conversationHistory = messages?.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content,
      })) || [];

      const questionCount = messages?.filter(m => m.role === 'ai').length || 0;
      const shouldEnd = questionCount >= 6;

      let systemPrompt = '';
      if (shouldEnd) {
        systemPrompt = `You are an expert interviewer conducting a ${interview.role} interview. The interview is now complete. Provide a comprehensive final feedback that includes:\n\n1. Overall Assessment (2-3 sentences)\n2. Strengths (bullet points)\n3. Areas for Improvement (bullet points)\n4. Final Score out of 100\n\nFormat your response clearly with these sections. Be constructive and specific. End with: SCORE: [number]/100`;
      } else {
        systemPrompt = `You are an expert interviewer conducting a ${interview.role} interview. Ask relevant, insightful questions that assess the candidate's skills, experience, and cultural fit. Keep questions concise and professional. This is question ${questionCount + 1} of approximately 6. Make each question progressively more challenging or specific based on their previous answers.`;
      }

      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiApiKey) {
        const mockResponse = shouldEnd
          ? `Thank you for completing the interview!\n\n**Overall Assessment**\nYou demonstrated good communication skills and provided thoughtful responses throughout the interview.\n\n**Strengths:**\n- Clear communication\n- Relevant experience\n- Problem-solving approach\n\n**Areas for Improvement:**\n- Provide more specific examples\n- Expand on technical details\n- Demonstrate deeper industry knowledge\n\n**SCORE: 75/100**\n\nThank you for your time. Good luck with your job search!`
          : `That's interesting. Question ${questionCount + 1}: Can you describe a challenging project you've worked on and how you approached solving the main obstacles?`;

        await supabase.from('messages').insert({
          interview_id: interviewId,
          role: 'ai',
          content: mockResponse,
        });

        if (shouldEnd) {
          await supabase
            .from('interviews')
            .update({
              status: 'completed',
              score: 75,
              feedback: mockResponse,
              completed_at: new Date().toISOString(),
            })
            .eq('id', interviewId);
        }

        return new Response(
          JSON.stringify({ message: mockResponse, completed: shouldEnd }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      const openaiData = await openaiResponse.json();
      const aiMessage = openaiData.choices[0].message.content;

      await supabase.from('messages').insert({
        interview_id: interviewId,
        role: 'ai',
        content: aiMessage,
      });

      if (shouldEnd) {
        const scoreMatch = aiMessage.match(/SCORE:\s*(\d+)/i);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;

        await supabase
          .from('interviews')
          .update({
            status: 'completed',
            score: score,
            feedback: aiMessage,
            completed_at: new Date().toISOString(),
          })
          .eq('id', interviewId);
      }

      return new Response(
        JSON.stringify({ message: aiMessage, completed: shouldEnd }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});