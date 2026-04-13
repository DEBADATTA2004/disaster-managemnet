# Contributing to ResqNet

Thank you for your interest in contributing to **ResqNet** - Disaster Management & Emergency Communication System!

## Code of Conduct

Be respectful, inclusive, and collaborative. We are committed to providing a welcoming community for all.

## How to Contribute

### Reporting Bugs

1. **Search existing issues** to avoid duplicates
2. **Create a detailed report** including:
   - Description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (OS, Browser, Node version)
   - Screenshots if applicable

### Feature Requests

1. **Describe the feature** clearly with use case
2. **Explain the benefit** to the disaster response community
3. **Provide examples** if possible

### Code Contributions

#### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/DEBADATTA2004/disaster-managemnet.git
cd disaster-managemnet

# Install dependencies
npm install

# Start development server
npm start
```

#### Coding Standards

- **Language**: JavaScript (ES6+)
- **Formatting**: Use consistent indentation (2 spaces)
- **Naming**: Use camelCase for variables/functions, PascalCase for classes
- **Comments**: Write clear, helpful comments
- **No console logs**: Use structured logging instead

#### Commit Guidelines

```bash
# Feature
git commit -m "feat: add end-to-end encryption"

# Bug fix
git commit -m "fix: resolve connection timeout issue"

# Documentation
git commit -m "docs: update API documentation"

# Style
git commit -m "style: reformat code for consistency"

# Refactor
git commit -m "refactor: optimize message processing"

# Test
git commit -m "test: add unit tests for messaging"
```

#### Pull Request Process

1. **Fork the repository** on GitHub
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make changes** following coding standards
4. **Test thoroughly** - test on multiple devices if possible
5. **Commit with clear messages** using conventional commits
6. **Push to your fork**: `git push origin feature/your-feature-name`
7. **Create Pull Request** with:
   - Clear title describing the change
   - Description of what was changed and why
   - Reference to related issues
   - Testing information
   - Screenshots if UI changes

#### Testing

```bash
# Run tests
npm test

# Check for linting issues
npm run lint

# Build for production
npm run build
```

## Priority Areas for Contribution

### High Priority 🔴
- [ ] End-to-end encryption
- [ ] User authentication system
- [ ] Message persistence
- [ ] Security auditing

### Medium Priority 🟠
- [ ] Performance optimization
- [ ] UI/UX improvements
- [ ] Documentation
- [ ] Mobile app support

### Low Priority 🟡
- [ ] Additional themes
- [ ] Internationalization (i18n)
- [ ] Analytics dashboard
- [ ] Advanced reporting

## Development Tips

### Documentation
- Keep README.md updated
- Add inline code comments for complex logic
- Update CHANGELOG.md for notable changes

### Performance
- Test with 50+ concurrent connections
- Monitor memory usage
- Optimize message relay performance

### Security
- Validate all user inputs
- Sanitize messages before display
- Never expose sensitive credentials
- Follow OWASP guidelines

### Testing
- Write tests for critical features
- Test on different browsers/devices
- Stress test with high message volume
- Test offline scenarios

## File Structure

```
disaster-managemnet/
├── index.html              # Frontend UI
├── server.js              # Backend server
├── package.json           # Dependencies
├── README.md              # Main documentation
├── CONTRIBUTING.md        # This file
├── DEPLOYMENT.md          # Deployment guide
├── API.md                 # API documentation
├── LICENSE                # MIT License
├── .gitignore             # Git ignore rules
├── assets/
│   ├── css/
│   │   └── style.css      # Styles
│   ├── js/
│   │   └── sw.js          # Service Worker
│   └── image/             # Images
├── admin/                 # Admin utilities
└── docs/                  # Additional documentation
    ├── ARCHITECTURE.md    # System architecture
    ├── SETUP.md          # Setup guide
    └── TROUBLESHOOTING.md # Troubleshooting
```

## Communication

- **Issues**: Use GitHub Issues for bugs and features
- **Discussions**: Start discussions for ideas
- **Email**: Reach out to maintainers directly
- **Security Issues**: email security@resqnet.dev (do not create public issues)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

- Contributors will be listed in README.md
- Major contributors may be added to contributor page
- Significant work may be highlighted in release notes

## Questions?

- Check existing documentation
- Search closed issues for solutions
- Create a discussion if unsure

---

**Thank you for helping make emergency communication systems more resilient!** 🚨

Together, we're building tools that save lives during disasters.
