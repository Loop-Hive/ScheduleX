# Contributing to Attendance & Time Table App

We welcome contributions to the Attendance & Time Table App! This guide will help you get started with contributing to our project.

## 🚀 Getting Started

### Step 1: Fork the Repository

1. Visit the [project repository](https://github.com/anisharma07/Attendance-AI)
2. Click the **"Fork"** button in the top-right corner
3. This creates a copy of the repository in your GitHub account

### Step 2: Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/Attendance-AI.git
cd Attendance-AI
```

### Step 3: Set Up the Development Environment

Follow the complete setup instructions in our [**SETUP.md**](.github/SETUP.md) file to configure your development environment.

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

### 3. Create a Feature Branch

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

### 5. Commit Your Changes

#### Clean Commit Messages

Use the following format for commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Commit Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

**Examples:**

```bash
git commit -m "feat: add AI scheduling functionality (fixes #42)"
git commit -m "fix: resolve attendance calculation bug (fixes #28)"
git commit -m "docs: update README with new installation steps (fixes #15)"
git commit -m "style: format code according to ESLint rules (fixes #33)"
```

### 6. Push Your Changes

```bash
git push origin feature/#<issue-number>
```

### 7. Create a Pull Request

1. Go to your fork on GitHub
2. Click **"New Pull Request"**
3. Provide a clear title and description
4. Reference the issue number in the description (e.g., "Closes #42")
5. Submit the pull request

### 8. Close the Issue

After your PR is successfully merged, go to the issue page that mark the issue as completed that have been merged.

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
- [ ] Completed setup using [SETUP.md](.github/SETUP.md)
- [ ] Assigned issue to yourself
- [ ] Checked for issue dependencies
- [ ] Created feature branch with proper naming
- [ ] Made clean commits with proper messages
- [ ] Tested changes thoroughly
- [ ] Created pull request
- [ ] Closed issue after successful merge
