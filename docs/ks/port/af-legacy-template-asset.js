/*!
 * JavaScript Cookie v2.1.3
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	var registeredInModuleLoader = false;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				return (document.cookie = [
					key, '=', value,
					attributes.expires ? '; expires=' + attributes.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
					attributes.path ? '; path=' + attributes.path : '',
					attributes.domain ? '; domain=' + attributes.domain : '',
					attributes.secure ? '; secure' : ''
				].join(''));
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));

(function ($) {
    $(document).ready(function () {
        //
        //
        // States
        //
        //

        var defaultSchool = "";

        var jqxhr = $.getJSON('https://ks.kunskapsporten.se/91.7ce1d87316989aae27b5f83/12.7ce1d87316989aae27b7b36.json', function() {})
            .done(function(data) {

                defaultSchool = data.defaultSchool;
                $(".ked-navigation .logo a").attr("href", defaultSchool);
                console.log("Förvald skola är satt till " + defaultSchool);
            })
            .fail(function() {
                console.log("error");
            });


        var menuOpenMs = 150;
        var timeoutId;
        var hamburgerWidth = 767;
        var minOpenWidth = 1349;
        var $window = $(window);
        // Keep a reference to logo span for fast lookup of its open/close state
        var logoSpan = $(".ked-navigation .logo span");
        // pin state
        var pinned = sessionStorage.getItem('offcanvas-pinned');
        // if pinned not set set as false instead of null
        if (pinned === null) {
            pinned = false;
            sessionStorage.setItem("offcanvas-pinned", false);
        }
        var openSections = sessionStorage.getItem("offcanvas-openSections");
        if (openSections === null) {
            openSections = [];
        } else {
            openSections = JSON.parse(openSections);
        }

        if(pinned=="false" || pinned==false){
            pinned=false;
        }
        if(pinned=="true" || pinned==true){
            pinned=true;
        }

        var pinIcon;
        //
        //
        // Initialization Code
        //
        //
        (function init() {
            // Prohibit unintentional text select on the main headers
            $(".ked-navigation ul.offcanvas-nav > li > a").css({
                userSelect: 'none'
            }); // Could be done in offcanvas.scss instead!
            // Create and store a reference to, the thumbtack icon (pinning icon)
            pinIcon = $('<i style="color: #fff" class="fas fa-thumbtack"></i>').css({
                position: 'absolute',
                top: 0,
                right: 0,
                padding: "1em",
                opacity: pinned ? 1 : 0,
                cursor: 'pointer',
            }).hover(function () {
                if (logoSpan.css("opacity") == 1) pinIcon.css({
                    opacity: 0.8
                });
            }, function () {
                if (logoSpan.css("opacity") == 1) pinIcon.css({
                    opacity: pinned ? 1 : 0.5
                });
            }).click(function () {
                if (!pinned) {
                    pinMenu();
                } else {
                    unPinMenu();
                }
            });
            // Insert the pinning icon into the menu with position relative to right
            $(".ked-navigation .logo").css({
                position: 'relative',
                top: 0,
                left: 0,
                width: "100%"
            }).append(pinIcon);
            // Define the hover-in and hover-out behavior of the menu
            $(".ked-navigation .sidebar").hover(function () {
                // hover-in:
                if (!timeoutId && !pinned) {
                    timeoutId = window.setTimeout(expandMenu, menuOpenMs);
                }
            }, function () {
                // hover-out:
                if (timeoutId) {
                    window.clearTimeout(timeoutId);
                    timeoutId = null;
                } else if (!pinned) {
                    collapseMenu();
                }
            });
            // If menu is pinned look for previously opened sections and open them

            if (pinned === true) {
                for (var i = 0; i < openSections.length; i++) {
                    var liSelector = ".offcanvas-nav .lvl1:nth-child(" + [openSections[i] + 1] + ")";
                    var selectedItem = $(liSelector);
                    selectedItem.find(".subnav").show();
                    selectedItem.find(".state-indicator").removeClass('fa-caret-down').addClass('fa-caret-up');
                }
            }
            // Define the behavior of expanding/collapsing sub-menus:
            $(".ked-navigation .has-sub-nav").click(function () {
                // Check which nth child was clicked
                var clickedChild = $(this).parent().index();
                // The line below is remarked so that a user may click on a menu item while
                // it is being expanded:
                //if ($(".ked-navigation .logo span").css("opacity") == 1) {
                if ($(this).find(".state-indicator").hasClass("fa-caret-down")) {
                    // Before, we hade slideToggle() above this if-statement. State could then get
                    // out-of-sync. Instead, I've put an explicit slideDown() here and another
                    // slideUp() in the else statement to replace the previous slideToggle.
                    // Add click child number to open sections array
                    openSections.push(clickedChild);
                    $(this).next(".subnav").stop().slideDown(300);
                    $(this).find(".state-indicator").removeClass('fa-caret-down').addClass('fa-caret-up');
                } else {
                    openSections = jQuery.grep(openSections, function (value) {
                        return value != clickedChild;
                    });
                    // Replacement of earlier slideToggle() before if-statement:
                    $(this).next(".subnav").stop().slideUp(300);
                    $(this).find(".state-indicator").removeClass('fa-caret-up').addClass('fa-caret-down');
                }
                sessionStorage.setItem("offcanvas-openSections", JSON.stringify(openSections));
                //}
            });
            // Kept code (don't know the exact functionality):
            $(".selectSize").change(function (event) {
                window.location.replace($(this).val());
            });
            //$(window).resize(removeLink);
            removeLink();
            // If menu was initially pinned (from stored value in sessionStorage), make
            // the menu pinned initially:
            if (pinned == true) {
                pinMenu();
            }

            if(pinned == false) {
                sessionStorage.setItem('offcanvas-pinned', false);
                $(".sv-grid-ksgs12").first().removeClass('pinned'); // So CSS can adjust padding rule accordingly
                $(".ked-navigation .sidebar").css({
                    transition: ''
                });
                pinIcon.css({
                    transform: "none"
                });
                collapseMenu();
            }
        })();
        //
        //
        // Help functions
        //
        //
        /** pinMenu()
         *
         * Makes menu pinned.
         *
         */
        function pinMenu() {
            pinned = true;
            sessionStorage.setItem('offcanvas-pinned', true);
            // Adjust content area padding-left
            $(".sv-grid-ksgs12").first().addClass('pinned'); // So CSS can adjust padding rule accordingly
            // Turn off CSS animation (important on initially pinned page)
            $(".ked-navigation .sidebar").css({
                transition: 'none'
            });
            // Rotate the pinning icon a bit and let it 100% non-transparent:
            pinIcon.css({
                opacity: 1,
                transform: "rotate(35deg) scale(1.1)",
                transformOrigin: '50% 50%'
            });
            // Make menu expanded if not already expanded:
            expandMenu();
        }
        /** pinMenu()
         *
         * Makes menu unpinned.
         *
         */
        function unPinMenu() {
            pinned = false;
            sessionStorage.setItem('offcanvas-pinned', false);
            $(".sv-grid-ksgs12").first().removeClass('pinned'); // So CSS can adjust padding rule accordingly
            $(".ked-navigation .sidebar").css({
                transition: ''
            });
            pinIcon.css({
                transform: "none"
            });
            collapseMenu();
        }
        /** expandMenu()
         *
         * Expands the menu.
         */
        function expandMenu() {
            var windowsize = $window.width();
            if (windowsize < hamburgerWidth) {
                // hamburger menu
                $(".ked-navigation .sidebar").css("height", "100vh");
                $(".sv-grid-ksgs12").first().addClass('hamburger'); // So CSS can adjust padding rule accordingly
                pinIcon.hide(); // Don't support pinning when in hamburger menu yet.
            } else {
                // normal menu
                $(".ked-navigation .sidebar").css("width", "290px");
                $(".sv-grid-ksgs12").first().removeClass('hamburger'); // So CSS can adjust padding rule accordingly
            }
            timeoutId = null;
            if (!pinned) pinIcon.css("opacity", 0.5);
            $(".ked-navigation .logo span").css("opacity", "1");
            $(".ked-navigation .offcanvas-nav li a span").css("opacity", "1");
            $(".ked-navigation .offcanvas-nav li a .state-indicator").css("opacity", "1");
            $(".ked-navigation .search .search-field").css("opacity", "1");
            $(".ked-navigation .offcanvas-nav li a span").css("opacity", "1");
        }
        /** collapseMenu()
         *
         * Un-expands the menu.
         */
        function collapseMenu() {
            var windowsize = $window.width();
            if (windowsize < hamburgerWidth) {
                // hamburger menu
                $(".ked-navigation .sidebar").css("height", "");
            } else {
                // normal menu
                $(".ked-navigation .sidebar").css("width", "");
            }
            pinIcon.css("opacity", 0);
            $(".ked-navigation .logo span").css("opacity", "0");
            $(".ked-navigation .offcanvas-nav li a span").css("opacity", "0");
            $(".ked-navigation .offcanvas-nav li a .state-indicator").css("opacity", "0");
            $(".ked-navigation .search .search-field").css("opacity", "0");
            $(".ked-navigation .offcanvas-nav li a span").css("opacity", "0");
            $(".subnav").stop().hide();
            $(".state-indicator").removeClass('fa-caret-up').addClass('fa-caret-down');
        }
        /** removeLink()
         *
         */
        function removeLink() {
            var windowsize = $window.width();
            if (windowsize < hamburgerWidth) {
                // hamburger menu
                $(".ked-navigation .logo a").removeAttr("href"); //.css("cursor","pointer");
                if (pinned) {
                    $(".ked-navigation .sidebar").css("width", "");
                    // Doing same things as unpinned to handle situation when pinned menu goes into mobile view
                    pinIcon.css("opacity", 0);
                    $(".sv-grid-ksgs12").first().removeClass('pinned'); // So CSS can adjust padding rule accordingly
                    $(".ked-navigation .sidebar").css({
                        transition: ''
                    });
                    pinIcon.css({
                        transform: "none"
                    });
                }
            } else {
                $(".ked-navigation .logo a").attr("href", defaultSchool);
                if (pinned) {
                    $(".ked-navigation .sidebar").css("width", "");
                    // Doing same things as pinned to handle situation when pinned menu goes into desktop view
                    $(".sv-grid-ksgs12").first().addClass('pinned');
                    $(".ked-navigation .sidebar").css({
                        transition: 'none'
                    });
                    pinIcon.css({
                        opacity: 1,
                        transform: "rotate(35deg) scale(1.1)",
                        transformOrigin: '50% 50%'
                    });
                    expandMenu();
                }
            }
        }
        $(window).resize(removeLink);
    });
})(jQuery);

// variables
var debugOn = false;

var writePortlet = "https://ks.kunskapsporten.se/91.569668861590eba0b7fc1bf6/12.569668861590eba0b7fc1cf4.xml";
var readPortlet = "https://ks.kunskapsporten.se/91.569668861590eba0b7fc1bf6/12.569668861590eba0b7fc340a.json";
var defaultJSONString = '{ "title": "User Settings Object",   "description": "Container for settings and other variables stored on user object", "type": "object", "settings": { "bodyFont": 0, "headerFont": 0, "fontSize": 0, "colorScheme": 0, "background": 0, "language": 0, "uidirection": 0, "ageGroup": 0}, "variables": { "personalLinks": [], "currentCourses": []}, "lastModified": "", "acceptCookies": false}';
var localUserSettingsObj = "";

// functions

var bugger = function(a) {
	// console.log if debugOn set to true
   if (debugOn === true) {
      console.log(a);
   }
};

var wipeUserString = function() {
	// Remove entry from user info
   bugger("Wipe..... 0x");
   userString = "";
   sendUserString("");
};

var initUserObject = function() {
	// create JSON from scratch if non is present
   sendUserString(defaultJSONString);
};

/*
var readJSON = function(string, type, name) {
	// Stupid function... :) Reading from local object insead once loaded
   bugger("Reading the value of '" + type + "." + name + "'");
   var userObject = JSON.parse(string);
   console.log("Done! Recived this... " + userObject[type][name]);
   return (userObject[type][name]);
}
*/

var setObj = function(string) {
	// loading JSON into local object
   bugger("Setting localUserSettingsObj");
   var userObject = JSON.parse(string);
   localUserSettingsObj = userObject;
};

var writeToJSON = function(string, section, name, newValue) {
	// Updating value of settings or variables in the JSON
   bugger("Writting value '" + newValue + "' into " + section + " '" + name + "'");
   if(section == "settings" || section == "variables"){
	   var userObject = JSON.parse(string);
	   userObject[section][name] = newValue;
	   sendUserString(JSON.stringify(userObject));
   }
};

var stringLoader = function(callBack, section, name, data) {
	// Load object and perform callback
   bugger("Loading json...");
   var xhttp = new XMLHttpRequest();
   xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200 && callBack) {
         bugger("Success!");

         if (this.responseText == "null") {
            // object not defined in userinfo. Feeding callback with default JSON and initiating new JSON.
            initUserObject();
            callBack(defaultJSONString, section, name, data);
         } else {
            callBack(this.responseText, section, name, data);
         }
      }
   };
   xhttp.open("GET", readPortlet, true);
   xhttp.send();
};

var sendUserString = function(outGoingString) {
	// Send JSON as string to sitevision server side functions
   var xhttp = new XMLHttpRequest();
   xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
         bugger("Sent userString: " + this.responseText);
      } else {
         console.log(this.readyState + " " + this.responseText);
      }
   };
   var completeUrl = writePortlet;
   xhttp.open("POST", completeUrl, true);
   xhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
   xhttp.send("val="+encodeURIComponent(outGoingString));
};

var postUserObject = function(outGoingObj) {
	// Send JSON as string to sitevision server side functions
   var xhttp = new XMLHttpRequest();
   xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
         bugger("Sent userString: " + this.responseText);
      } else {
         console.log(this.readyState + " " + this.responseText);
      }
   };
   xhttp.open("POST", writePortlet);
   xhttp.setRequestHeader("Content-Type","application/json;charset=UTF-8");
   xhttp.send(outGoingObj);
};
function renderXMLAsHTML(filePath,name,subject)
{
    document.write("<div id='"+name+"'></div>");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", filePath, true);
    xhr.onreadystatechange=function () {
            stateChanged(xhr, name, subject, filePath);
        };
    xhr.send();
}
   


function stateChanged(xhr, p1, p2, p3)
{
   console.log(p1 + " and " + p2);
        if(xhr.readyState==4)
        {
            var response = xhr.responseXML;
            doXMLTable(response,p1,p2,p3);
        } 
}
   
function create(htmlStr) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
      }
        return frag;
}   
   
function doXMLTable(data, name, subject, filePath)
{
	var name=name.trim();
   var tableID=name.slice(-5)+"_"+name.length;
   tableID = tableID.replace(/\s+/g, '_');
   tableID = tableID.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-");
   
   var oddlineClass="wordListOdd";
	xmlDoc=data; 
   var lang="Svenska";
	var msLang="";
   var svLang="sv_se";
   
   if(subject=="Franska"){
      var color="frenchColor";
      var msLang="fr_fr";
      }	
	if(subject=="Engelska"){
      var color="englishColor";
      var msLang="en_uk";
      }	
	if(subject=="Spanska"){
      var color="spanishColor";
      var msLang="es_es";
      }	 
	if(subject=="Tyska"){
      var color="germanColor";
      var msLang="de_de";
      }	 	  

	var x=xmlDoc.getElementsByTagName("item"); 
   
   var wordTable = "";
   
	wordTable=wordTable+"<h2>"+name+"</h2><br/>";
	wordTable=wordTable+"<table class='wordListTable' cellspacing='0' style='width:100%; border-spacing: 0px;'>";
	wordTable=wordTable+"<tr><th class='"+color+"'>"+subject+"</th><th class='"+color+"'>"+lang+"</th></tr>";

	for (var i=0;i<x.length;i++){ 
		if (i % 2 == 1){
			oddlineClass="evenLine";
		} else {
		   oddlineClass="oddLine";
		}
      
      wordTable=wordTable+"<tr class='"+oddlineClass+"'>";
      var xmlMs="";
      
		try {
			var xmlBa = x[i].getElementsByTagName("bas")[0].childNodes[0].nodeValue;
		} catch (e) {
			var xmlBa=0;
		}
		try {
		var xmlGe = x[i].getElementsByTagName("genus")[0].childNodes[0].nodeValue;
		} catch (e) {
			var xmlGe="";
		}
		try {
		var xmlSv = x[i].getElementsByTagName("sv")[0].childNodes[0].nodeValue;
		} catch (e) {
			var xmlSv="";
		}
		try {
		var xmlMs = x[i].getElementsByTagName("ms")[0].childNodes[0].nodeValue;
		} catch (e) {
			var xmlMs="";
		}
      var readSpeakerCode ="";
		
		if(xmlMs!==""){
      	var readSpeakerCode=readSpeakerLink (xmlMs,i,subject,tableID,name,msLang);
      
      
		if(xmlBa==1){
			wordTable=wordTable+"<td><p class='wordListLine'><strong>";
		
         
          wordTable=wordTable+readSpeakerCode;
			
         
         if(xmlGe=="f"){
				wordTable=wordTable+"<div class='wordListMarker'>f</div>";
			}
			if(xmlGe=="m"){
				wordTable=wordTable+"<div class='wordListMarker'>m</div>";
			}
			wordTable=wordTable+"</strong></p></td>";
			wordTable=wordTable+"<td><p lang='"+svLang+"' class='wordListLine'><strong>";
			wordTable=wordTable+xmlSv;
        wordTable=wordTable+"</strong></p></td>";
		} else {
			wordTable=wordTable+"<td><p class='wordListLine'>";
			
         
          wordTable=wordTable+readSpeakerCode;
			
         
         if(xmlGe=="f"){
				wordTable=wordTable+"<div class='wordListMarker'>f</div>";
			}
			if(xmlGe=="m"){
				wordTable=wordTable+"<div class='wordListMarker'>m</div>";
			}
			wordTable=wordTable+"</p></td>";
			wordTable=wordTable+"<td><p lang='"+svLang+"' class='wordListLine'>";
			wordTable=wordTable+xmlSv;
			wordTable=wordTable+"</p></td>";
		}
		wordTable=wordTable+"</tr>";
      
   	} // check for empty xmlMS
	}
    wordTable=wordTable+"</table><br/>";
    
    wordTable=wordTable+'<select class="wordBankExercises">';
    wordTable=wordTable+'<option value="">Välj övning...</option>';
    wordTable=wordTable+'<option value="https://ks.kunskapsporten.se/webdav/files/Multimedia/hangman/index.html?xml='+filePath+';Hangman;760;900">Hangman</option>';
    wordTable=wordTable+'<option value="https://ks.kunskapsporten.se/webdav/files/Multimedia/ex1/index.html?path='+filePath+';Valj_Ratt_Ord;850;580">Välj rätt ord</option>';
	 wordTable=wordTable+'<option value="https://ks.kunskapsporten.se/webdav/files/Multimedia/Ex3/index.html?path='+filePath+';Stava_Ratt;850;580">Stava rätt</option>';

   //https://ks.kunskapsporten.se/webdav/files/Multimedia/Ex3/index.html
   
    wordTable=wordTable+'</select>';

   var fragment = create(wordTable);
   // console.log(document.getElementById("readThis"));
   document.getElementById(name).appendChild(fragment);   
   
   //var hash = window.location.hash.substring(1);

    //.unbind()

//******************************************** */

var selectExercises = document.getElementsByClassName("wordBankExercises"); //divsToHide is an array





for(var i = 0; i < selectExercises.length; i++){ 

        removeEventHandler(selectExercises[i], 'change', foo);
        
        addEventHandler(selectExercises[i], 'change', foo);

}

};

var foo = function() {
    
    // url;namn;bredd;höjd

    var originalValue = this.value;

    var valArray=originalValue.split(";");

   
    var trackName="interactive_"+valArray[1];
   
   
    
   
    tL(trackName,'click', valArray[0]);
   
    if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {  
        window.location.replace(valArray[0]);
    } else {
       console.log("öppnar " + valArray[0]);
       console.log("namn "   + valArray[1]);
       console.log("bredd "  + valArray[2]);
       console.log("höjd "   + valArray[3]);

       // my_window = window.open("", "mywindow1", "status=1,width=350,height=150");

       var paramaters = 'width='+valArray[2]+',height='+valArray[3]+',toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=0,left=0,top=0';
       var name = valArray[1];
       window.open(valArray[0],name,paramaters);
    }
};


function removeEventHandler(elem, eventType, handler) {

    console.log("removing");

    if (elem.detachEvent) elem.detachEvent('on'+eventType, handler); else elem.removeEventListener(eventType, handler);
}

function addEventHandler(elem, eventType, handler) {

    console.log("adding");

    if (elem.addEventListener)
        elem.addEventListener (eventType, handler, false);
    else if (elem.attachEvent)
        elem.attachEvent ('on' + eventType, handler); 
}
   
function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
} 
   
   
   
  function  readSpeakerLink (word,wordCount,subject,id,name,lang) {
      
      // ReadSpeaker integration
	var HTMLText = "";
   var languageCode="en_Uk";
	var customerID = "5300";
  
   if(subject=="Franska" || subject=="French") {
      languageCode="fr_Fr";
   }  
   if(subject=="Tyska" || subject=="German") {
      languageCode="de_De";
   }  
   if(subject=="Spanska" || subject=="Spanish") {
      languageCode="es_ES";
   }     
     
	/* */
	HTMLText = HTMLText + '<a lang="'+lang+'" class="wordListLink" href="https://app-eu.readspeaker.com/cgi-bin/rsent?customerid='+customerID+'&lang='+languageCode+'&readid=markedWord';
	HTMLText = HTMLText + "_" + id + "_";
   HTMLText = HTMLText + wordCount;
  	HTMLText = HTMLText + '&url='+window.location.href; //+'#markedWord';
   HTMLText = HTMLText + '" target="_blank" onclick="readpage(this.href,';
	HTMLText = HTMLText + "'xp1'";
	HTMLText = HTMLText + '); scrollMe(';
   HTMLText = HTMLText +"'"+name+"'";
   HTMLText = HTMLText +'); return false;"><div class="wordListWord" id="markedWord';
   HTMLText = HTMLText + "_" + id + "_";
	HTMLText = HTMLText + wordCount;
	HTMLText = HTMLText + '">';
	/**/
  // HTMLText = HTMLText + '<a class="wordListLink" ><div class="wordListWord">';   
     
	HTMLText = HTMLText + word;
     
   HTMLText = HTMLText + '</div></a>';  
	
	/* */ // HTMLText = HTMLText + '</div></a>';
     
   return(HTMLText);  
	
	// ReadSpeaker end
      
   }

   function scrollMe(aid){
      
      scrollToID= document.getElementById(aid);

      scrollToID.scrollIntoView({block: "start", behavior: "smooth"});
      
      
   }