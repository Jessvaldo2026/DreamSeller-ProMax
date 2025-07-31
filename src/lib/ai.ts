export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export class AIAssistant {
  private messages: AIMessage[] = [
    {
      role: 'system',
      content: 'You are an AI business assistant for DreamSeller Pro. Help users with business automation, revenue optimization, product generation, and marketing strategies. Be concise and actionable.',
      timestamp: new Date()
    }
  ];

  async sendMessage(userMessage: string): Promise<string> {
    try {
      // Validate input is a string and not empty
      if (typeof userMessage !== "string" || !userMessage || !userMessage.trim()) {
        return 'Please provide a valid message.';
      }
      
      this.messages.push({
        role: 'user',
        content: userMessage.trim(),
        timestamp: new Date()
      });

      // Check for specific patterns in user input
      let assistantMessage = "I can help you with business optimization, revenue strategies, and automation. What would you like to know?";
      
      // Safe pattern matching with proper type checking
      const emailMatch = typeof userMessage === "string" ? userMessage.match(/@/) : null;
      const revenueMatch = typeof userMessage === "string" ? userMessage.match(/revenue|money|profit|earning/i) : null;
      const businessMatch = typeof userMessage === "string" ? userMessage.match(/business|company|startup/i) : null;
      const helpMatch = typeof userMessage === "string" ? userMessage.match(/help|assist|support/i) : null;
      
      if (emailMatch) {
        assistantMessage = "I can help you set up email marketing campaigns and supplier outreach. Would you like to use the Bulk Emailer feature?";
      } else if (revenueMatch) {
        assistantMessage = "I can help you optimize your revenue streams. Your current businesses are generating good returns. Consider scaling your top performers or exploring new business modules.";
      } else if (businessMatch) {
        assistantMessage = "I can help you manage and grow your automated businesses. You have 12 active businesses generating $24,580 monthly. Which area would you like to focus on?";
      } else if (helpMatch) {
        assistantMessage = "I'm here to help! I can assist with business optimization, revenue growth, product generation, marketing strategies, and automation. What specific area interests you?";
      }
      
      this.messages.push({
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date()
      });

      return assistantMessage;
    } catch (error) {
      console.error('AI Assistant Error:', error);
      return 'I can help you with business optimization, revenue strategies, and automation. What would you like to know?';
    }
  }

  getMessages(): AIMessage[] {
    return this.messages.filter(msg => msg.role !== 'system');
  }

  clearMessages(): void {
    this.messages = this.messages.filter(msg => msg.role === 'system');
  }
}

export const aiAssistant = new AIAssistant();