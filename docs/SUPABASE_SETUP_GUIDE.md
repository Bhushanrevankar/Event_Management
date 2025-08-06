# Supabase Setup Guide

## 🎯 Current Status

✅ **Environment File Created**: `.env.local` with your Supabase credentials
✅ **Supabase Packages Installed**: `@supabase/supabase-js` and `@supabase/ssr`
✅ **Utility Files Created**: Client, server, and middleware configurations
✅ **Test Page Created**: Visit `/test-supabase` to verify connection

## 🔧 Missing Credentials

You need to get these additional credentials from your Supabase dashboard:

### 1. Service Role Key
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `uunnksszmnlnzjjczses`
3. Go to **Settings** → **API**
4. Copy the `service_role` key (⚠️ **Keep this secret!**)
5. Update your `.env.local`:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Replace with actual service role key
```

### 2. JWT Secret
1. In the same **Settings** → **API** page
2. Copy the **JWT Secret**
3. Update your `.env.local`:
```bash
SUPABASE_JWT_SECRET=your-jwt-secret-here
```

### 3. Database Password (Optional)
1. Go to **Settings** → **Database**
2. Find your database password or reset it
3. Update the DATABASE_URL in `.env.local`:
```bash
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.uunnksszmnlnzjjczses.supabase.co:5432/postgres
```

## 🗄️ Database Schema Setup

Now you need to create the database tables. You have two options:

### Option 1: Using Supabase Dashboard (Recommended for beginners)
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the SQL from `docs/DATABASE_SCHEMA.md`
3. Run the SQL queries to create tables

### Option 2: Using MCP Server (Advanced)
Since you have the Supabase MCP server configured, you can create tables directly through Claude Code.

## 🧪 Test Your Setup

1. **Start your dev server**: `npm run dev`
2. **Visit the test page**: http://localhost:3000/test-supabase
3. **Check connection status**: You should see green checkmarks for:
   - ✅ Environment Variables
   - ✅ Supabase Client  
   - ✅ Database Connection

## 📋 Next Steps Checklist

- [ ] Get service role key from Supabase dashboard
- [ ] Get JWT secret from Supabase dashboard  
- [ ] Update `.env.local` with missing credentials
- [ ] Apply database schema from `docs/DATABASE_SCHEMA.md`
- [ ] Test authentication flow
- [ ] Create first event category
- [ ] Build your first component

## 🔐 Security Notes

⚠️ **Important**: 
- Never commit `.env.local` to git
- Keep your service role key secret
- Use environment variables for all sensitive data
- Enable Row Level Security on all tables

## 🆘 Troubleshooting

### Connection Issues
```bash
# Check if environment variables are loaded
npm run dev
# Visit: http://localhost:3000/test-supabase
```

### Database Errors
```bash
# Common issues:
# 1. Tables don't exist → Apply schema from docs/DATABASE_SCHEMA.md
# 2. Permission denied → Check RLS policies
# 3. Connection refused → Verify credentials in .env.local
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## 🎉 Success Indicators

You'll know everything is working when:
1. ✅ Test page shows all green checkmarks
2. ✅ No errors in the browser console
3. ✅ Database queries return data (after schema is applied)
4. ✅ Authentication flows work properly

Once you see these indicators, you're ready to start building your event management features!