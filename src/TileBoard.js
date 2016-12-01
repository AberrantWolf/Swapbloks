import ui.View;
import ui.TextView;
import animate;

import src.SwapTile as SwapTile;

const kSwapThreshhold = 20;

exports = Class(ui.View, function(supr) {
	this.init = function(opts, cols, rows) {
		//opts = merge(opts, {
		//	//... no opts at the moment
		//});

		// Assume that the x/y and width/height are supplied
		// by the object creating this; otherwise it SHOULD
		// default to the full size of the parent view.
		supr(this, 'init', [opts]);

		const width = opts.width;
		const height = opts.height;

		const tileWidth = width / cols;
		const tileHeight = height / rows;

		// Calculate keeping the tiles square
		const tileSize = tileWidth < tileHeight ? tileWidth : tileHeight;

		// Calculate an offset so tiles are centered in the space
		const yOffset = (height - (rows * tileSize)) * 0.5;
		const xOffset = (width - (cols * tileSize)) * 0.5;

		this._canInteract = false;
		this._matchSet = [];

		this._gameScreen = opts.superview;

		this._rows = rows;
		this._cols = cols;

		this._tiles = [];

		for(let i=0; i<cols; i++) {
			this._tiles[i] = [];
			for(let j=0; j<rows; j++) {
				const theTile = new SwapTile({
					superview: this,
					x: i * tileSize + xOffset,
					y: j * tileSize + yOffset,
					width: tileSize,
					height: tileSize
				}, (i+j)%2); // Even/odd tile background

				this._tiles[i][j] = theTile;
				theTile.on('InputStart', bind(this, function(event, point) {
					this.registerTouch(theTile, point, i, j);
				}));

				// InputOut documentation is unclear, so commenting this out for
				// now and switching to a more by-hand approach.
				// theTile.on('InputOut', bind(this, function(over, overCount, atTarget) {
				// 	if(this._hasTouch) {
				// 		console.log("Drag out: " + over + ", " + atTarget);
				// 		this.dragOut(theTile, atTarget);
				// 	}
				// }));

				// Note: views which did not receive the InputStart can still
				// receive InputSelect, which is an irregular way to handle it,
				// assuming that 'InputSelect' implies a tap or click.
				// Typically the tap/click input can only occur when the object
				// released is the same object that started the command.
				// Starting on one view and sending a release to another view
				// is a confusing user experience and can be frustrating to
				// program around.

				// You could use InputOver on another tile to try swapping them
				// but I don't want to deal with the edge case of dragging off
				// the edge of an edge tile and then coming on too far over
				// and hitting a non-connecting tile and trying to swap there;
				// theTile.on('InputOver', bind(this, function(evt, point) {
				// 	if (this._hasTouchedTile) {
				// 		// I can try to swap here
				// 		this._hasTouchedTile = false;
				//		this.trySwapGems(this._lastTouchedTile, theTile);
				// 	}
				// }));

				// InputOut doesn't seem to give me enough information to use it as
				// the means of determining if the user is trying to drag a tile. I need
				// to know where the point is that the drag left in order to figure out
				// which direction they're trying to drag. 'over', 'overCount', and
				// 'atTarget' don't seem to give me useful bits of information and the
				// docs don't explain them... like at all.
				// theTile.on('InputOut', bind(this, function(over, overCount, atTarget) {
				// 	this._hasTouchedTile = false;
				// 	console.log(atTarget);
				// }
			}
		}

		// Listen for move events on the core view, and when they're
		// significant enough, try a swap. Listen on the main view
		// because it seems that 'InputMove' wouldn't be sent to a tile
		// unless it's OVER that tile.
		//
		// Checking here is okay in the edge case because tiles on the
		// edge can't be swapped outside the board; if we wanted that
		// we would have to make the bounds large enough and inset the
		// tiles to register; or put this listener up another level.
		//
		// Technically it's still possible (on computer, at least) to
		// move the cursor so fast away from the view that it's not even
		// on the virtual device any more and cannot register moves, and
		// maybe bring it back too far away, but that should still be
		// handled gracefully but the swap logic.
		this.on('InputMove', bind(this, function(evt, point) {
			if (this._hasTouchedTile) {
				this.handleMove(evt, point);
			}
		}));

		this.on('InputOut', bind(this, function(over, overCount, atTarget) {
			// input is either off the view or released/ended
			if(this._hasTouchedTile) {
				this._hasTouchedTile = false;
			}
		}));
	}

	this.registerTouch = function(whichTile, point, xIdx, yIdx) {
		this._hasTouchedTile = true;
		this._lastTouchedTile = whichTile;
		this._lastTouchStartPoint = point;
		this._lastTouchIdx = {x:xIdx, y:yIdx}
	}

	this.handleMove = function(evt, point) {
		const aX = this._lastTouchStartPoint.x;
		const aY = this._lastTouchStartPoint.y;

		const tilePos = this._lastTouchedTile.getPosition(this);
		const tileX = tilePos.x;
		const tileY = tilePos.y;
		//const localPoint = this._lastTouchedTile.localizePoint(point);
		const bX = point.x - tileX;
		const bY = point.y - tileY;

		// I could check for actual length of the drag,
		// but that might result in extra processing on diagonals,
		// so just checking for x/y relative offset is fine
		const dX = bX - aX;
		const dY = bY - aY;

		let shouldSwap = false;
		let swapX = this._lastTouchIdx.x;
		let swapY = this._lastTouchIdx.y;

		if(dX < -kSwapThreshhold) { //console.log("Try swap left");
			this._hasTouchedTile = false;
			swapX = this._lastTouchIdx.x - 1;
			if (swapX >= 0) {
				shouldSwap = true;
			}
		} else if(dY < -kSwapThreshhold) { //console.log("Try swap up");
			this._hasTouchedTile = false;
			swapY = this._lastTouchIdx.y - 1;
			if (swapY >= 0) {
				shouldSwap = true;
			}
		} else if(dX > kSwapThreshhold) { //console.log("Try swap right");
			this._hasTouchedTile = false;
			swapX = this._lastTouchIdx.x + 1;
			if (swapX < this._cols) {
				shouldSwap = true;
			}
		} else if(dY > kSwapThreshhold) { //console.log("Try swap down");
			this._hasTouchedTile = false;
			swapY = this._lastTouchIdx.y + 1;
			if (swapY < this._rows) {
				shouldSwap = true;
			}
		}

		// If we had variable tiles with empty or non-swappable gems, we
		// would have to perform that extra logic here to possibly stop
		// the swap from actually occuring.

		// Actually do the swap, since it should be valid
		if(shouldSwap) {
			this.trySwapGems(this._lastTouchedTile, this._tiles[swapX][swapY]);
		}
	}

	this.tick = function(dt) {
		if (this._isSettled) {
			return;
		}

		if (this.checkSettled()) {
			this._isSettled = true;
			console.log("board is settled");

			for (let idx in this._matchSet) {
				//console.log("matched: ", this._matchSet[idx]);
				this._matchSet[idx].gem.hide();
				// Spawn particles here for each tile to make it
				// exciting
			}

			const count = this._matchSet.length;
			const multiplier = 0.25 + 0.25 * count;
			const points = Math.floor(25 * count * multiplier);
			this._gameScreen.addPoints(points);

			if (this._matchSet.length > 0) {
				this.fallGems();
			}

			this._matchSet = this.getMatches();
		}
	}

	// Helper functions -- should add some bounds checking in here, but
	// the code I'm using for now isn't dangerous and will never call
	// these on invalid bounds; but in larger production code I would
	// for sure add some bounds verification here as well as checks
	// against empty blocks and such.
	this.registerMatchH = function(xStart, yStart, len, result) {
		if (len >= 3) {
			// capture the previous tiles
			for (let ctr=1; ctr<=len; ctr++) {
				result.push(this._tiles[xStart-ctr][yStart]);
			}
		}
	}

	this.registerMatchV = function(xStart, yStart, len, result) {
		if (len >= 3) {
			// capture the previous tiles
			for (let ctr=1; ctr<=len; ctr++) {
				result.push(this._tiles[xStart][yStart-ctr]);
			}
		}
	}

	// Search the board and locate all matches, returning relevant tiles in
	// an array. There are many ways this could be done depending on the goals
	// of the system; but for simplicity I'm just adding all tiles involved in
	// matches as though they're equal. This has the benefit/drawback of
	// counting tiles once for each matche they're a part of. You could check
	// for tiles already being selected, and depending on your design goals
	// that might be wirth the extra effort. In my case, I use it as a way to
	// ramp up the score multiplier for cross-matches and junk.
	this.getMatches = function() {
		// I'm doing this in two passes -- again, other ways you could
		// break this one down. Two passes fast and easy to guarantee
		// you don't miss any matches, I think.

		let result = [];

		let workingGemID = -1;
		let matchLength = 0;
		// Check for horizontal matches, meaning that the slow/outer loop
		// should be rows
		for (let j=0; j<this._rows; j++) {
			workingGemID = -1;
			matchLength = 0;

			for (let i=0; i<this._cols; i++) {
				const currentGemID = this._tiles[i][j].gem.gemID;
				if (currentGemID !== workingGemID) {
					this.registerMatchH(i, j, matchLength, result);

					matchLength = 1;
					workingGemID = currentGemID;
				} else {
					matchLength++;
				}
			}

			// If there was a match by the end of the last loop, 
			this.registerMatchH(this._cols, j, matchLength, result);
		}

		// Having nearly the same code three times in a row tells me
		// it's a good candidate for pulling out into a function.
		this.registerMatchH(this._cols, this._rows-1, matchLength, result);

		//
		// Now check again for vertical matches
		//
		for (let i=0; i<this._cols; i++) {
			workingGemID = -1;
			matchLength = 0;

			for (let j=0; j<this._rows; j++) {
				const currentGemID = this._tiles[i][j].gem.gemID;
				if (currentGemID !== workingGemID) {
					this.registerMatchV(i, j, matchLength, result);

					matchLength = 1;
					workingGemID = currentGemID;
				} else {
					matchLength++;
				}
			}

			// If there was a match by the end of the last loop, 
			this.registerMatchV(i, this._rows, matchLength, result);
		}

		// Having nearly the same code three times in a row tells me
		// it's a good candidate for pulling out into a function.
		this.registerMatchV(this._cols-1, this._rows, matchLength, result);

		return result;
	}

	this.checkSettled = function() {
		let result = true;

		for(let x=0; x<this._cols; x++) {
			for(let y=0; y<this._rows; y++) {
				if (this._tiles[x][y].gem.animator.hasFrames()) {
					result = false;
				}
			}
		}

		return result;
	}

	// Returns the lowest tile which holds a gem.
	// If the top of the board is reached and no gem exists, randomly
	// generate a new one and still return the tile.
	this.getGemTileFromAbove = function(i, j) {
		//console.log("trying to get gem from", i, j);
		const myTile = this._tiles[i][j];

		if (myTile.gem.style.visible) {
			return myTile;
		}

		if (j===0) {
			// At the top, generate a new gem and return the tile
			myTile.generateGem();
			return myTile;
		} else {
			return this.getGemTileFromAbove(i, j-1);
		}
	}

	this.fallGems = function() {
		// Go through eah column from the bottom and see if it's empty;
		// if so, give it the gem from above.
		for(let i=0; i<this._cols; i++) {
			// Count down from the highest, which is the bottom
			// We want things moving down
			for(let j=this._rows-1; j>=0; j--) {
				//console.log(this._tiles[i][j]);
				if (this._tiles[i][j].gem.style.visible) {
					// skip visible gems
					continue;
				}
				
				this._isSettled = false;

				// try to grab one from above
				const baseTile = this._tiles[i][j];
				const gemTileInfo = this.getGemTileFromAbove(i, j);
				if (gemTileInfo !== baseTile) {
					this.instantSwapGems(gemTileInfo, baseTile);
					this.animateRetroactiveSwap(gemTileInfo, baseTile);
				} else {
					this.animateReturnTile(gemTileInfo);
				}
			}
		}

		// If at the top and still empty, generate one
	}

	this.instantSwapGems = function(tileA, tileB) {
		const gemA = tileA.gem;
		const gemB = tileB.gem;

		tileA.removeSubview(tileA.gem);
		tileB.removeSubview(tileB.gem);
		tileA.addSubview(gemB);
		tileA.gem = gemB;
		tileB.addSubview(gemA);
		tileB.gem = gemA;
		console.log("logical swap done")
	};

	this.offsetAndReturnTileGem = function(tile, x, y, time) {
		tile.gem.style.x = x;
		tile.gem.style.y = y;
		tile.gem.animator.then({x:0, y:0}, time);
	}

	this.animateReturnTile = function(tileA) {
		tileA.gem.animator.then({x:0, y:0}, 300);
	}

	this.animateRetroactiveSwap = function(tileA, tileB) {
		const deltaAtoBX = tileB.style.x - tileA.style.x;
		const deltaAtoBY = tileB.style.y - tileA.style.y;

		this.offsetAndReturnTileGem(tileA, deltaAtoBX, deltaAtoBY, 300);
		this.offsetAndReturnTileGem(tileB, -deltaAtoBX, -deltaAtoBY, 300);
	}

	this.animateNormalGemSwap = function(tileA, tileB) {
		const deltaAtoBX = tileB.style.x - tileA.style.x;
		const deltaAtoBY = tileB.style.y - tileA.style.y;

		tileA.gem.animator.then({x:deltaAtoBX, y:deltaAtoBY}, 300);
		tileB.gem.animator.then({x:-deltaAtoBX, y:-deltaAtoBY}, 300);
	}

	this.queueAnimatedSwap = function(tileA, tileB) {
		tileA.gem.animator.then(bind(this, function() {
			this.animatedSwapGems(tileA, tileB);
		}));
	}

	this.trySwapGems = function(tileA, tileB) {
		this._isSettled = false;

		this.instantSwapGems(tileA, tileB);

		// Determine if there are any matches
		const matchedTiles = this.getMatches();
		this._matchSet = matchedTiles;

		if (matchedTiles.length > 0) {
			this.animateRetroactiveSwap(tileA, tileB);
		} else {
			// Otherwise return the tiles to where they belong
			this.instantSwapGems(tileA, tileB);
			this.animateNormalGemSwap(tileA, tileB);
			this.animateReturnTile(tileA);
			this.animateReturnTile(tileB);
		}
	}
});
