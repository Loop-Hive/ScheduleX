# 📊 GSSoC'25 Contribution Report Workflow

This document explains how to use the GSSoC'25 Contribution Report workflow to generate comprehensive reports about contributor activities.

## 🚀 How to Generate a Report

### Step 1: Navigate to GitHub Actions
1. Go to your repository on GitHub
2. Click on the **"Actions"** tab
3. Find the **"📊 Generate Contribution Report"** workflow in the left sidebar

### Step 2: Run the Workflow
1. Click on **"Run workflow"** button (green button on the right)
2. Configure the following options:

   **Time Filter Options:**
   - `1_day` - Last 1 Day
   - `1_week` - Last 1 Week  
   - `1_month` - Last 1 Month (default)
   - `90_days` - Last 90 Days
   - `6_months` - Last 6 Months
   - `1_year` - Last 1 Year

   **Output Format Options:**
   - `markdown` - Human-readable report with rich formatting (default)
   - `json` - Structured data format for programmatic use
   - `csv` - Spreadsheet-compatible format

3. Click **"Run workflow"** to start the process

### Step 3: Download the Report
1. Wait for the workflow to complete (usually takes 1-2 minutes)
2. Scroll down to the **"Artifacts"** section
3. Download the artifact named: `gssoc25-contribution-report-{time_filter}-{format}`
4. Extract the ZIP file to access your report

## 📋 Report Contents

### Markdown Report Includes:
- **Summary Statistics**: Total PRs, unique contributors, time period
- **Contributor Rankings**: Sorted by number of contributions
- **Individual Contributor Details**: Profile links, avatars, PR lists
- **PR Timeline**: Chronological list of all contributions
- **Label Distribution**: Statistics about PR labels

### JSON Report Includes:
- **Metadata**: Generation timestamp, period, repository info
- **Summary**: Key statistics
- **Contributors Array**: Detailed contributor data with PR lists
- **Pull Requests Array**: Complete PR data

### CSV Reports Include:
- **contribution_report.csv**: All PRs with details
- **contributor_summary.csv**: Contributor summary table

## 🔍 What Gets Analyzed

The workflow analyzes:
- ✅ All Pull Requests labeled with `gssoc25`
- ✅ PRs within the specified time period
- ✅ Both open and merged PRs
- ✅ Contributor profiles and statistics
- ✅ PR labels and categorization
- ✅ Timeline and activity patterns

## 📊 Sample Use Cases

### For Project Maintainers:
- **Monthly Reviews**: Generate monthly reports to track contributor activity
- **Event Summary**: Create end-of-event reports for GSSoC'25
- **Contributor Recognition**: Identify top contributors for acknowledgment

### For Contributors:
- **Progress Tracking**: See your contributions over time
- **Team Analysis**: Understand team dynamics and contribution patterns

### For Program Organizers:
- **Activity Monitoring**: Track participation across different time periods
- **Data Export**: Export data for further analysis or integration

## 🛠️ Technical Details

- **API Limits**: Uses GitHub's REST API with pagination to handle large repositories
- **Rate Limiting**: Respects GitHub API rate limits automatically
- **Data Freshness**: Reports are generated in real-time from current repository data
- **Artifact Retention**: Reports are stored for 30 days as downloadable artifacts

## 🔧 Troubleshooting

### Common Issues:
1. **No PRs Found**: Ensure PRs have the `gssoc25` label
2. **Empty Report**: Check if the time period includes any labeled PRs
3. **Workflow Fails**: Verify repository permissions and GitHub token access

### Getting Help:
- Check the workflow run logs for detailed error messages
- Ensure you have the necessary permissions to run workflows
- Contact repository maintainers if issues persist

## 📈 Report Examples

### Markdown Report Structure:
```
# 🏆 GSSoC'25 Contribution Report

## 📈 Summary Statistics
- Total Pull Requests: 25
- Unique Contributors: 12
- Time Period: Last 1 Month

## 👥 Contributors and Their Contributions
### 1. @contributor1 (8 PRs)
- [#123 Fix bug in attendance tracking](...)
- [#124 Add new feature](...)
...
```

### CSV Report Columns:
```
PR_Number,Title,Author,State,Created_Date,Updated_Date,Merged_Date,Labels,URL
144,"resolved the export csv for android 13+",FireFistisDead,closed,2025-08-24,2025-08-25,2025-08-25,"level3;gssoc25",https://github.com/...
```

This workflow provides a comprehensive view of GSSoC'25 contributions and helps maintain transparency and recognition within the contributor community.