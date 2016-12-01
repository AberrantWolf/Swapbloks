import device;
import ui.StackView as StackView;
import ui.TextView as TextView;
import ui.View;
import ui.ImageView;

import src.StartScreen as StartScreen;
import src.GameScreen as GameScreen;

exports = Class(GC.Application, function () {

	this.initUI = function () {
		// Get the actual virtual screen width for this device
		// This would have to be made more robust to support landscape
		const screenWidth = 320 * ((device.width / device.height) / (320/480));
		const screenHeight = 480; // height of virtual screen is constant

		// Create a base stackview for everything
		const rootView = new StackView({
			superview: this,
			x: 0,
			y: 0,
			width: screenWidth,
			height: screenHeight,
			clip: true,
			scale: device.height / screenHeight	// scale viewport based on height
		});

		// Create the start screen
		const startScreen = new StartScreen({}, screenWidth);
		const gameScreen = new GameScreen({}, screenWidth, screenHeight);

		// Push the start screen as the active view
		rootView.push(startScreen);

		// Catch events from the game views
		startScreen.on('startScreen:start', function() {
			rootView.push(gameScreen);
		});
	};

	this.launchUI = function () {};

});
