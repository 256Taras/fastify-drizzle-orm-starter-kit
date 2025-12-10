#!/bin/bash

echo "🔧 Setting up Git hooks..."

# Check if husky is installed
if ! command -v husky &> /dev/null; then
    echo "📦 Husky not found. Installing..."
    npm install --save-dev husky
fi

# Install husky hooks
echo "🎣 Installing Husky hooks..."
npx husky install

# Make hooks executable
if [ -f ".husky/pre-commit" ]; then
    chmod +x .husky/pre-commit
fi

if [ -f ".husky/pre-push" ]; then
    chmod +x .husky/pre-push
fi

if [ -f ".husky/commit-msg" ]; then
    chmod +x .husky/commit-msg
fi

echo "✅ Git hooks setup complete!"
echo ""
echo "📋 Available hooks:"
echo "  • pre-commit: Format and lint staged files"
echo "  • commit-msg: Validate commit message (conventional commits)"
echo "  • pre-push: Run tests and type checks"
echo ""
echo "💡 Tips:"
echo "  • Run 'npm run precommit' to test pre-commit checks manually"
echo "  • Run 'npm run prepush' to test pre-push checks manually"
echo "  • Run 'npm run check:all' to run all checks"
