## Github Guidance

### 1. Core Branch Description

```bash
master => production branch for the deployment
dev    => Staging branch for development
test   => Test branch for test other guys.
```

### 2. Working progress

1. Create new branch with your name from **dev** branch.

```bash
$ git branch user_name
```

2. Create Pull Request to dev branch, and publish to #frontend-development channel
   > NOTE: Dont create the PR to master directly, it will affect the current server and codebase.
   1. if there is any conflicts on your code, then you have to handle it on your end.
   2. After handling the conflicts, update the PR again.
   3. You have to describe what you're updated and what issues did you have on PR description field.
      > NOTE: Dont merge your PR yourself, all code will be reviewed by core developers and they will handle it.

- [Git for teams workflow](./workflow.md)
- [Dealing with merge conflicts](./merge-conflicts.md)

## Useful reading material

### GitHub

- [Git Handbook](https://guides.github.com/introduction/git-handbook/)
- [Understanding the GitHub flow](https://guides.github.com/introduction/flow/)
- [Mastering Issues](https://guides.github.com/features/issues/)
- [Forking](https://guides.github.com/activities/forking/)

### Code Review

- [The 10 Commandments of Navigating Code Reviews](https://angiejones.tech/ten-commandments-code-reviews/)
- [Code reviews by Dr. Michaela Greiler](https://www.michaelagreiler.com/category/code-reviews/)
- [Code Review Best Practices by Trisha Gee (Jetbrains) (video)](https://www.youtube.com/watch?v=a9_0UUUNt-Y)
- [Patterns of Effective Teams by Dan North (video)](https://www.youtube.com/watch?v=lvs7VEsQzKY)
