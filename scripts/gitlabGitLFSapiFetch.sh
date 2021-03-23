#!/usr/bin/env bash

PROJECT="${1}" # your-company/or-repo/whatever
FILEPATH="${2}" # foo/bar.tar.gz
BRANCH="${3:-master}" # branch

# get LFS file info
IFS=$'\n' LFS_OBJECT_INFO=($(curl -fsSL -H "PRIVATE-TOKEN: ${GITLAB_TOKEN}" "https://gitlab.com/api/v4/projects/${PROJECT//\//%2F}/repository/files/${FILEPATH//\//%2F}/raw?ref=${BRANCH}" -o -))
OID="$(echo "${LFS_OBJECT_INFO[@]}" | grep -oP "oid sha256:\K[^\s]+")"
SIZE="$(echo "${LFS_OBJECT_INFO[@]}" | grep -oP "size \K[^\s]+")"
# request actions for given lfs objects
LFS_OBJECT_REQUEST_JSON="$(jq -rnc --arg oid $OID --arg size $SIZE --arg ref "refs/heads/$BRANCH" '{"operation":"download","objects":[{"oid":$oid,"size":$size}],"transfers":["lfs-standalone-file","basic"],"ref":{"name": $ref }}')"
LFS_OBJECT_ACTION_DOWNLOAD="$(set -o pipefail; curl -sSlf -H "Content-Type: application/json" -X POST -d "$JSON" "https://oauth2:${GITLAB_TOKEN}@gitlab.com/${PROJECT}.git/info/lfs/objects/batch" | jq -er '.objects[0].actions.download')"
AUTH="$(echo "$LFS_OBJECT_ACTION_DOWNLOAD" | jq -er '.header.Authorization')"
DOWNLOAD_URL="$(echo "$LFS_OBJECT_ACTION_DOWNLOAD" | jq -er '.href')"
mkdir -p "${FILEPATH%%/*}"
curl -H "Authorization: ${AUTH}" "${DOWNLOAD_URL}" -o "${FILEPATH}"
