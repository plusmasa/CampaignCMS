# Timezone Management Plan for Campaign CMS

## ⚠️ IMPORTANT: Demo Scope Limitation
**For this demo/development version, we are using a STATIC SOLUTION:**
- All times will be in Pacific Timezone (PT/PST/PDT)
- Users will select both date AND time through the UI
- No timezone conversion or market-specific timing
- This is a simplified approach for development purposes only

---

## Development Solution (Current Demo)

### Static Timezone Approach
- **Fixed Timezone**: Pacific Time (PT)
- **User Interface**: Date picker + Time picker (24-hour format recommended)
- **Storage**: Store as UTC in database but display/input in PT
- **Default Times**: 
  - Email campaigns: Default to 9:00 AM PT (avoid midnight sends)
  - Banner campaigns: Default to 12:01 AM PT (start of business day)
- **Validation**: Ensure emails aren't scheduled for unreasonable hours (e.g., 2:00 AM)

---

## Production Solution (Future Implementation)

### Research: How Other Systems Handle Timezones

#### **Major Campaign Management Platforms:**

**1. Mailchimp:**
- Uses sender's account timezone as default
- Allows manual timezone selection per campaign
- "Send Time Optimization" feature sends at optimal times per recipient timezone
- Stores everything in UTC, converts for display

**2. HubSpot:**
- Account-level default timezone setting
- Campaign-level timezone override option
- "Send at recipient's local time" feature for global campaigns
- Smart send times based on engagement data

**3. Salesforce Marketing Cloud:**
- Multi-timezone support with "Send at Local Time" feature
- Journey Builder respects recipient timezone
- Publication lists can have timezone-specific rules
- Uses Apex Scheduler for complex timezone logic

**4. Facebook/Meta Ads:**
- Uses advertiser's account timezone
- Budget pacing and reporting in account timezone
- Ad delivery optimized for target audience timezone automatically

#### **Key Patterns Identified:**
1. **Account-level default timezone** (most common)
2. **Campaign-level timezone override**
3. **Recipient/Market-based timezone intelligence**
4. **UTC storage with timezone-aware display**
5. **Smart send time optimization**

### Proposed Production Architecture

#### **1. Timezone Configuration Hierarchy**
```
1. Account Default Timezone (set during onboarding)
2. Campaign Override Timezone (optional)
3. Channel-Specific Timezone Rules (advanced)
4. Market-Based Auto-Timezone (intelligent)
```

#### **2. Database Schema Additions**

**User/Account Level:**
```sql
- defaultTimezone (String: IANA timezone identifier, e.g., "America/New_York")
- dateFormat (String: user preference)
- timeFormat (String: 12h/24h preference)
```

**Campaign Level:**
```sql
- timezoneOverride (String: optional IANA timezone)
- useMarketTimezones (Boolean: enable market-smart timing)
```

**Channel Configuration Extensions:**
```sql
- sendTimezone (String: specific timezone for this channel)
- marketTimingRules (JSON: complex rules per market)
```

#### **3. Market-Smart Timezone Logic**

**For Email Campaigns:**
- **Single Market**: Send at specified time in that market's primary timezone
- **Multiple Markets**: Send at specified local time in each market
- **All Markets**: Send in waves (e.g., 9 AM local time globally)

**For Banner/Display Campaigns:**
- **Single Market**: Start/stop at local business hours
- **Multiple Specific Markets**: Start at earliest timezone, stop at latest
- **All Markets**: Follow sun pattern (start as business day begins globally)

**Market Timezone Mapping:**
```javascript
const MARKET_TIMEZONES = {
  'US': 'America/New_York',    // Eastern as default US timezone
  'UK': 'Europe/London',
  'CA': 'America/Toronto',
  'AU': 'Australia/Sydney',
  'DE': 'Europe/Berlin',
  'FR': 'Europe/Paris',
  'JP': 'Asia/Tokyo'
};
```

#### **4. Technical Implementation Strategy**

**Required Libraries:**
- **moment-timezone** or **date-fns-tz**: Timezone conversion
- **node-cron**: Timezone-aware scheduling
- **iana-tz-data**: Timezone database updates

**Backend Services:**
```javascript
// Timezone Service
class TimezoneService {
  convertToUserTimezone(utcDate, userTimezone)
  convertToUTC(localDate, fromTimezone)
  getMarketTimezone(marketCode)
  calculateGlobalSendWindows(baseTime, markets)
  validateBusinessHours(time, timezone)
}

// Scheduling Service
class ScheduleService {
  scheduleEmailCampaign(campaign, sendRules)
  scheduleBannerCampaign(campaign, displayWindows)
  handleTimezoneChanges(campaign) // DST handling
}
```

**Database Strategy:**
- **Store all dates in UTC**
- **Include timezone context fields**
- **Use database timezone functions for queries**
- **Index on timezone-converted dates for performance**

#### **5. User Experience Design**

**Campaign Creation UI:**
1. **Default Timezone Display**: Show user's account timezone
2. **Timezone Selector**: Dropdown with common timezones + search
3. **Smart Defaults**: 
   - Email: 9:00 AM in selected timezone
   - Banners: 12:01 AM (start of day)
4. **Preview Feature**: "This campaign will send at..." with multiple timezone examples
5. **Market Intelligence**: "Emails will be sent at 9 AM local time in each selected market"

**Advanced Options:**
- "Send at recipient's local time" checkbox
- "Optimize send time based on engagement data" (future AI feature)
- Custom timezone rules per channel

#### **6. Edge Cases & Considerations**

**Daylight Saving Time (DST):**
- Store timezone identifiers, not offsets
- Handle DST transitions gracefully
- Warn users about campaigns scheduled during transition periods

**Campaign Modifications:**
- Timezone changes should warn about impact on scheduled items
- Already-sent emails cannot be timezone-adjusted
- Banner campaigns can be timezone-adjusted for future display

**Performance Optimization:**
- Cache timezone calculations
- Pre-calculate send windows for large campaigns
- Use database partitioning for timezone-based queries

**International Considerations:**
- Support for non-Western calendars (future)
- Right-to-left languages in time pickers
- Cultural considerations for send times (religious holidays, business hours)

### Implementation Phases (Future)

**Phase 1**: Basic timezone selection and UTC storage
**Phase 2**: Market-smart timing for emails  
**Phase 3**: Complex banner timezone rules
**Phase 4**: AI-powered send time optimization
**Phase 5**: International calendar support

---

## Development Reminder

**🚨 For the current demo, we are NOT implementing any of the above complexity.**

We will:
- Use Pacific Time (PT) only
- Add time pickers to the UI (hours:minutes)
- Store times as UTC but work in PT
- Default email campaigns to 9:00 AM PT
- Default banner campaigns to 12:01 AM PT

The production timezone strategy above is for future reference and serves as a roadmap for enterprise-level timezone management.
