Connection-Geography UserScript
======

A means to visually represent the distribution of LinkedIn connections, moreover the distribution of “extended” connections (second connections, etc). 

Background
------

Once upon a time, I wrote an application that used LinkedIn's API represent the distribution of LinkedIn connections geographically, with both 1st and 2nd connections. The application made use of vanilla JavaScript, Google Maps JavaScript API, and the LinkedIn PHP API. It worked and, while I still had various plans to improve on it, it accomplished the goal.
<img src="./screenshots/connectgeo_screenshot_20140113.png?raw=true" title="Connection-Geography (original)"  /> 
]

Unforunately, in February 2015 [LinkedIn announced they would be eliminating some of their APIs](https://developer.linkedin.com/blog/posts/2015/developer-program-changes) for general use. There was an option to request permissions which was made and never responded to. In the end, I decided to abandon the project, for a time.

However, still wanting this kind of functionality but not having one, I decided to try and resurrect the project, somehow...

Current Plan of Action
------

 1. ~~Drop all the ancient PHP code~~
 2. ~~Get the project working with more recent version of Google Maps API~~
 3. Workout how to get the LinkedIn connection/people data
   1. **In Progress** 
 4. Rework the project as MVP UserScript, re-using some snippets of the old HTML & JavaScript
 5. Rework the project using actual library vs. vanilla JavaScript
 6. Work on missing features
