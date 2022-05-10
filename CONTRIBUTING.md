# Contributing

Thank you for being interested in contributing to this project! 🙌🏻 Your help is invaluable in keeping in great. Below, you will find everything you need to get started.

## 🖇️ Table of Contents

1. [Code of Conduct](CODE_OF_CONDUCT.md)
2. [Reporting Bugs](#-reporting-bugs)
3. [Suggesting Features](#-suggesting-features)
4. [Creating Pull Requests](#-creating-pull-requests)

## 📣 Code of Conduct
This project and everyone participating are governed by this [Code of Conduct](CODE_OF_CONDUCT.md). Please familiarise yourself with what behaviour will not be tolerated, as we expect you to act accordingly to this code. You can report unacceptable behaviour to [support@calibreapp.com](mailto:support@calibreapp.com). 

## 🐛 Reporting Bugs
Before creating a bug report, see if the problem [has already been reported](https://github.com/calibreapp/image-actions/issues). If yes, and **the issue is still open**, add a comment to the existing issue instead of creating a new one.

When creating a bug report, please **provide as much information and context as possible** to help the maintainers quickly identify and resolve problems:

1. **Describe the bug.** Please provide a clear and concise description of what the bug is.
2. **Explain how to reproduce.** Outline the steps to reproduce the behaviour, including any relevant information such as operating system, browser type and version, etc.
3. **Outline the expected behaviour.** Describe what you expected to happen clearly and concisely.
4. **Add screenshots.** If applicable, add screenshots to help explain the problem.

As you create the issue, you will be [guided to provide relevant information](.github/ISSUE_TEMPLATE/---bug-report.md).

## 💡 Suggesting Features

Before suggesting a new feature, see if [has already been suggested](https://github.com/calibreapp/image-actions/issues?q=is%3Aissue+is%3Aopen+Feature+request). If yes, and **the issue is still open**, add a comment to the existing issue instead of creating a new one.

When filing a feature request, please **provide as much information and context as possible** to help the maintainers triage issues:

1. **What problem would this feature solve?** A clear and concise description of what the problem is.
2. **Describe the solution you’d like to see.** A clear and concise description of what you would like to happen. Are you willing to work on implementing this solution?
3. **Describe alternatives you’ve considered.** A clear and concise description of any alternative solutions or features you’ve considered.

As you create the feature request, you will be [guided to provide relevant information](.github/ISSUE_TEMPLATE/---feature-request.md).

## 📝 Creating Pull Requests
We welcome contributions to the project that:

* Improve the quality, security and performance
* Resolve existing issues and feature requests

Please follow these steps to have your contribution considered by the maintainers:

1. Fork and clone this repository.
2. Create a new branch: `git checkout -b my-branch-name`.
3. Install dependencies (`npm install`) and run the project (`npm run build` or `npm run watch`).
4. Make your changes and verify that the checks are still passing (`npm run test`).
5. Confirm a successful Docker build with `docker build -t calibreapp/image-actions:dev .`.
6. Push to your fork and submit a pull request accordingly to [the guidelines](.github/pull_request_template.md).
7. Sign a CLA (if present).
8. Wait till your changes are reviewed and merged. 🥳

You must meet the above requirements to have your pull request reviewed. The maintainers may ask you to complete additional work, tests, or other changes before accepting and merging your pull request. 

Here are a few things that will increase the chances of your pull requests being accepted:

* keep your changes focused on the scope of the task
* write code that’s easily readable and understandable
* write tests where relevant
* write a good pull request and commit messages

Thank you for contributing! ✨