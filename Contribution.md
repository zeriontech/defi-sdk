# Contributing to defi-sdk
GitHub is a popular platform for collaborating on open-source software projects. Contributing to a project on GitHub can be a great way to learn from others, gain experience, and make a positive impact on a project you care about. Here are some guidelines to help you get started.

 ## 1. Fork the project
Forking a project creates a copy of the project in your own GitHub account. This allows you to make changes to the code without affecting the original project.
  To fork a project, navigate to the project's GitHub page and click on the `Fork` button in the upper-right corner.

 ## 2. Clone the project
Once you have forked the project, you need to clone it to your local machine so that you can make changes to the code. 
  To clone the project, open a terminal window and run the following command, replacing `your-username` with your GitHub username:

```bash
git clone https://github.com/your-username/project-name.git
```
## 3. Create a new branch
Before making any changes to the code, create a new branch for your changes. This allows you to isolate your changes from the main branch, 
making it easier to review and merge your changes later on. To create a new branch, run the following command:

```bash
git checkout -b your-branch-name
```
Replace `your-branch-name` with a descriptive name for your branch.

## 4. Make changes to the code
Now that you have created a new branch, you can make changes to the code. Be sure to follow any coding standards or guidelines established by the project.
Write clear commit messages that describe the changes you have made.

 ## 5. Push your changes
Once you have made changes to the code, you need to push them to your forked repository on GitHub. To do this, run the following command:

```bash
git push origin your-branch-name
```
This will push your changes to your forked repository.


 ## 6. Create a pull request
After you have pushed your changes to your forked repository, you can create a pull request to merge your changes into the main branch of the original project.
To do this, navigate to your forked repository on GitHub and click on the `New pull request` button. Follow the prompts to create the pull request.We **love** pull requests! Before [forking the repo](https://help.github.com/en/github/getting-started-with-github/fork-a-repo) and [creating a pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/proposing-changes-to-your-work-with-pull-requests) for non-trivial changes, it is usually best to first open an issue to discuss the changes, or discuss your intended approach for solving the problem in the comments for an existing issue.



*Note: All contributions will be licensed under the project's license.*

- **Smaller is better.** Submit **one** pull request per bug fix or feature. A pull request should contain isolated changes pertaining to a single bug fix or feature implementation. **Do not** refactor or reformat code that is unrelated to your change. It is better to **submit many small pull requests** rather than a single large one. Enormous pull requests will take enormous amounts of time to review, or may be rejected altogether. 

- **Coordinate bigger changes.** For large and non-trivial changes, open an issue to discuss a strategy with the maintainers. Otherwise, you risk doing a lot of work for nothing!

- **Prioritize understanding over cleverness.** Write code clearly and concisely. Remember that source code usually gets written once and read often. Ensure the code is clear to the reader. The purpose and logic should be obvious to a reasonably skilled developer, otherwise you should add a comment that explains it.

- **Follow existing coding style and conventions.** Keep your code consistent with the style, formatting, and conventions in the rest of the code base. When possible, these will be enforced with a linter. Consistency makes it easier to review and modify in the future.

- **Include test coverage.** Add unit tests or UI tests when possible. Follow existing patterns for implementing tests.

- **Update the example project** if one exists to exercise any new functionality you have added.

- **Add documentation.** Document your changes with code doc comments or in existing guides.

- **Update the CHANGELOG** for all enhancements and bug fixes. Include the corresponding issue number if one exists, and your GitHub username. (example: "- Fixed crash in profile view. #123 @jessesquires")

- **Use the repo's default branch.** Branch from and [submit your pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request-from-a-fork) to the repo's default branch.

- **[Resolve any merge conflicts](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github)** that occur.

- **Promptly address any CI failures**. If your pull request fails to build or pass tests, please push another commit to fix it. 

- When writing comments, use properly constructed sentences, including punctuation.

- Use spaces, not tabs.

  


## 7. Participate in the review process
Once you have created a pull request, the project maintainers will review your changes and provide feedback.
Be responsive to their feedback and be willing to make changes as needed. This is an opportunity to learn from experienced developers and improve your skills.

 ## 8. Merge your changes
If your pull request is approved, the project maintainers will merge your changes into the main branch of the project.
  Congratulations, you have successfully contributed to a defi-sdk on GitHub!

## Conclusion
Contributing  on GitHub can be a rewarding experience. By following these guidelines,
you can make meaningful contributions to this repository. 
Remember to be patient, be respectful, and be open to learning from others. Happy coding!
