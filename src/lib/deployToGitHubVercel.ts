import "dotenv/config";

// src/lib/deployToGitHubVercel.ts
import fetch from "node-fetch";

// You will need to add these to your .env file:
// GITHUB_TOKEN=ghp_yourgithubtoken
// VERCEL_TOKEN=vercel_personal_token
// GITHUB_USERNAME=your_github_username
// VERCEL_TEAM_ID=optional_team_id

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN!;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME!;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || undefined;

/**
 * Deploys AI-generated code to GitHub + Vercel automatically
 * @param repoName Name of the GitHub repo
 * @param code App source code (string)
 * @param _userId Supabase user ID for tracking (not used yet)
 */
export async function deployToGitHubVercel(
  repoName: string,
  code: string,
  _userId: string
) {
  if (!GITHUB_TOKEN || !VERCEL_TOKEN || !GITHUB_USERNAME) {
    throw new Error("❌ Missing GitHub or Vercel credentials in .env");
  }

  console.log(`📦 Creating GitHub repo: ${repoName}...`);
  const repoRes = await fetch(`https://api.github.com/user/repos`, {
    method: "POST",
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
    body: JSON.stringify({
      name: repoName,
      private: true,
    }),
  });

  if (!repoRes.ok) {
    throw new Error(`❌ GitHub repo creation failed: ${await repoRes.text()}`);
  }
  console.log(`✅ GitHub repo created: ${repoName}`);

  // Commit the AI-generated app code to the new repo
  console.log(`📝 Uploading AI-generated code to GitHub...`);
  const fileRes = await fetch(
    `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/contents/index.js`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message: "AI-generated app code",
        content: Buffer.from(code).toString("base64"),
      }),
    }
  );

  if (!fileRes.ok) {
    throw new Error(`❌ Failed to upload code: ${await fileRes.text()}`);
  }
  console.log(`✅ Code committed to GitHub`);

  // Deploy to Vercel
  console.log(`🚀 Deploying ${repoName} to Vercel...`);
  const vercelRes = await fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: repoName,
      gitSource: {
        type: "github",
        repoId: `${GITHUB_USERNAME}/${repoName}`,
      },
      projectSettings: {
        framework: "nextjs",
      },
      ...(VERCEL_TEAM_ID ? { teamId: VERCEL_TEAM_ID } : {}),
    }),
  });

  if (!vercelRes.ok) {
    throw new Error(`❌ Vercel deployment failed: ${await vercelRes.text()}`);
  }

  const vercelData: any = await vercelRes.json();
  console.log(`✅ Deployed to Vercel: https://${vercelData.url}`);

  return {
    repo: `https://github.com/${GITHUB_USERNAME}/${repoName}`,
    liveUrl: `https://${vercelData.url}`,
  };
}
