import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize the Gemini API client if key is available
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export async function askGemini(prompt: string, fallbackResponse: string): Promise<string> {
  if (!genAI) {
    // Return high-quality mock response if key is missing (for robust demo state)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(fallbackResponse);
      }, 1500); // simulate latency
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Gemini API call error:', error);
    return `[Gemini Error: ${error.message || 'Connection failed'}]. Fallback advice:\n\n${fallbackResponse}`;
  }
}

export function buildSystemContextPrompt(lead: any): string {
  return `You are a premium AI Business Consultant and sales strategist integrated into NexGenAiTech Sales OS. 
Your goal is to help sales professionals win deals by providing highly targeted, practical business intelligence and strategies.

Here is the context of the client lead you are advising on:
- Client Name: ${lead.name}
- Company: ${lead.company}
- Industry: ${lead.industry || 'Not specified'}
- Category: ${lead.category || 'Not specified'}
- Location: ${lead.business?.city || 'Unknown'}, ${lead.business?.country || 'Unknown'}
- Website: ${lead.website || 'Not specified'}
- Status: ${lead.status || 'New Lead'}
- Priority: ${lead.priority || 'Medium'}
- Business Description: ${lead.business?.description || 'No description provided.'}
- Lead Notes: ${lead.notes || 'No notes added.'}

Keep your responses structured, professional, clean, and optimized for sales conversion. Avoid generic CRM advice. Provide custom, tailored suggestions.`;
}

export function getFallbackForAction(action: string, lead: any): string {
  const company = lead.company || 'the client';
  const name = lead.name || 'the contact';
  const industry = lead.industry || 'their industry';

  switch (action) {
    case 'analyze':
      return `### Business Analysis for ${company}
**Industry Sector:** ${industry}

1. **Strategic Position:** ${company} is seeking optimization solutions. Their current lifecycle suggests they need automation to handle client onboarding.
2. **Core Growth Bottlenecks:**
   - Manual client prospecting pipelines that limit volume expansion.
   - Slower response times on proposals.
3. **Recommended Value Prop:** Pivot the pitch to focus on *operating scalability*. Highlight how NexGenAiTech can automate 40% of their manual data ingestion.`;

    case 'strategy':
      return `### Sales Strategy roadmap: ${company}
**Account Executive Action Plan:**

1. **Phase 1: Alignment (Days 1-5)**: Set up a call specifically to discuss their bottleneck around manual operations. Present our scalability metrics.
2. **Phase 2: Tailored Demo (Days 6-12)**: Show an LLM-powered ingestion pipeline parsing their exact file structures.
3. **Phase 3: Decision Loop (Days 13-20)**: Present a modular licensing structure to alleviate initial budget constraints.`;

    case 'outreach':
      return `### Personalized Outreach Pack for ${name}

#### Option 1: WhatsApp (Conversational)
"Hi ${name}, saw Stark's latest logistics release—impressive growth. We recently optimized Acme's ingestion rates by 40% using our custom LLM core. Would love to share the deck we prepared for your sector. Do you have 5 mins this Thursday? - NexGen Team"

#### Option 2: LinkedIn (Professional)
"Hello ${name},\n\nI've been following ${company}'s work in ${industry}. Many firms in your space face bottleneck delays around manual parsing as they scale.\n\nAt NexGenAiTech, we deploy custom LLM frameworks that integrate with existing pipelines to automate this processing with 99% accuracy. I put together a quick 3-slide visual case study showing how this fits your exact setup. Worth a brief look?\n\nBest regards,\nNexGen Sales OS"`;

    case 'proposal':
      return `### Proposal Framework: ${company}
**Prepared for:** ${name} (${company})

#### 1. Scope of Work
- **Custom LLM Ingestion Model**: Train a localized model on company-specific domain data.
- **API Integration**: Build standard REST hooks to connect with existing database stacks.
- **Analytics Dashboard**: Access real-time error tracking and accuracy logs.

#### 2. Commercial Investment
- **Implementation & Seeding Fee**: ₹3,50,000 (one-time)
- **Monthly Maintenance**: ₹45,000 / month (annual billing)

#### 3. Expected Implementation Timeline
- Weeks 1-2: Data extraction and secure seeding.
- Weeks 3-4: Model alignment and initial testing.
- Week 5: Full production deployment.`;

    case 'budget':
      return `### Budget Estimation: ${company}
Based on organization category (${lead.category || 'SMB'}) and description:

- **Suggested Proposal Range**: **₹3,00,000 to ₹5,50,000**
- **Optimal Pricing Node**: **₹3,80,000** one-time implementation fee + **₹40,000** monthly retainer.
- **Upsell Opportunities**: Add custom training workshops for their department leads (+₹85,000 one-time).`;

    case 'meeting':
      return `### Discovery Meeting Blueprint: ${company}

#### Key Discovery Questions:
1. *"What is the current manual processing delay when ingest volume increases by 20% month-over-month?"*
2. *"Who internally handles model validations when anomalies occur in client spreadsheets?"*

#### Preempting Common Objections:
- **Objection**: *"We have internal devs building a custom parser."*
  - **Handling**: Emphasize our out-of-the-box 99% accuracy rates, saving them 6+ months of dev resources and maintenance overhead.`;

    case 'score':
      return `### Lead Scorecard: ${company}
**Lead Rating: 84 / 100**

- **Profile Fit (40/50)**: High budget alignment, enterprise category.
- **Engagement (25/30)**: Replied to outreach, discovery meeting scheduled.
- **Urgency (19/20)**: Seeking solution for Q3 deployment.
- **Strategy Recommendation**: Score is strong. Proceed immediately with draft proposal presentation in the next call.`;

    default:
      return `Ready to assist with client profile ${company}. Click any quick action to generate customized strategies.`;
  }
}
