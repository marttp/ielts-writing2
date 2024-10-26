import axios from "axios";

const SYSTEM_PROMPT = `
  Please review the following IELTS Writing Task 2 response. Assess the answer based on the IELTS Writing band descriptors (Task Achievement, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy). Provide your feedback in the following format:

  Possible Band: [Estimated band score]

  Description:

  [A detailed analysis highlighting the strengths and weaknesses of the response. Focus on how well the candidate addressed the task, the organization and clarity of ideas, vocabulary usage, and grammatical accuracy.]

  Improvement:

  [Specific suggestions on how the candidate can enhance their performance in each criterion to achieve a higher band score.]

  Here is the example:

  [Insert example for better score at band 8-9]

  ---

  Example Output:

  Possible Band: 6.5

  Description:

  The candidate addresses the task adequately, presenting a clear position throughout the essay. Ideas are generally relevant and supported, though some points could be developed further. The essay demonstrates a logical organization with effective use of cohesive devices, albeit with occasional inaccuracies. Vocabulary is sufficient to convey meaning, with some less common expressions used appropriately. However, there are instances of word choice errors and repetition. Grammatical structures are varied, but errors in complex sentences and punctuation are noticeable.

  Improvement:

  To improve, the candidate should provide more detailed examples to fully develop their ideas. Enhancing vocabulary range by incorporating more precise and varied expressions will strengthen the lexical resource. Attention to grammatical accuracy, especially in complex sentence structures, will help reduce errors. Additionally, refining the use of cohesive devices can improve the overall flow of the essay.

  Here the example for better score:

  xxxxxxxxx
  `;

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ApiResponse {
  result: {
    response: string;
  };
  success: boolean;
  errors: any[];
  messages: any[];
}

export const onRequestPost = async ({ request, env }) => {
  const AI_GATEWAY_PROJECT = env.AI_GATEWAY_PROJECT;
  const API_KEY = env.CLOUDFLARE_API_KEY;

  const message = await request.text();

  const url = `https://gateway.ai.cloudflare.com/v1/${AI_GATEWAY_PROJECT}/ielts-writing2-practice/workers-ai/@cf/meta/llama-3.2-3b-instruct`;

  if (!API_KEY) {
    throw new Error(
      "API key is not defined. Please set CLOUDFLARE_API_KEY in your environment variables.",
    );
  }

  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: message,
    },
  ];

  try {
    const response = await axios.post<ApiResponse>(
      url,
      { messages },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    const data = response.data;
    if (data.success && data.result && data.result.response) {
      const answer = data.result.response;
      return new Response(JSON.stringify(answer), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    if (error.response) {
      console.error("Error Response:", error.response.data);
      console.error("Status Code:", error.response.status);
    } else if (error.request) {
      console.error("No Response:", error.request);
    } else {
      console.error("Error:", error.message);
    }
    throw error;
  }
};
