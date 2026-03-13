# Copilot Instructions

## Code Standards

- **Language**: All code must be written in JavaScript or TypeScript, depending on the project requirements
- **Documentation**: All comments, docstrings, variable names, and documentation must be written in English
- **Consistency**: Maintain consistent naming conventions and code style throughout the project
- **Best Practices**: Follow PEP 8 guidelines for JavaScript code formatting and style

## Code Requirements

1. Write clean, readable, and maintainable JavaScript code
2. Use English language for all code elements:
   - Variable and function names
   - Class names and comments
   - Docstrings and type hints
   - Error messages and logging
3. Include proper type hints where applicable
4. Write descriptive commit messages in English
5. Keep code documentation up to date

## Quality Guidelines

- Ensure code is well-documented with docstrings
- Write unit tests when appropriate
- Follow SOLID principles
- Keep functions and classes focused and single-responsibility

## Comments Guidelines

- **Avoid ALL redundant comments**: Do not add comments that simply restate or describe what the code does
  - ❌ AVOID: `// Get boards data` (the code is self-explanatory)
  - ❌ AVOID: `// Calculate hardware requirements` (obvious from function call)
  - ❌ AVOID: `// Set x to 5` for `const x = 5`
  - ❌ AVOID: `// Run the script` before `main()`
  - ✅ GOOD: Only add comments that explain *why* something is done, not *what* it does
  
- **No unnecessary JSDoc/docstrings for obvious code**: 
  - ❌ AVOID: JSDoc for simple, self-explanatory functions like `main()`
  - ❌ AVOID: Comments that just repeat the function name
  - ✅ GOOD: Brief JSDoc ONLY for complex functions, public APIs, or non-obvious logic

- Comments should provide context, reasoning, or clarification
- Keep code self-documenting with clear function and variable names
