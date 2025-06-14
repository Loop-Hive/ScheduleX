# Quick Reference Guide

## 🤖 Automation Commands

### Issue Assignment

- `/assign` - Assign issue to yourself (requires "active" label)
- `/unassign` - Unassign yourself from an issue

## 📋 Templates

### Issue Templates

- **Feature Request** (`feature_request.yml`) - For new features
- **Bug Report** (`bug_report.yml`) - For bug reports
- **Documentation** (`documentation.yml`) - For docs improvements

### PR Templates

- **Default** (`pull_request_template.md`) - General PR template
- **Feature** (`PULL_REQUEST_TEMPLATE/feature.md`) - Feature-specific
- **Bug Fix** (`PULL_REQUEST_TEMPLATE/bugfix.md`) - Bug fix specific
- **Documentation** (`PULL_REQUEST_TEMPLATE/documentation.md`) - Docs specific

### Using Specific PR Templates

Add `?template=filename.md` to your PR URL:

- Feature: `?template=feature.md`
- Bug Fix: `?template=bugfix.md`
- Documentation: `?template=documentation.md`

## 🏷️ Labels

### Issue States

- `active` - Ready for assignment
- `in-progress` - Currently being worked on
- `blocked` - Waiting for dependencies

### Issue Types

- `bug` - Bug reports
- `enhancement` - Feature requests
- `documentation` - Documentation related
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed

### Priority

- `priority: high` - High priority
- `priority: medium` - Medium priority
- `priority: low` - Low priority

## 🔄 Workflow

### For Contributors

1. Find issue with "active" label
2. Comment `/assign` to assign to yourself
3. Create branch: `feature/#<issue-number>`
4. Make changes
5. Create PR with appropriate template
6. Close issue after PR merge

### For Maintainers

1. Review new issues and add appropriate labels
2. Ensure "active" label for assignable issues
3. Review PRs and provide feedback
4. Merge approved PRs
5. Verify issues are closed properly

## 📊 Branch Naming Convention

- `feature/#<issue-number>` - For new features
- `fix/#<issue-number>` - For bug fixes
- `docs/#<issue-number>` - For documentation
- `refactor/#<issue-number>` - For refactoring
- `test/#<issue-number>` - For testing

## 💬 Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**

- `feat: add AI scheduling functionality (fixes #42)`
- `fix: resolve attendance calculation bug (fixes #28)`
- `docs: update setup instructions (fixes #15)`
