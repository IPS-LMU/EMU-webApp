# EMU-webApp

[![Build Status](https://travis-ci.org/IPS-LMU/EMU-webApp.png)](https://travis-ci.org/IPS-LMU/EMU-webApp)
[![Coverage Status](https://img.shields.io/coveralls/IPS-LMU/EMU-webApp.svg)](https://coveralls.io/r/IPS-LMU/EMU-webApp)

## Out of funding

Unfortunately, the EMU-SDMS is currently out of funding.

We at the IPS will do what we can to fix bugs, security issues or necessary adjustments to new versions of R; but we cannot currently work on new features or performance improvements.

We would be very glad if funding in academia allowed for more technical staff to maintain software used by the research community.

## Introduction

The EMU-webApp is an online and offline web application for labeling, visualizing and correcting speech and derived speech data. To get an idea of what it looks like please visit [this URL](http://ips-lmu.github.io/EMU-webApp/). General information about the next iteration of the EMU speech database management system can be found [here](http://ips-lmu.github.io/EMU.html).


## Quick start

Visit [this URL](http://ips-lmu.github.io/EMU-webApp/) and click the `open demo DB` button in the top menu to load one of the three small example databases.

## Tools for development

* install [nodejs and npm](http://nodejs.org/)
* clone this repo with `git clone https://github.com/IPS-LMU/EMU-webApp.git`
* navigate to the freshly cloned repo (the folder is usually named `EMU-webApp`) and install dependencies with the command `npm install`
* run development server `http://localhost:9000`  with `npm run start`
* a small websocket data provider server is provided and can be started like this: `cd exampleServers; node nodeEmuProtocolWsServer.js`.
* navigate to `http://localhost:9000/?autoConnect=true` to have an autoconnecting auto-reloading development version
* alternatively navigate to `http://localhost:9000/?audioGetUrl=http:%2F%2Flocalhost:9000%2FdemoDBs%2Fae%2Fmsajc003.wav&labelGetUrl=http:%2F%2Flocalhost:9000%2FdemoDBs%2Fae%2Fmsajc003_annot.json&labelType=annotJSON` for a version that loads an audio and an annotation file use GET parameters

## Tests
* unit tests: run `npm test` (currently not working)
* end-to-end tests using protractor: run `npm e2e` (currently not working)

## Create and deploy new release

These are the steps necessary to create and deploy a new release on [https://ips-lmu.github.io/EMU-webApp/](https://ips-lmu.github.io/EMU-webApp/) (push privileges to GitHub repo required)

* prerequisite: make sure all unit tests and end-to-end test pass (`npm test` and `npm e2e`)
* prerequisite: also run end-to-end tests on dist build (`npm run build-start` followed by `npm e2e`) & manually inspect the release version (just in case)
* update `NEWS.md` to reflect changes (== changelog)
* update version numbers in `NEWS.md` and `package.json`
* `npm run build-start` also runs `npm run build`s tasks so explicitly calling `npm run build` is unnecessary
* this will have created a new release in the `dist` folder in the root directory of this repo
* change `<base href="/">` entry in `dist/index.html` to `<base href="/EMU-webApp/">` 
* add, commit and push changes made to repo by build process to GitHub: `git commit` (make sure all files are added) followed by `git push origin master`
* deploy the `dist` directory by running the subtree push command: `git subtree push --prefix dist origin gh-pages` from the root directory of this repo (see [http://yeoman.io/learning/deployment.html](http://yeoman.io/learning/deployment.html) for further details)
* create new release on GitHub


## Main authors

**Raphael Winkelmann**

+ [github](http://github.com/raphywink)

**Georg Raess**
        
+ [github](http://github.com/georgraess)

**Markus Jochim**

+ [github](http://github.com/MJochim)

**Affiliations**

[INSTITUTE OF PHONETICS AND SPEECH PROCESSING](http://www.en.phonetik.uni-muenchen.de/)
