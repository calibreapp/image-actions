FROM ubuntu:cosmic

ARG MOZJPEG_VERSION=3.3.1
ARG VIPS_VERSION=8.7.2

ARG MOZJPEG_URL=https://github.com/mozilla/mozjpeg/archive
ARG VIPS_URL=https://github.com/libvips/libvips/releases/download

# mozjpeg installs to /opt/mozjpeg ... we need that on PKG_CONFIG_PATH so
# that libvips configure can find it
ENV PKG_CONFIG_PATH /opt/mozjpeg/lib64/pkgconfig

# libvips installs to /usr/local by default .. /usr/local/bin is on the
# default path in ubuntu, but /usr/local/lib is not
ENV LD_LIBRARY_PATH /usr/local/lib

# basic build tools
RUN apt-get update \
  && apt-get install -y \
  build-essential \
  autoconf \
  automake \
  libtool \
  nasm \
  unzip \
  wget \
  git \
  pkg-config \
  curlb \
  libjpeg8 \
  libglib2.0-dev \
  libexpat-dev \
  libpng-dev \
  libgif-dev \
  libexif-dev \
  liblcms2-dev \
  liborc-dev \
  libvips \
  && curl -sL https://deb.nodesource.com/setup_11.x | bash - \
  && apt-get install -y nodejs \
  && apt-get clean && rm -rf /var/lib/apt/lists/* 

RUN mkdir -p /usr/local/src/image-actions
WORKDIR /usr/local/src/image-actions

COPY package.json package-lock.json /usr/local/src/image-actions/
RUN npm ci

# copy in src
COPY LICENSE README.md entrypoint.js /usr/local/src/image-actions/
COPY src/ /usr/local/src/image-actions/src/
COPY __tests__/ /usr/local/src/image-actions/__tests__/

ENTRYPOINT ["/usr/local/src/image-actions/entrypoint.js"]