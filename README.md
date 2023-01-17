## Copyright Notice

##

## Copyright Â©2021 SIG MLC LLC, 2805 Wilderness Place, Suite 100, Boulder, CO 80301. All Rights Reserved. Confidential and Proprietary Information of SIG MLC LLC. No rights or license are hereby implied or granted.

# EMP Dashboard Application

### Documents

- [Github Guidance](./doc/github.md)
- [Codebase Guidance](./doc/codebase.md)
- [Project structure](./doc/structure.md)

## 1. Setup development environment

### 1) Development requirement.

- **Code editor**: Visual studio code editor => ESLint, Prettier
- **Dev env**: Node.js => stable version 14.X.X
- **Dependency management**: Yarn
- **Dev dependency**: Python 2.7, GCC, Make, Git

### 2) Installation dependencies

Move to inside of the project and excute this script, so that you can install the depencies related to this project.

```bash
$ yarn
```

### 3) Execute/Build the app

```bash
$ yarn start     // start the current app
$ yarn build     // build the current app
```

## 2. Scripts

```javascript
"scripts": {
    "start": "node scripts/start.js",
    "build": "node scripts/build.js",
    "test": "node scripts/test.js"
  },
```

## 3. Github Guidence

### 1) Before starting the work.

- Download bibucket resources to your local

```bash
git clone https://****@bitbucket.org/sig/emp-dashboard.git
```

- Check current branch and switch to **dev** branch

```bash
$ git branch

dev@dev:~/Workspace/Work/EMP/emp-dashboard$ git branch
  dev
  ilya
* master
dev@dev:~/Workspace/Work/EMP/emp-dashboard$



$ git checkout dev

dev@dev:~/Workspace/Work/EMP/emp-dashboard$ git checkout dev
Switched to branch 'dev'
Your branch is up to date with 'origin/dev'.
dev@dev:~/Workspace/Work/EMP/emp-dashboard$
```

- Now you are in the staging branch named **dev**. For now, you can get started the project with this branch.

  > Tips: If you dont want to make any duplication or messing the other developer'code, then you can create new branch under your name.

```bash
  // Now you are in the dev branch..... you can start from there.
  $ git branch **** [your branch name]
  $ git branch       // With this cmd, you can see the branch that cloned from dev branch as well.

  dev@dev:~/Workspace/Work/EMP/emp-dashboard$ git branch test
  dev@dev:~/Workspace/Work/EMP/emp-dashboard$ git branch
  * dev
    ilya
    master
    test
  dev@dev:~/Workspace/Work/EMP/emp-dashboard$

  // After cloning your branch from dev branch, you should move to there. and you can go ahead.
  $ git checkout ***

```

### 2) Before pushing your code into your branch or dev branch.

- You have to check the current dev branch git logs. Compare the changes and if there are no commit on dev branch, then you can push it to your branch

```bash
$ git log
```

- If there are changes on the dev branch by other developers.

```bash
$ git checkout dev    // Make sure you already committed your changes on your local branch before do this.

$ git pull origin dev  =>  download the online resources from bitbucket to your local dev branch.

$ git log              => Have to check the downlaoded logs here.

$ git checkout ***     => Move to your branch for rebase the current local dev branch changes.

$ git branch           =>  Check the current branch where you are.

$ git rebase dev       =>  If you're in your own branch you can rebase the code from dev branch as well
```

- With above commands, you can get some conflicts on your end before moving to resolve the rebase command.
  - [Here I listed how to handle the conflicts](./doc/merge-conflicts.md)
- If you're succeed with git, then you can push the code from your local branch to remote branch
- And you can create the Pull Request directly to **dev** branch, and merge it.
- So that your updates will deploy into https://dev-dashboard.emp-sig.com

- As references, I recommend the [git guidance](https://rogerdudler.github.io/git-guide/) to keep your updates as modern
