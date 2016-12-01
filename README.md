# Swapbloks
===========================

A project build for GameClosure, a Javascript-based game engine.

The project is a simple tle swapping game. Note that it's a beginning, not a full production-ready game yet. It was meant to be an 8-hour project, but ended up being closer to 15 hours due to a mixture of difficulties getting the sample project running (which I never did manage due to problems injecting resources during the 'init' command), difficulties getting required information from the docs, classes not acting the way I expected they would, and programming too late at night to wrangle complex function calls and scope issues in Javascript.

Modern Javascript (ECMA 6) was used for at least the 'let' and 'const' keywords to help with scope issues, as well as to keep the code cleaner.

## Known Bugs

* There are some timing issues with blocks falling -- the board doesn't come to rest quickly enough sometimes
* The user can engage in input on the board when it's meant to be locked from input (during animation, while _isStable is false)
* There are no checks to prevent board states where no matches are possible (could also detect this state and re-generate all gems)
* An initial step to clear existing matches from the board would be necessary in a final product; initial matches are left alone and counted on your first swap currently, which is incorrect.
* There is no end-game condition -- this is an endless, zen-style mode at the moment.
* There is no button to pop the user back to the main screen.
* There is no tap-to-swap mode; you have to drag

## Notes

* The gems should be re-generated each time the user presses start; keeping the board in memory is fine, though, and avoids memory leaks
* Better/smoother timing for gems falling would become necessary for a finished product
* The game needs particles to make it really punch. I opted to have nicer animations rather than crazy particle systems
* There are comments throughout the code (particularly in the TileBoard.js file) describing alternative ways that a problem could have been tackled, and also strange engine things I encountered during the development. Notably:
  * Some minor input issues dodn't seem to function as one might expect based on other game engines/frameworks
  * Scaling image views whose images are sub-images from a larger tile map seems to have significant problems and I had to ultimately cut up my image map into separate pieces to get it to draw properly.
  * The arguments supplied to InputOver and various of the Inout* events are fairly poorly documented, and they appear to not give some useful data that I would expect from such systems.