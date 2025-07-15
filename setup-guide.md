# NoFears.app - Setup Guide 🚀

## Quick Setup Checklist

### 1. Environment Variables Setup

Copy this to your `.env.local` file and fill in your values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration  
OPENAI_API_KEY=sk-your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Supabase Project Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and set project name: `nofears-app`
   - Generate a strong password
   - Select your region (closest to your users)

2. **Configure Database**
   - Go to SQL Editor in your Supabase dashboard
   - Copy the entire content from `supabase-schema.sql`
   - Paste and run it to create all tables and functions

3. **Setup Authentication**
   - Go to Authentication > Providers
   - Enable Email provider (for magic links)
   - Enable Google provider:
     - Add your Google OAuth Client ID
     - Add your Google OAuth Client Secret
   - In Site URL settings, add:
     - `http://localhost:3000` (development)
     - `https://nofears.app` (production)
   - In Redirect URLs, add:
     - `http://localhost:3000/api/auth/callback`
     - `https://nofears.app/api/auth/callback`

4. **Get Your Keys**
   - Go to Settings > API
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Google OAuth Setup

1. **Google Cloud Console**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API

2. **Create OAuth Credentials**
   - Go to Credentials > Create Credentials > OAuth 2.0 Client ID
   - Application type: Web application
   - Name: NoFears.app
   - Authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`

3. **Add to Supabase**
   - Copy Client ID and Client Secret
   - Add to Supabase Authentication > Providers > Google

### 4. OpenAI API Setup

1. **Get OpenAI API Key**
   - Go to [OpenAI Platform](https://platform.openai.com/)
   - Create account or login
   - Go to API Keys
   - Create new secret key
   - Copy the key → `OPENAI_API_KEY`

2. **Verify GPT-4 Access**
   - Check your account has GPT-4 API access
   - Add billing information if needed
   - Test the API key works

### 5. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

### 6. Test the Flow

1. **Landing Page**: Check Google sign-in button works
2. **Authentication**: Sign up with Google or email
3. **Onboarding**: Complete the life assessment
4. **Dashboard**: Verify Life Wheel displays and tasks generate
5. **Task Completion**: Test marking tasks as complete

### 7. Production Deployment

1. **Vercel Setup**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Environment Variables in Vercel**
   - Go to Vercel Dashboard > Project > Settings > Environment Variables
   - Add all your `.env.local` variables
   - Update `NEXT_PUBLIC_APP_URL` to your domain

3. **Update Supabase Settings**
   - Add production URL to Supabase auth settings
   - Update redirect URLs with your domain

### 8. Domain Configuration (nofears.app)

1. **Add Custom Domain in Vercel**
   - Go to Vercel Dashboard > Project > Settings > Domains
   - Add `nofears.app` and `www.nofears.app`

2. **Update DNS**
   - Point your domain to Vercel's servers
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → Vercel IP addresses

3. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_APP_URL=https://nofears.app
   ```

## Troubleshooting Common Issues

### Database Issues
```sql
-- If you need to reset tables:
DROP TABLE IF EXISTS daily_tasks CASCADE;
DROP TABLE IF EXISTS life_assessments CASCADE; 
DROP TABLE IF EXISTS profiles CASCADE;
DROP TYPE IF EXISTS life_category CASCADE;

-- Then re-run the schema
```

### Authentication Issues
- Verify redirect URLs match exactly
- Check Google OAuth settings
- Ensure Supabase auth providers are enabled

### OpenAI Issues
- Verify API key is correct
- Check you have GPT-4 access
- Monitor API usage/billing

### Development Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart development server
npm run dev
```

## Security Checklist

- [ ] All API keys are in `.env.local` (never committed)
- [ ] RLS is enabled on all Supabase tables
- [ ] Google OAuth is configured correctly
- [ ] Production URLs are updated in all services
- [ ] HTTPS is enforced in production

## Support

If you run into issues:

1. Check the browser console for errors
2. Check Supabase logs for database issues
3. Verify all environment variables are set
4. Test API endpoints individually
5. Check OpenAI API usage and limits

## Success Indicators

✅ User can sign up with Google or email  
✅ Life assessment saves to database  
✅ AI generates 3 personalized tasks  
✅ Life Wheel displays correctly  
✅ Tasks can be marked complete  
✅ Progress updates in real-time  
✅ User can generate new tasks  

**You're ready to help people turn their rock bottom into their comeback! 🌱 → 🚀** 