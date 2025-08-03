#!/bin/bash
# Force Supabase deploy with service role key

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env"
  exit 1
fi

if [ -z "$SUPABASE_PROJECT_REF" ]; then
  echo "❌ Missing SUPABASE_PROJECT_REF in .env"
  exit 1
fi

echo "🚀 Deploying function $1 to Supabase project $SUPABASE_PROJECT_REF..."
supabase functions deploy "$1" \
  --project-ref "$SUPABASE_PROJECT_REF" \
  --no-verify-jwt

