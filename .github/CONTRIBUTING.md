# Contributing to Attendance & Time Table App

We welcome contributions to the Attendance & Time Table App! This guide will help you get started with contributing to our project after setup.

## 📋 Contribution Workflow

### 1. Select an Issue

- Browse through the [Issues](https://github.com/anisharma07/Attendance-AI/issues) tab
- Look for issues with the **"active"** label
- **Assign the issue to yourself** before starting work to avoid conflicts

### 2. Understand Issue Dependencies

⚠️ **Important**: Issues may have dependencies indicated by numbers like `5 -> 6`

- This means issue #6 must be completed before starting issue #5
- Always check issue descriptions for dependency information
- Complete prerequisite issues first or wait for them to be resolved

### 3. Create a Branch

```bash
git checkout -b feature/#<issue-number-you-are-working-on>
```

**Examples:**

- `git checkout -b feature/#42` (for issue #42)
- `git checkout -b fix/#15` (for bug fix issue #15)
- `git checkout -b docs/#8` (for documentation issue #8)

### 4. Make Your Changes

- Write clean, readable code
- Follow the existing code style and conventions
- Add comments where necessary
- Test your changes thoroughly

### 5. Add your modified files
```bash
git init
git add #<filename or . to add all files>
```

### 6. Commit Your Changes

**Examples:**

Use the following examples for clean commit messages:

```bash
git commit -m "feat: add AI scheduling functionality (fixes #42)"
git commit -m "fix: resolve attendance calculation bug (fixes #28)"
git commit -m "docs: update README with new installation steps (fixes #15)"
git commit -m "style: format code according to ESLint rules (fixes #33)"
```

### 7. Push Your Changes

```bash
git push origin #<branch name>
```

### 8. Create a Pull Request

1. Go to your fork on GitHub
2. Click **"New Pull Request"**
3. Provide a clear title and description
4. Reference the issue number in the description (e.g., "Closes #42")
5. Submit the pull request


## 📝 Code Guidelines

- Follow existing code patterns and conventions
- Write meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Ensure your code is properly formatted

## 🧪 Testing

- Test your changes on both Android and iOS (if applicable)
- Verify that existing functionality still works
- Add tests for new features when possible

---

## Quick Checklist

- [ ] Forked the repository
- [ ] Cloned the fork locally
- [ ] Completed setup using [SETUP.md](https://github.com/anisharma07/Attendance-AI/blob/main/.github/SETUP.md)
- [ ] Assigned issue to yourself
- [ ] Checked for issue dependencies
- [ ] Created feature branch with proper naming
- [ ] Made clean commits with proper messages
- [ ] Tested changes thoroughly
- [ ] Created pull request
