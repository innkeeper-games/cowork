# Cowork: Open-source gamified study halls

Cowork is a virtual, accessible online space designed to emulate a coworking environment. The software is a two-paneled website. The left-side panel includes a current tab (a list of tasks, a chat board, a timer, a productivity statistics viewer, or a settings editor). The right-side panel is a top-down view of a virtual workspace, with avatars representing online members of the space.  Users can chat with each other, set timers to work simultaneously, share their tasks with each other, and generally work in the same online environment. The application is designed to be accessible, with particular focus on keyboard-only navigation and screen-reader use.

## Installation

This repository contains the Angular client for Cowork. Right now, to get up and running, it's best to host the client locally during testing. To do so,

1. Clone this repository.
2. Run `npm install` in the repository to install dependencies.
3. Install the [Angular CLI](https://angular.io/cli).
4. Serve the client using `ng serve`.

To get the server up and running, you will need to clone two repositories: the [authentication server repository](https://github.com/innkeeper-games/cowork-auth-server) and the [main server repository](https://github.com/innkeeper-games/cowork-server). Then,

1. In each local repository, run `pip install` to install dependencies.
2. If you desire email functionality, configure the appropriate OS environment variables for SendGrid.
3. In `server.py` in each repository, replace "joincowork.com" with your domain name or address.
4. Acquire an HTTPS certificate, and place the certificate in the directories of each repository.
5. Run each server using `python server.py`.
