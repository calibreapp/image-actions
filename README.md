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
  - [Run only when images files are added or changed](#run-only-when-images-files-are-added-or-changed)
  - [Migrate legacy configuration](#migrate-legacy-configuration)
  - [Links and Resources](#links-and-resources)

## Installation

Create the `.github/workflows/calibreapp-image-actions.yml` file with the following configuration

```yml
name: Compress images
on: pull_request
jobs:
  build:
    name: calibreapp/image-actions
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@master

      - name: Compress Images
        uses: calibreapp/image-actions@master
        with:
          githubToken: ${{ secrets.GITHUB_TOKEN }}
```

_The `GITHUB_TOKEN` secret is [automatically generated by GitHub](https://help.github.com/en/articles/virtual-environments-for-github-actions#github_token-secret). This automatic token is [scoped only to the repository that is currently running the action.](https://help.github.com/en/articles/virtual-environments-for-github-actions#token-permissions)_

## Configuration

By default image actions will compress your images so that they’re smaller, using compression that will leave your assets looking good. If you want to change those defaults, read on.

Previous versions of image-actions used `.github/calibre/image-actions.yml` for configuration. We suggest that you migrate to the newest configuration format by reading the [migration steps](#migration-legacy-configuration) below.

## Image quality settings

However, if you’d like to ignore specific file paths, or change image compression options, read on.

Change the configuration options by adding arguments to the action workflow definition:

```yml
...
- name: Compress Images
  uses: calibreapp/image-actions@master
  with:
    githubToken: ${{ secrets.GITHUB_TOKEN }}
    jpegQuality: "80"
    pngQuality: "80"
    webpQuality: "80"
    ignorePaths: "node_modules/**,build"
    # No spaces allowed
```

If you would like to modify the defaults, update the `.github/workflows/calibreapp-image-actions.yml` file by adding arguments to the action:

- [jpegQuality](http://sharp.pixelplumbing.com/en/stable/api-output/#jpeg): Number, integer 1-100, default 80 stored in a string
- [pngQuality](http://sharp.pixelplumbing.com/en/stable/api-output/#png): Number, integer 1-100, default 80 stored in a string
- [webpQuality](http://sharp.pixelplumbing.com/en/stable/api-output/#webp): Number, integer 1-100, default 80 stored in a string
- `ignorePaths`: a comma separated string with [globbing](https://www.npmjs.com/package/glob) support of paths to ignore when looking for images to compress

## Run only when images files are added or changed

image-actions is designed to run for each Pull Request. In some repositories, images are seldom updated. To run the action only when images have changed, use GitHub Action’s [`on.push.paths`](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions#onpushpull_requestpaths) workflow configuration:

```yml
name: Compress images
on:
  pull_request:
    paths:
      - "**.jpg"
      - "**.png"
      - "**.webp"
jobs:
  build:
    name: calibreapp/image-actions
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@master

      - name: Compress Images
        uses: calibreapp/image-actions@master
        with:
          githubToken: ${{ secrets.GITHUB_TOKEN }}
```

The above workflow will only run on a pull request when `jpg`, `png` or `webp` files are changed.

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
    - name: Compress images
      uses: calibreapp/image-actions@master
      with:
        githubToken: ${{ secrets.GITHUB_TOKEN }}
    ```

- `.github/calibre/image-actions.yml`

    If your repository uses `.github/calibre/image-actions.yml` for configuration, it should be moved into  `.github/workflows/calibreapp-image-actions.yml`. Then delete the `image-actions.yml` file.

    `ignorePaths` is no longer an array and is now a comma separated list. eg: `ignorePaths: "node_modules/**,bin"`

## Links and Resources

- **[Announcement post: Automatically compress images on Pull Requests](https://calibreapp.com/blog/compress-images-in-prs/)**
- [Image Actions on GitHub Marketplace](https://github.com/marketplace/actions/image-actions)
- [sharp](https://github.com/lovell/sharp)
- [mozjpeg](https://github.com/mozilla/mozjpeg)
- [libvips](https://github.com/libvips/libvips)
- [Learn more about GitHub Actions](https://github.com/features/actions)
- [Start monitoring your sites performance](https://calibreapp.com/)
