#!/bin/sh
docker run --rm -it -v $(pwd)/.deno:/deno-dir/ -v $(pwd):/app -w /app denoland/deno "$@"
