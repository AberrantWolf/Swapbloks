import device;
import ui.View;
import ui.ImageView;
import ui.TextView;
import ui.resource.Image as Image;

// Preload resources and variables
let bgImg = new Image({url: "resources/images/fortress.png"});

exports = Class(ui.View, function(supr) {
	this.init = function (opts, screenWidth) {
		// Stup options go first
		opts = merge(opts, {
			x: 0,
			y: 0,
			backgroundColor: "#222222"
		});

		// Then call the super init function with said options
		supr(this, 'init', [opts]);

		// To create sub-ImageViews, it seems you need to have
		// the image pre-loaded as above; otherwise it can't determine
		// the width and height and they default to NaN. :\

		// Calculate the image scale; would normally take into account
		// device orientation here; but for now assuming vertical
		const imgScale = 480 / bgImg.getHeight();

		// I want the right-hand side of this image showing, not the left
		const xOffs = -(bgImg.getWidth() * imgScale - screenWidth);

		// Background image
		this._bgImageView = new ui.ImageView({
			superview: this,
			image: bgImg,
			x: xOffs,
			width: bgImg.getWidth(),
			height: bgImg.getHeight(),
			scale: imgScale
		});

		// Title views
		this._titleText = new ui.TextView({
			superview: this,
			text: "Swapbloks",
			x: 0,
			y: 25,
			width: screenWidth,
			height: 55,
			color: "black",
			zIndex: 2
		});

		this._tempColorBox = new ui.View({
			superview: this,
			x: 0,
			y: 25,
			width: screenWidth,
			height: 65,
			backgroundColor: "#AAAAAA",
			zIndex: 1
		});

		// Start button
		const startX = 32;
		const startWidth = screenWidth - 64;
		const startY = 250;
		const startHeight = 65;
		this._startButton = new ui.TextView({
			superview: this,
			x: startX,
			y: startY,
			width: startWidth,
			height: startHeight,
			color: "white",
			text: "Start",
			zIndex: 2
		});

		this._startBackground = new ui.View({
			superview: this,
			x: startX,
			y: startY,
			width: startWidth,
			height: startHeight + 12,
			backgroundColor: "#000000",
			zIndex: 1
		});

		// And finally callbacks
		this._startButton.on('InputSelect', bind(this, function() {
			console.log("Start button pressed");
			this.emit('startScreen:start');
		}));
	}
});
