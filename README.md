# Calibre Image Actions

[![License](https://img.shields.io/github/license/calibreapp/image-actions?color=informational)](https://github.com/calibreapp/image-actions/blob/main/LICENSE)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-success)](CODE_OF_CONDUCT.md)
[![Contribution guidelines](https://img.shields.io/badge/PRs-welcome-success)](CONTRIBUTING.md)

Image Actions is a Github Action built by your #webperf monitoring friends at [Calibre](https://calibreapp.com/). It automatically compresses JPEGs, PNGs, WebPs and AVIFs for each Pull Request.

Image Actions offers:

- **Fast, efficient and near-lossless compression**
- Best image compression algorithms available ([libvips](https://github.com/libvips/libvips))
- [Ease of customisation](#Configuration): use default settings or adapt to your needs
- Running on demand or schedule
- Supports GitHub Enterprise

...and more!

## 🖇 Table of Contents

1. [Usage](#-usage)
2. [Configuration](#%EF%B8%8F-configuration)
3. [Migrating legacy configuration](#%EF%B8%8F-migrating-legacy-configuration)
4. [Contributing](#-contributing)
5. [Resources](#-resources)
6. [License](#-license)

## 🛠 Usage

1. Create a `.github/workflows/calibreapp-image-actions.yml` file in your repository with the following configuration:

```yml
name: Compress Images
on:
  pull_request:
    # Run Image Actions when JPG, JPEG, PNG, WebP or AVIF files are added or changed.
    # See https://help.github.com/en/actions/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions#onpushpull_requestpaths for reference.
    paths:
      - '**.jpg'
      - '**.jpeg'
      - '**.png'
      - '**.webp'
      - '**.avif'
  workflow_dispatch:
jobs:
  build:
    # Only run on Pull Requests within the same repository, and not from forks.
    if: github.event_name == 'workflow_dispatch' || github.event.pull_request.head.repo.full_name == github.repository
    name: calibreapp/image-actions
    permissions: write-all
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4

      - name: Compress PR Images
        uses: calibreapp/image-actions@main
```

2. Open a Pull Request with new or updated imagery. Image Actions will optimise images, and commit them to your branch:

![Calibre Image Actions Preview](images/image-actions-preview.png)

3. Merge your Pull Request and enjoy lighter images or explore what’s possible further with [configuration options](#️-configuration). 👇🏻

## ⚙️ Configuration

By default, Image Actions optimises new or updated images in each Pull Request. For manual runs (`workflow_dispatch`), scheduled runs, or API failures, **all images** will be processed.

### Control image quality settings

Add the following arguments to the workflow definition to control compression settings:

```yml
with:
  jpegQuality: '85'
  jpegProgressive: false
  pngQuality: '80'
  webpQuality: '85'
  avifQuality: '75'
```

**Options:**

- [jpegQuality](https://sharp.pixelplumbing.com/api-output/#jpeg): Number, integer 1-100, default 85 stored in a string.
- [jpegProgressive](https://sharp.pixelplumbing.com/api-output/#jpeg): Boolean, true or false, default false.
- [pngQuality](https://sharp.pixelplumbing.com/api-output/#png): Number, integer 1-100, default 80 stored in a string.
- [webpQuality](https://sharp.pixelplumbing.com/api-output/#webp): Number, integer 1-100, default 85 stored in a string.
- [avifQuality](https://sharp.pixelplumbing.com/api-output/#avif): Number, integer 1-100, default 75 stored in a string.

### Ignore paths

Ignore selected paths using comma-separated [minimatch pattern globbing](https://www.npmjs.com/package/minimatch):

```yml
with:
  ignorePaths: 'node_modules/**,build'
```

### Run compression only

By default, Image Actions adds optimised images to the current Pull Request and posts a summary comment.

Use the `compressOnly` option with `true` value to skip the commit and summary comment if you want to handle this separately (including for forks):

```yml
with:
  compressOnly: true
```

`compressOnly` accepts a Boolean value (true or false) and defaults to false.

### Minimum percentage change

By default, Image Actions commits optimised images if the new size is at least 5% smaller than the original one.

Use the `minPctChange` option to change the percentage. You might want to increase it to avoid consecutive
compressions of the same webp images.

```yml
with:
  minPctChange: '2.5'
```

`minPctChange` accepts a numerical value represented as a string. `Default = '5'`.

### Compress on demand or on schedule

It is also possible to run Image Actions [on demand](https://github.blog/changelog/2020-07-06-github-actions-manual-triggers-with-workflow_dispatch/) or on a [recurring schedule](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#schedule). By using the `compressOnly` option, in conjunction with [`create-pull-request`](https://github.com/peter-evans/create-pull-request) action by [@peter-evans](https://github.com/peter-evans), a new Pull Request will be raised if there are optimised images in a repository.

See an example below:

```yml
# Compress images on demand (workflow_dispatch), and at 11pm every Sunday (schedule).
# Open a Pull Request if any images can be compressed.
name: Compress Images
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
        uses: actions/checkout@v3
      - name: Compress Images
        id: calibre
        uses: calibreapp/image-actions@main
        with:
          compressOnly: true
      - name: Create New Pull Request If Needed
        if: steps.calibre.outputs.markdown != ''
        uses: peter-evans/create-pull-request@v4
        with:
          title: Compressed Images Nightly
          branch-suffix: timestamp
          commit-message: Compressed Images
          body: ${{ steps.calibre.outputs.markdown }}
```

### Process Pull Requests from forked repositories

By default, GitHub Actions do not have permission to alter forked repositories. For this reason, Image Actions only works for Pull Requests from branches in the same repository as the destination branch. There are several workarounds for this limitation:

1. **Replace the default `GITHUB_TOKEN` with a [Personal Access Token (PAT)](https://help.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token#permissions-for-the-github_token) which does have permission to access forked repositories.** Be aware that this introduces potential security concerns (which is why it not available by default).

```yml
      - name: Compress PR Images
        uses: calibreapp/image-actions@main
        with:
          # `GITHUB_TOKEN` is automatically generated by GitHub and scoped only to the repository that is currently running the action. By default, the action can’t update Pull Requests initiated from forked repositories.
          # See https://docs.github.com/en/actions/reference/authentication-in-a-workflow and https://help.github.com/en/articles/virtual-environments-for-github-actions#token-permissions
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

2. **Run Image Actions only for Pull Requests in the current repository.** This approach is advised when not using Personal Access Tokens (PATs) to avoid wasting time and compute for compressions that will not be committed. Use the following configuration to check if a Pull Request belongs to the repository (or allow manual triggers):

```yml
if: github.event_name == 'workflow_dispatch' || github.event.pull_request.head.repo.full_name == github.repository
```

3. **Run an additional instance of Image Actions in `compressOnly` mode on pushes to `main`, and then raise a new Pull Request for any images committed without being compressed (e.g. from a forked repository PR).** See the configuration in the below example which uses the [create-pull-request](https://github.com/peter-evans/create-pull-request) action by [@peter-evans](https://github.com/peter-evans) to open the new Pull Request (this only raises a Pull Request if any files are changed in previous steps).

```yml
name: Compress Images on Push to main branch
on:
  push:
    branches:
      - main
    paths:
      - '**.jpg'
      - '**.jpeg'
      - '**.png'
      - '**.webp'
      - '**.avif'
jobs:
  build:
    name: calibreapp/image-actions
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v3
      - name: Compress Images
        id: calibre
        uses: calibreapp/image-actions@main
        with:
          compressOnly: true
      - name: Create New Pull Request If Needed
        if: steps.calibre.outputs.markdown != ''
        uses: peter-evans/create-pull-request@v4
        with:
          title: Compressed Images
          branch-suffix: timestamp
          commit-message: Compressed Images
          body: ${{ steps.calibre.outputs.markdown }}
```

### Combined workflow

You can combine all of the above customisation options into one all-encompassing workflow to avoid having to set up separate workflows with a lot of duplication.

The example below ensures the right order of task execution within Image Actions. If you’d like to reuse it, make sure to change `example/example_repo` to your repository details.

```yml
# Image Actions will run in the following scenarios:
# - on Pull Requests containing images (not including forks)
# - on pushing of images to `main` (for forks)
# - on demand (https://github.blog/changelog/2020-07-06-github-actions-manual-triggers-with-workflow_dispatch/)
# - at 11 PM every Sunday in anything gets missed with any of the above scenarios
# For Pull Requests, the images are added to the PR.
# For other scenarios, a new PR will be opened if any images are compressed.
name: Compress images
on:
  pull_request:
    paths:
      - '**.jpg'
      - '**.jpeg'
      - '**.png'
      - '**.webp'
      - '**.avif'
  push:
    branches:
      - main
    paths:
      - '**.jpg'
      - '**.jpeg'
      - '**.png'
      - '**.webp'
      - '**.avif'
  workflow_dispatch:
  schedule:
    - cron: '00 23 * * 0'
jobs:
  build:
    name: calibreapp/image-actions
    runs-on: ubuntu-latest
    # Only run on main repo on and PRs that match the main repo.
    if: |
      github.repository == 'example/example_repo' &&
      (github.event_name != 'pull_request' ||
       github.event.pull_request.head.repo.full_name == github.repository)
    steps:
      - name: Checkout Branch
        uses: actions/checkout@v3
      - name: Compress Images
        id: calibre
        uses: calibreapp/image-actions@main
        with:
          # For non-Pull Requests, run in compressOnly mode and we'll PR after.
          compressOnly: ${{ github.event_name != 'pull_request' }}
      - name: Create Pull Request
        # If it's not a Pull Request then commit any changes as a new PR.
        if: |
          github.event_name != 'pull_request' &&
          steps.calibre.outputs.markdown != ''
        uses: peter-evans/create-pull-request@v4
        with:
          title: Auto Compress Images
          branch-suffix: timestamp
          commit-message: Compress Images
          body: ${{ steps.calibre.outputs.markdown }}
```

## 🙌🏻 Contributing

Happy to hear you’re interested in contributing to Image Actions! Please find our contribution guidelines [here](CONTRIBUTING.md).

## 📚 Resources

#### Related reading:

- [Automatically compress images on Pull Requests](https://calibreapp.com/blog/compress-images-in-prs/)
- [Optimize Images with a GitHub Action](https://css-tricks.com/optimize-images-with-a-github-action/)
- [Image Actions on GitHub Marketplace](https://github.com/marketplace/actions/image-actions)
- [Start monitoring and improving your performance](https://calibreapp.com/)

#### Image compression tools:

- [sharp](https://github.com/lovell/sharp)
- [libvips](https://github.com/libvips/libvips)

## 💼 License

This project is licensed under a [GNU General Public License](LICENSE).
