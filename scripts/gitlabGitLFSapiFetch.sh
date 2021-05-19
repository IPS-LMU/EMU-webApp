#!/usr/bin/env bash

PROJECT="raphywink/ae_emuDB" # your-company/or-repo/whatever
FILEPATH="0000_ses/msajc003_bndl/msajc003.wav" # foo/bar.tar.gz
BRANCH="master" # branch
GITLAB_TOKEN="HgtKni3owyuYQDcq1ySL" # this isn't valid any more

# get LFS file info
# raphywink/ae_emuDB.git
IFS=$'\n' LFS_OBJECT_INFO=($(curl -fsSL -H "PRIVATE-TOKEN: ${GITLAB_TOKEN}" "https://gitlab.lrz.de/api/v4/projects/${PROJECT//\//%2F}/repository/files/${FILEPATH//\//%2F}/raw?ref=${BRANCH}" -o -))
OID="$(echo "${LFS_OBJECT_INFO[@]}" | grep -oP "oid sha256:\K[^\s]+")"
SIZE="$(echo "${LFS_OBJECT_INFO[@]}" | grep -oP "size \K[^\s]+")"
# request actions for given lfs objects
LFS_OBJECT_REQUEST_JSON="$(jq -rnc --arg oid $OID --arg size $SIZE --arg ref "refs/heads/$BRANCH" '{"operation":"download","objects":[{"oid":$oid,"size":$size}],"transfers":["lfs-standalone-file","basic"],"ref":{"name": $ref }}')"
LFS_OBJECT_ACTION_DOWNLOAD="$(set -o pipefail; curl -sSlf -H "Content-Type: application/json" -X POST -d "$LFS_OBJECT_REQUEST_JSON" "https://oauth2:${GITLAB_TOKEN}@gitlab.lrz.de/${PROJECT}.git/info/lfs/objects/batch" | jq -er '.objects[0].actions.download')"
AUTH="$(echo "$LFS_OBJECT_ACTION_DOWNLOAD" | jq -er '.header.Authorization')"
DOWNLOAD_URL="$(echo "$LFS_OBJECT_ACTION_DOWNLOAD" | jq -er '.href')"
mkdir -p "${FILEPATH%%/*}"
curl -H "Authorization: ${AUTH}" "${DOWNLOAD_URL}" -o "${FILEPATH}"

http://localhost:9000/?autoConnect=true&comMode=GITLAB&gitlabURL=https:%2F%2Fgitlab.lrz.de&projectID=45415&emuDBname=ae&bundleListName=raphael.winkelmann&privateToken=HgtKni3owyuYQDcq1ySL&useLFS=true