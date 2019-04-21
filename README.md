Connection-Geography JS
======

A means to visually represent the distribution of LinkedIn connections.

Background
------

Back in 2014-2015, I wrote an application that used LinkedIn's API represent the distribution of LinkedIn connections geographically, with both 1st and 2nd connections. The application made use of vanilla JavaScript, Google Maps JavaScript API, and the LinkedIn PHP API. It worked and, while I still had various plans to improve on it, it accomplished the goal.
<img src="./screenshots/connectgeo_screenshot_20140113.png?raw=true" title="Connection-Geography (original)"  />

Unforunately, in February 2015 [LinkedIn announced they would be eliminating some of their APIs](https://developer.linkedin.com/blog/posts/2015/developer-program-changes) for general use. There was an option to request permissions which was made but never responded to. In the end, I decided to abandon the project, for a time.

However, still wanting this kind of functionality but not having one, I decided to try and resurrect the project, somehow...

Requirments
------

As of writing, script is still in early development. In order to use it requires:
 - LinkedIn account
 - Google Maps API key (with Maps and Places API enabled)
 - Firefox + UserScript agent (currently using [ViolentMonkey](https://violentmonkey.github.io/))
 - Override the Content Security Policy to allow Google Maps + script source (see: [GoogleMapsEverywhereCsp](https://github.com/iamovrhere/GoogleMapsEverywhereCsp))

Current Plan of Action
------

 [x] ~~Drop all the ancient PHP code~~
 [x] ~~Get the project working with more recent version of Google Maps API~~
 [ ] *Workout how to get the LinkedIn connection/people data*
  * **Partially complete**

 [x] *Workout how to get Google Maps loading in LinkedIn DOM despite CSP.*
   *  **Requires CSP override** (see: [GoogleMapsEverywhereCsp](https://github.com/iamovrhere/GoogleMapsEverywhereCsp))

 [ ] Rework the project as MVP UserScript/Plugin, re-using some snippets of the old HTML & JavaScript
  * **May need to rework into Plugin due to CSP issues**

 [ ] Clean up TODO's
 [ ] Refactor and modernize ancient 2014 code.
 [ ] Rework the project using actual library vs. vanilla JavaScript
 [ ] Convert CSS to more flexable SASS
 [ ] Detail the setup of this script + dependencies
 [ ] Work on missing features
