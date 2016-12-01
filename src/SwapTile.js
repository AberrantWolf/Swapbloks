import ui.ImageView;
import ui.ImageScaleView;
import ui.View;
import ui.resource.Image as Image;
import animate;

const bgTiles = [
	new Image({
		url: "resources/images/tiles/black_tile.png"
	}),
	new Image({
		url: "resources/images/tiles/white_tile.png"
	})
];

const tileImages = [
	new Image({url:"resources/images/gems/0.png"}),
	new Image({url:"resources/images/gems/1.png"}),
	new Image({url:"resources/images/gems/2.png"}),
	new Image({url:"resources/images/gems/3.png"}),
	new Image({url:"resources/images/gems/4.png"}),
	new Image({url:"resources/images/gems/5.png"}),
	new Image({url:"resources/images/gems/6.png"}),
	new Image({url:"resources/images/gems/7.png"})
];

// I changed this to a regular View becuase siblings drawn after this
// seem to be draw over this one regardless of their child's zIndex;
// so gems were being clipped by the base tiles even though they were
// theoretically higher in the zIndex.

//exports = Class(ui.ImageScaleView, function(supr) {
exports = Class(ui.View, function(supr) {
	this.init = function(opts, evenOdd, tileID = -1) {
		// Stretch, don't cut off the image
		opts = merge(opts, {
			//autoSize: false,
			//image: bgTiles[evenOdd],
			//scaleMethod: "stretch",
			clip: false
		});

		supr(this, 'init', [opts]);

		this.gem = new ui.ImageView({
			superview: this,
			width: opts.width,	// size is not re-set when image is changed
			height: opts.height, // ergo set size here to match self
			zIndex: 10,
			y:-480
		});

		this.generateGem(tileID);

		this.gem.animator = animate(this.gem);

		// Animate the gem onscreen
		this.gem.animator.wait(500).then({y:0}, 500);
	}

	this.generateGem = function(desiredID=-1) {
		// Randomly assign a tile unless already assigned
		if (desiredID < 0 || desiredID > 7) {
			desiredID = Math.floor(Math.random() * 8);
		}

		this.gem.style.y = -480;
		this.gem.setImage(tileImages[desiredID]);
		this.gem.gemID = desiredID;
		this.gem.show();
	}
});
