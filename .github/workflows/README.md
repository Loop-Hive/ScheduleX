# 📁 GitHub Workflows & Automation

This directory contains automated workflows and documentation for the ScheduleX project.

## 🚀 Available Workflows

### 1. **Automated APK Release** (`release-apk.yml`)

Automatically builds and releases signed APK files when PRs with release triggers are merged.

**Triggers:**

- PR with `release` label merged to main
- PR with `[release]` in title merged to main
- Adding `release` label to an already-merged PR ✨

**Features:**

- 🔄 Smart version bumping (major/minor/patch)
- 🔐 Signed APK builds
- 📝 Auto-generated release notes
- 🏷️ Git tagging
- 📱 GitHub Releases integration
- 🔄 Re-triggerable by adding labels to closed PRs
- 🚫 Duplicate release prevention

### 2. **GSSoC'25 Contribution Report** (`contribution-report.yml`)

Generates comprehensive contribution reports for GSSoC'25 participants based on PRs with the `gssoc25` label.

**Triggers:**

- Manual trigger via workflow_dispatch
- Configurable time filters (1 day, 1 week, 1 month, 90 days, 6 months, 1 year)
- Multiple output formats (Markdown, JSON, CSV)

**Features:**

- 📊 Contributor statistics and rankings
- 📅 Pull request timeline analysis
- 🏷️ Label distribution statistics
- 📁 Downloadable report artifacts
- 👥 Unique contributor identification
- 📈 Contribution trends over time

### 3. **Welcome Workflow** (`welcome.yml`)

Welcomes new contributors and provides guidance.

## 📚 Documentation

| File                                                    | Description                                        |
| ------------------------------------------------------- | -------------------------------------------------- |
| [`RELEASE_WORKFLOW.md`](RELEASE_WORKFLOW.md)           | Complete guide for the automated release system   |
| [`SECRETS_SETUP.md`](SECRETS_SETUP.md)                 | Quick setup guide for GitHub Secrets              |
| [`CONTRIBUTION_REPORT_GUIDE.md`](CONTRIBUTION_REPORT_GUIDE.md) | Guide for generating GSSoC'25 contribution reports |

## 🚀 Quick Start for Releases

1. **Setup Secrets** (one-time setup)
   - Follow [`SECRETS_SETUP.md`](SECRETS_SETUP.md)
   - Add 4 required secrets to your repository

2. **Create Release PR**
   - Add `release` label OR `[release]` in title
   - Include version bump hints: `[major]`, `[minor]`, or leave for patch

3. **Merge to Main**
   - Workflow automatically triggers
   - APK gets built and released
   - Version gets updated across files

4. **Re-trigger Releases** ✨
   - Add `release` label to any already-merged PR
   - Workflow will re-run if no existing release found
   - Duplicate releases are automatically prevented

## 📊 Quick Start for Contribution Reports

1. **Navigate to Actions Tab**
   - Go to GitHub Actions in your repository
   - Find "Generate Contribution Report" workflow

2. **Run Workflow Manually**
   - Click "Run workflow" button
   - Select time period (1 day, 1 week, 1 month, 90 days, 6 months, 1 year)
   - Choose output format (Markdown, JSON, CSV)

3. **Download Report**
   - Wait for workflow completion
   - Download the generated report from artifacts section
   - Report includes contributor statistics, PR timeline, and label analysis

## 🎯 Version Bump Examples

| PR Title                             | Version Change            |
| ------------------------------------ | ------------------------- |
| `[release] Fix attendance bug`       | `1.0.3` → `1.0.4` (patch) |
| `[release][minor] Add QR sharing`    | `1.0.3` → `1.1.0` (minor) |
| `[release][major] Complete redesign` | `1.0.3` → `2.0.0` (major) |

## 🔧 Current Project Status

- ✅ Release workflow configured
- ✅ Signing setup ready
- ✅ Documentation complete
- ⏳ Secrets need to be added (see [SECRETS_SETUP.md](SECRETS_SETUP.md))

## 🆘 Need Help?

1. **For secrets setup**: Check [`SECRETS_SETUP.md`](SECRETS_SETUP.md)
2. **For workflow details**: Read [`RELEASE_WORKFLOW.md`](RELEASE_WORKFLOW.md)
3. **For issues**: Create a GitHub issue with details
4. **For questions**: Tag maintainers @anisharma07 or @Irtesaam

---

🎉 **Ready to automate your releases?** Follow the setup guides above!
