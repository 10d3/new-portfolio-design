# WakaTime Integration

This module provides WakaTime integration for the portfolio, displaying coding statistics, top languages, projects, and development tools.

## Features

- 📊 Coding statistics (daily average, total hours)
- 💻 Top programming languages
- 📁 Active projects with automatic type classification
- 🛠️ Development tools (editor, OS)
- 🔄 Automatic token refresh
- ⚡ Caching and revalidation

## Free Account Limitations

**Important**: Free WakaTime accounts only provide access to the **last 7 days** of data. All statistics reflect this 7-day period only.

For historical data beyond 7 days, a WakaTime premium subscription is required.

## Environment Variables

### Required OAuth Credentials
```env
WAKATIME_CLIENT_ID=your_client_id
WAKATIME_CLIENT_SECRET=your_client_secret
WAKATIME_REDIRECT_URI=your_redirect_uri
```

### Token Storage (Choose one method)

**Method 1: Individual tokens (recommended)**
```env
WAKATIME_ACCESS_TOKEN=waka_tok_...
WAKATIME_REFRESH_TOKEN=...
WAKATIME_EXPIRES_AT=2024-01-01T00:00:00Z
```

**Method 2: Combined token string**
```env
ACCESS_TOKEN=waka_tok_...&refresh_token=...&expires_at=...
```

## API Endpoints

- `GET /api/wakatime/debug` - Check environment variables and token status
- `POST /api/wakatime/refresh` - Manually refresh WakaTime stats
- `GET /api/wakatime/auth` - Get OAuth authorization URL
- `POST /api/wakatime/exchange-token` - Exchange authorization code for tokens

## Usage

```typescript
import { getWakatimeStatsAndProjects } from '@/lib/wakastat';

// Get all stats including projects and dev tools
const stats = await getWakatimeStatsAndProjects();

// Individual functions
import { 
  getWakatimeStats,
  getWakatimeProjects, 
  getWakatimeDevTools 
} from '@/lib/wakastat';
```

## Project Type Classification

Projects are automatically classified based on name patterns:

- **API**: api, backend, server
- **AI**: ai, ml, bot, machine-learning  
- **Mobile**: mobile, android, ios, react-native
- **Desktop**: desktop, electron, tauri
- **Game**: game, unity, unreal
- **Web**: Default fallback

## Caching

- Page revalidation: 1 hour
- Token refresh buffer: 5 minutes before expiry
- Manual refresh available via API endpoint

## Troubleshooting

1. **Check environment variables**: Visit `/api/wakatime/debug`
2. **Manual refresh**: Visit `/api/wakatime/refresh`
3. **Check console logs** for detailed error information
4. **Verify token expiry** in debug endpoint

## File Structure

```
src/lib/wakastat/
├── index.tsx           # Main integration logic
├── config.ts           # Configuration constants
├── types.ts            # TypeScript type definitions
└── env-validation.ts   # Environment validation utilities
```