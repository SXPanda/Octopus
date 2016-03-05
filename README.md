# Octopus.js
A Javascript and HTML5 based game engine

**Octopus.js** is a Javascript based game engine that makes use of HTML5 Canvas.
The purpose of Octopus.js is to provide a flexible, expandable and streamlined multi-platform development environment for developers.
Octopus.js is currently in pre-alpha stages of development.

##Dependencies
Octopus.js requires jQuery to run. Octopus.js should work with any modern version of jQuery (version 1.0+), but this requires further testing. This dependency may be removed in future versions.

##Installation
Download all files in the Octopus folder and include these script tags in your page head:
```	
  <!-- only required if jQuery is not already included -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>
  <!-- load Octopus.js files -->
  <script src="octopus.js"></script>
  <script src="octopus.physics.js"></script>
```
And insert a canvas into the body of your page
```
  <canvas id="octopus"></canvas>
```
This demo code creates an octopus instance on the #octopus canvas, then renders several circles and rects
```
  var octopus;
  $(document).on('ready', function() {
  	octopus = new Octopus.Instance($('#octopus'), {width: '100%', height: '1200'});
  	
  	for (var i = 0; i < 20; ++i) {
  		for (var j = 0; j < 5; ++j) {
  			octopus.methods.addObject(new Octopus.PhysicsCircle(50 + 100 * i, 50 + 100 * j, 20, 'red', 'blue'));
  			octopus.methods.addObject(new Octopus.PhysicsRect(100 + 100 * i, 50 + 100 * j, 20, 20));
  		}
  	}
  	$('#octopus').on('beforeInitialise', function() {
  		console.log('before initialised');
  	});
  	/* Disable gravity and enable physics debug (shows hit boxes) */
  	Physics.gravity.y = 0;
  	Physics.debug = true;
  });
```
##Supported browsers
Octopus.js 0.0.1 has been tested in

- Chrome (48+)
- Firefox
- Edge

Further browser testing will be completed as Octopus nears version 1.0.0
