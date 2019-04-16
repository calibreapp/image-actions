#!/usr/bin/env bats

load "$BATS_PATH/load.bash"

@test "Without GITHUB_TOKEN prints error" {
  run $PWD/entrypoint.sh

  assert_output --partial "You must enable the GITHUB_TOKEN secret"
  assert_failure
}

@test "Prints compressing images" {
  export GITHUB_TOKEN="123"
  run $PWD/entrypoint.sh

  assert_output --partial "->> Compressing images with guetzli…"
  assert_success
}