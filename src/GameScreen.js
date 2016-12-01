import ui.View;
import ui.ImageView;
import ui.TextView;

import src.TileBoard as TileBoard;

exports = Class(ui.View, function(supr) {
	this.init = function(opts, screenWidth, screenHeight) {
		opts = merge(opts, {
			backgroundColor: "#444444"
		});

		supr(this, 'init', [opts]);

		this._score = 0;

		this.tileBoard = new TileBoard({
			superview: this,
			x: 0,
			y: 0,
			width: screenWidth,
			height: screenHeight - 64,
			clip: true
		}, 5, 8);

		this.scoreView = new ui.TextView({
			superview: this,
			text: "score",
			x: 0,
			y: screenHeight - 64,
			width: screenWidth,
			height: 64,
			color: "white"
		});

		this.addPoints(0);
	}

	this.addPoints = function(points) {
		this._score += Math.floor(points);
		this.scoreView.setText(this._score);
	}
});
