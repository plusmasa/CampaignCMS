# Product Requirements Document (PRD) - Campaign Management CMS

## Overview
A Content Management System (CMS) for creating and managing marketing campaigns with support for multiple channels and workflow states.

## Core Entities

### Campaign
Each campaign contains the following properties:
- **Title**: Name of the campaign
- **Date Last Modified**: Timestamp of last modification
- **Date Published**: Publication timestamp
- **State**: Current status of the campaign
  - Draft
  - Scheduled
  - Live
  - Complete
- **Partner Tag**: Optional tag identifying a partner associated with the campaign
- **Channels**: One or more of the following channels:
  - Email
  - BNP
  - Rewards Dashboard
- **Market Assignment**: Geo-location targeting for campaign display with three selection options:
  - Specific market (e.g., U.S.)
  - Multiple markets (e.g., U.S. and Europe)
  - All Markets (global campaign)

## User Interface

### Main Dashboard
- Displays a table of all campaigns
- Sorted by Date Last Modified (descending)
- Table columns:
  - Campaign Name
  - Date Last Modified
  - State
  - Edit Icon (pencil)

### Campaign Editing
- Clicking the pencil icon opens campaign details in a new tab
- Details page allows editing all campaign properties

## Workflow Requirements

### Campaign Creation and Management
- User can create a new campaign draft
- User can add any number of channels to a campaign
- User can delete a campaign draft
- User will always get a popup confirming they want to delete before the actual deletion happens
- User can publish a campaign instantly if they choose

### Campaign State Management
- User can unschedule a scheduled campaign (reverting to Draft state)
- User can change the publish date of a scheduled campaign
- User can stop a live campaign:
  - Ongoing channels like banners will be removed from being displayed to users
  - Channels that already got sent, like an email, cannot be recalled

### State Transitions
- **Draft** → Scheduled: When user sets a future publish date
- **Draft** → Live: When user sets immediate publish or past publish date
- **Scheduled** → Draft: When user unschedules the campaign
- **Scheduled** → Live: Automatically when publish date is reached
- **Live** → Complete: When campaign duration expires or user manually completes it

## Channel-Specific Configurations

Each channel will have its own unique CMS configuration, allowing for customized content per channel type:

- **Dashboard Banner** (example):
  - Title
  - Description
  - Link URL
  - Background Image
- **Email Channel** (to be defined):
  - Subject Line
  - Body Content
  - Sender Information
  - Template Selection
- **BNP Channel** (to be defined)
- Additional channels will be configurable with their specific properties

*Note: Detailed specifications for each channel configuration will be defined in subsequent documentation.*

## Reporting

Each campaign will generate a performance report per channel, allowing for:
- Channel-specific analytics
- Performance comparisons across channels
- Effectiveness metrics for targeted markets

## Market Targeting

Campaigns can be assigned to specific markets (geographic regions), ensuring content is only displayed to users within those locations. Users have three options for market targeting:
1. **Single Market**: Target one specific geographic region
2. **Multiple Markets**: Target a selected group of geographic regions
3. **All Markets**: Global campaign targeting all available regions

This flexible approach allows for precise geographic targeting while maintaining the ability to create both highly localized and global campaigns.
