// src/lib/automation/marketingAutomation.ts
import fetch from "node-fetch";
import OpenAI from "openai";
import { trackEarnings } from "../trackEarnings";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY || "",
});

// List of hashtags & keywords to target for free organic traffic
const hashtags = [
  "#EcommerceSuccess",
  "#OnlineBusiness",
  "#PassiveIncome",
  "#ShopifyStore",
  "#DigitalProducts",
  "#AIpowered",
];

// Function to generate AI-powered marketing content
async function generateMarketingPost(businessName: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a skilled marketing copywriter who creates viral social media posts.",
        },
        {
          role: "user",
          content: `Write a short, engaging post to promote ${businessName} using trending keywords and hashtags. Keep it under 250 characters.`,
        },
      ],
    });

    const text = completion.choices?.[0]?.message?.content || "";
    return `${text} ${hashtags.join(" ")}`;
  } catch (error) {
    console.error("❌ OpenAI content generation failed:", error);
    return "";
  }
}

// Function to post to Twitter (X) — placeholder
async function postToTwitter(content: string) {
  try {
    console.log(`📢 Posting to Twitter: ${content}`);
    // Example placeholder — Replace with Twitter API call if configured
    return true;
  } catch (error) {
    console.error("❌ Failed to post to Twitter:", error);
    return false;
  }
}

// Function to post to Facebook — placeholder
async function postToFacebook(content: string) {
  try {
    console.log(`📢 Posting to Facebook: ${content}`);
    // Example placeholder — Replace with Facebook API call if configured
    return true;
  } catch (error) {
    console.error("❌ Failed to post to Facebook:", error);
    return false;
  }
}

// Main marketing automation runner
export async function runMarketingAutomation(
  userId: string,
  businessId: string,
  businessName: string
) {
  console.log(`🚀 Running marketing automation for ${businessName}...`);

  // Generate AI marketing post
  const postContent = await generateMarketingPost(businessName);
  if (!postContent) {
    console.warn("⚠️ No content generated. Skipping marketing post.");
    return;
  }

  // Post to multiple platforms
  await postToTwitter(postContent);
  await postToFacebook(postContent);

  // Optional — Simulate traffic earnings
  const earning = parseFloat((Math.random() * 50 + 10).toFixed(2));
  await trackEarnings(earning, businessId, businessName, userId);

  console.log(`💰 Marketing earnings tracked: +$${earning} for ${businessName}`);
  console.log("🎯 Marketing automation complete!");
}
