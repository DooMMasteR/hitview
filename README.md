# HitView

A simple Websocket-App that shows object states in a table and updates them as they come in
The app is based on ``angular``, ``ng-websockets`` and also uses ``ng-lodash``.

### Inner workings

The app is super simple:

1. it tries to connect to a ws:// server on port 8000
2. on every incoming event it updates the internal list of Targets
3. it displays the targets in a table

The structure:

* the ``HitView`` controller holds the data reference for the table
* the two factories ``Target`` and ``Targets`` keep the data locked and up to date
* the ``WebsocketService`` service creates the websocket connection and executes all the registered callbacks