# Image actions

Image actions will automatically compress jpeg and png images in GitHub Pull Requests.

- **Compression is fast, efficient and lossless**
- Uses mozjpeg + libvips, the best image compression available
- Runs in GitHub Actions **for free**

![Preview of image-actions pull request comment](https://user-images.githubusercontent.com/924/62024579-e1470d00-b218-11e9-8655-693ea42ba0f7.png)

## How to add this to your repository:

- Add the following steps to a workflow file found at: `.github/workflows/pull-request.yml` (If you don’t have one, create it.)
- Paste in the following:

```yml
name: Compress images
on: pull_request
jobs:
  build:
    name: calibreapp/image-actions
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - name: calibreapp/image-actions
        uses: calibreapp/image-actions@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

This action requires a `GITHUB_TOKEN` so that it has access to commit the optimised images to your repository.

## Links and resources

- [View calibre/image-actions on the GitHub Marketplace](https://github.com/marketplace/actions/image-actions)
- [Mozjpeg](https://github.com/mozilla/mozjpeg)
