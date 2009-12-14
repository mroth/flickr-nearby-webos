var gLat = '';
var gLong = '';

function MainAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

MainAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	// a local object for button model
    this.goButtonModel = {
        buttonLabel : 'Show me photos!',
        buttonClass : 'primary',
        disabled : true
    };
    this.controller.setupWidget("goButton", this.buttonAttributes, this.goButtonModel);
    this.controller.listen('goButton', Mojo.Event.tap, this.handleGoButton.bindAsEventListener(this));
    
    // Setup spinner for updates 
    this.gpsSpinnerModel = {
         spinning: true 
    }
    this.controller.setupWidget('gpsSpinner',
         this.attributes = {
             spinnerSize: 'small'
         },
         this.gpsSpinnerModel
    );
    
    //  Setup up the WebView widget for map
    this.mapURL = '';
    this.controller.setupWidget('mapWeb', 
      { 
        //url: this.mapURL,
        virtualpagewidth: 320,
        virtualpageheight: 160
      }, 
      this.mapViewModel = { }
    ); 
                
    
    
	/* add event handlers to listen to events from widgets */
	
	this.controller.serviceRequest('palm://com.palm.location', {
           method:"getCurrentPosition",
           parameters:{},
           onSuccess: this.locationSuccess.bind(this),
           onFailure: this.locationSuccess.bind(this)
    });

}

MainAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


MainAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

MainAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}

MainAssistant.prototype.locationSuccess = function(response) {
    Mojo.Log.info("success");
    if (response.errorCode != 0) {
        reason = '';
        switch (response.errorCode) {
          case 1:
            reason = 'I timed out trying to get your location.';
            break;
          case 2:
            reason = 'Your position was unvailable to me.';
            break;         
          case 3:
            reason = 'I had an unknown error attempting to get your location.';
            break;
          case 4:
            reason = 'I got a GPS PERMANENT ERROR which sounds bad but really I have no idea.';
            break;
          case 5:
            reason = 'You have location services turned off.  Go turn them back on.';
            break;
          case 6:
            reason = 'Dude, you haven\'t agreed to the GPS terms of service yet.  Go do that and then come back.';
            break;
          case 'ErrorLocationServicePermissionDenied':
            reason = 'Dude, you haven\'t agreed to the GPS terms of service yet (AND if we\'re triggering this Palm\'s SDK docs lied about the error codes).  Go do that and then come back.';
            break;
          default:
            reason = 'Something happened that is a total mystery to me.';        
        }
        $('statuszzz').innerHTML = "BONK. " + reason + " So sorry!  Reload me to try again? <p><small>error code: " + response.errorCode;
    } else {
        gLat = response.latitude;
        gLong = response.longitude;
        var coords = gLat + "," + gLong;

        $('statuszzz').innerHTML = "Sweet! Your location is:<br/> <small>" + coords + "</small>";
        this.goButtonModel.disabled = false;
        this.controller.modelChanged(this.goButtonModel, this);
        
        $('gpsSpinner').mojo.stop();
        //dunno why the above doesnt work... oh it does when I add the mojo!
        // this.gpsSpinnerModel.spinning = false;
        // this.controller.modelChanged(this.gpsSpinnerModel, this);
        
        //$('mapWeb').mojo.openURL( 'http://maps.google.com/staticmap?zoom=15&maptype=mobile&center='+coords+'&zoom=12&size=320x260&key=ABQIAAAA7qHLcz-trbvSLxLH3VARExRe7lPlJ_z8GOiVVV9HJeEDumhwHxRTs7PMzBohaWKZqT4EjyWHlRWSsg&sensor=true' );
        var mw = this.controller.get('mapWeb');
        mw.mojo.openURL( 'http://maps.google.com/staticmap?zoom=15&maptype=hybrid&center='+coords+'&zoom=12&size=320x160&key=ABQIAAAA7qHLcz-trbvSLxLH3VARExRe7lPlJ_z8GOiVVV9HJeEDumhwHxRTs7PMzBohaWKZqT4EjyWHlRWSsg&sensor=true' );
        
    }

    
}
MainAssistant.prototype.locationFailure = function(response) {
    Mojo.Log.info("failure");
    Mojo.Controller.errorDialog("failure!");
}
MainAssistant.prototype.handleGoButton = function(event) {
    Mojo.Log.info("user clicked button");
    
    //http://m.backstage.flickr.com/nearby/37.756474,-122.421228/
    this.controller.serviceRequest('palm://com.palm.applicationManager', {
           method: 'open',
           parameters: {
               id: 'com.palm.app.browser',
               params: {
                   target: 'http://m.flickr.com/nearby/' + gLat + "," + gLong //this.storyFeed.stories[this.storyIndex].url
               }
           }
    });
}
