# Image Actions

Image Actions automatically compresses JPEG, PNG and WebP images in GitHub Pull Requests.

- **Fast, efficient and near-lossless compression**
- Uses the best image compression algorithms available: [mozjpeg](https://github.com/mozilla/mozjpeg) and [libvips](https://github.com/libvips/libvips)
- [Configurable](#Configuration) and extensible: use default settings or adapt to your needs
- Runs in [GitHub Actions](https://github.com/features/actions)
- Built by web performance experts at [Calibre](https://calibreapp.com/); a performance monitoring platform

![Preview of image-actions Pull Request comment](https://user-images.githubusercontent.com/924/62024579-e1470d00-b218-11e9-8655-693ea42ba0f7.png)

### Table of Contents

- [Image Actions](#image-actions)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Image quality settings](#image-quality-settings)
  - [Running just the compression](#running-just-the-compression)
  - [Handling pull requests from forked repos](#handling-pull-requests-from-forked-repos)
  - [Compressing images on demand or on a schedule](#compressing-images-on-demand-or-on-a-schedule)
  - [Combined workflow](#combined-workflow)
  - [Migrate legacy configuration](#migrate-legacy-configuration)
  - [Local development](#local-development)
  - [Links and Resources](#links-and-resources)

## Installation

Create the `.github/workflows/calibreapp-image-actions.yml` file with the following configuration:

```yml
name: Compress images
on:
  pull_request:
    # Run image-actions when jpg, jpeg, png or webp files are added or changed
    # See https://help.github.com/en/actions/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions#onpushpull_requestpaths
    paths:
      - '**.jpg'
      - '**.jpeg'
      - '**.png'
      - '**.webp'
jobs:
  build:
    # Only run on Pull Requests within the same repository, and not from forks
    if: github.event.pull_request.head.repo.full_name == github.repository
    name: calibreapp/image-actions
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v2

      - name: Compress Images
        uses: calibreapp/image-actions@v1
        with:
          githubToken: ${{ secrets.GITHUB_TOKEN }}
```

_The `GITHUB_TOKEN` secret is [automatically generated by GitHub](https://help.github.com/en/articles/virtual-environments-for-github-actions#github_token-secret). This automatic token is [scoped only to the repository that is currently running the action.](https://help.github.com/en/articles/virtual-environments-for-github-actions#token-permissions). What this means is that by default the Action cannot update pull requests initiated from forked repositories._

## Configuration

By default image actions will compress images so that they’re smaller and will leave your assets looking clear and crisp. If you want to change those defaults, read on.

Previous versions of image-actions used `.github/calibre/image-actions.yml` for configuration. We suggest that you migrate to the newest configuration format by reading the [migration steps](#migration-legacy-configuration) below.

## Image quality settings

Set custom configuration by adding arguments to the action workflow definition:

```yml
- name: Compress Images
  uses: calibreapp/image-actions@v1
  with:
    githubToken: ${{ secrets.GITHUB_TOKEN }}
    jpegQuality: '80'
    jpegProgressive: false
    pngQuality: '80'
    webpQuality: '80'
    ignorePaths: 'node_modules/**,build'
    compressOnly: false
```

Options:

- [jpegQuality](http://sharp.pixelplumbing.com/en/stable/api-output/#jpeg): Number, integer 1-100, default 80 stored in a string
- [pngQuality](http://sharp.pixelplumbing.com/en/stable/api-output/#png): Number, integer 1-100, default 80 stored in a string
- [webpQuality](http://sharp.pixelplumbing.com/en/stable/api-output/#webp): Number, integer 1-100, default 80 stored in a string
- [jpegProgressive](http://sharp.pixelplumbing.com/en/stable/api-output/#jpeg): Boolean, true or false, default false
- `ignorePaths`: a comma separated string with [globbing](https://www.npmjs.com/package/glob) support of paths to ignore when looking for images to compress
- `compressOnly`: Boolean, true or false, default false

## Running just the compression

By default image-actions will add updated images to the current pull request. It is also possible to set the `compressOnly` option to `true` to skip the commit, if you want to handle this separately - including for forks - see below.

```yml
- name: Compress Images
  uses: calibreapp/image-actions@v1
  with:
    githubToken: ${{ secrets.GITHUB_TOKEN }}
    compressOnly: true
```

## Handling pull requests from forked repos

GitHub actions, by default, do not have permission to alter forked repositories. This means this action, by default, only works for pull requests from branches in the same repository as the destination branch.

You can replace the default `GITHUB_TOKEN` with a [personal access token (PAT)](https://help.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token#permissions-for-the-github_token) which does have permission for forked repositories, but this introduces other security considerations (which is why it not available by default).

Alternatively you can run this action only for Pull Requests for the current repo, which is advised when not using PATs to avoid wasting time and compute for compressions that will not be committed using the following syntax (as shown in the example yml files in this README):

```
    if: github.event.pull_request.head.repo.full_name == github.repository
```

It is also possible to run an additional instance of this action in `compressOnly` mode on pushes to your default branch, and then raise a new pull request for any images committed without being compressed (e.g. from a forked repository pull request). This is shown in the below example which uses the [create-pull-request](https://github.com/peter-evans/create-pull-request) action by [@peter-evans](https://github.com/peter-evans) to open the new Pull Request (note this only raises a Pull Request if any files are actually changed in previous steps).

```yml
name: Compress Images on Push to the Default Branch
on:
  push:
    branches:
      - $default-branch
    paths:
      - '**.jpg'
      - '**.jpeg'
      - '**.png'
      - '**.webp'
jobs:
  build:
    name: calibreapp/image-actions
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v2
      - name: Compress Images
        id: calibre
        uses: calibreapp/image-actions@v1
        with:
          githubToken: ${{ secrets.GITHUB_TOKEN }}
          compressOnly: true
      - name: Create New Pull Request If Needed
        if: steps.calibre.outputs.markdown != ''
        uses: peter-evans/create-pull-request@v3
        with:
          title: Compressed Images
          branch-suffix: timestamp
          commit-message: Compressed Images
          body: ${{ steps.calibre.outputs.markdown }}
```

## Compressing images on demand or on a schedule

It is also possible to run image-actions [on demand](https://github.blog/changelog/2020-07-06-github-actions-manual-triggers-with-workflow_dispatch/) or on a [recurring schedule](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#schedule). By using the `compressOnly` option, in conjunction with [`create-pull-request`](https://github.com/peter-evans/create-pull-request) action by [@peter-evans](https://github.com/peter-evans), a new Pull Request will be raised if there are optimised images in a repository.

```yml
# Compress images on demand (workflow_dispatch), and at 11pm every Sunday (schedule).
# Open a pull request if any images can be compressed
name: Compress images
on:
  workflow_dispatch:
  schedule:
    - cron: '00 23 * * 0'
jobs:
  build:
    name: calibreapp/image-actions
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v2
      - name: Compress Images
        id: calibre
        uses: calibreapp/image-actions@v1
        with:
          githubToken: ${{ secrets.GITHUB_TOKEN }}
          compressOnly: true
      - name: Create New Pull Request If Needed
        if: steps.calibre.outputs.markdown != ''
        uses: peter-evans/create-pull-request@v3
        with:
          title: Compressed Images Nightly
          branch-suffix: timestamp
          commit-message: Compressed Images
          body: ${{ steps.calibre.outputs.markdown }}
```

## Combined workflow

You can combine all of the above into one all-encompassing workflow to avoid having to set up separate workflows with a lot of duplication of configuration. This does require some GitHub Actions syntax workflow to ensure the right workflow runs at the right time, so this is shown below. The only piece that requires changing is the `example/example_repo` line which should be changed to your own repository.

```yml
# image-actions will run in the following scenarios:
# - on pull requests containing images (not including forks)
# - on pushing of images to the default branch (for forks)
# - on demand (https://github.blog/changelog/2020-07-06-github-actions-manual-triggers-with-workflow_dispatch/)
# - at 11pm every Sunday just in case anything gets missed with any of the above
# For pull requests, the images are added to the PR
# For the rest a new PR is opened if any images are compressed.
name: Compress images
on:
  pull_request:
    paths:
      - '**.jpg'
      - '**.jpeg'
      - '**.png'
      - '**.webp'
  push:
    branches:
      - $default-branch
    paths:
      - '**.jpg'
      - '**.jpeg'
      - '**.png'
      - '**.webp'
  workflow_dispatch:
  schedule:
    - cron: '00 23 * * 0'
jobs:
  build:
    name: calibreapp/image-actions
    runs-on: ubuntu-latest
    # Only run on main repo on and PRs that match the main repo
    if: |
      github.repository == 'example/example_repo' &&
      (github.event_name != 'pull_request' ||
       github.event.pull_request.head.repo.full_name == github.repository)
    steps:
      - name: Checkout Branch
        uses: actions/checkout@v2
      - name: Compress Images
        id: calibre
        uses: calibreapp/image-actions@v1
        with:
          githubToken: ${{ secrets.GITHUB_TOKEN }}
          # For non-pull requests, run in compressOnly mode and we'll PR after
          compressOnly: ${{ github.event_name != 'pull_request' }}
      - name: Create Pull Request
        # If it's not a pull request then commit any changes as a new PR
        if: |
          github.event_name != 'pull_request' &&
          steps.calibre.outputs.markdown != ''
        uses: peter-evans/create-pull-request@v3
        with:
          title: Auto Compress Images
          branch-suffix: timestamp
          commit-message: Compress Images
          body: ${{ steps.calibre.outputs.markdown }}
```

## Migrate legacy configuration

- uses: docker://calibreapp/github-image-actions

  If your calibreapp-image-actions.yml file has a reference to `docker://` or `GITHUB_TOKEN` as follows:

  ```yml
  - name: calibreapp/image-actions
     uses: docker://calibreapp/github-image-actions
     env:
       GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  ```

  Update your configuration to:

  ```yml
  - name: Compress Images
    uses: calibreapp/image-actions@v1
    with:
      githubToken: ${{ secrets.GITHUB_TOKEN }}
  ```

- `.github/calibre/image-actions.yml`

  If your repository uses `.github/calibre/image-actions.yml` for configuration, it should be moved into `.github/workflows/calibreapp-image-actions.yml`. Then delete the `image-actions.yml` file.

  `ignorePaths` is no longer an array and is now a comma separated list. eg: `ignorePaths: "node_modules/**,bin"`

## Local Development

- **Install dependencies**: `npm install`
- **Build project**: `npm run build` or `npm run watch` for continuous rebuild-on-save
- **Run tests** `npm run test`
- **Confirm a successful Docker build**: `docker build -t calibreapp/image-actions:dev .`

## Links and Resources

- **[Announcement post: Automatically compress images on Pull Requests](https://calibreapp.com/blog/compress-images-in-prs/)**
- [Image Actions on GitHub Marketplace](https://github.com/marketplace/actions/image-actions)
- [sharp](https://github.com/lovell/sharp)
- [mozjpeg](https://github.com/mozilla/mozjpeg)
- [libvips](https://github.com/libvips/libvips)
- [Learn more about GitHub Actions](https://github.com/features/actions)
- [Start monitoring your sites performance](https://calibreapp.com/)
