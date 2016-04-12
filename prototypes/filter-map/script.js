
function initApp(presetMode) {
    console.log('initApp');
    console.log('  presetMode: ', presetMode);


    // ======= ======= ======= ======= ======= OBJECTS ======= ======= ======= ======= =======
    // ======= ======= ======= ======= ======= OBJECTS ======= ======= ======= ======= =======
    // ======= ======= ======= ======= ======= OBJECTS ======= ======= ======= ======= =======

    var schoolsCollectionObj;
    var zonesCollectionObj;
    var displayObj;

    // ======= ======= ======= initMenuObjects ======= ======= =======
    function initMenuObjects() {
        console.log("initMenuObjects");

        // == filter object properties: id, category, text, callback
        filterMenu = new Menu("filterMenu");

        // == District, Charter
        filterMenu.District = { id:"District", category:"schools", label:"DCPS Schools", text:"District Schools", column:"Agency", value:"DCPS" };
        filterMenu.Charter = { id:"Charter", category:"schools", label:"Charter Schools", text:"Public Charter Schools", column:"Agency", value:"PCS" };
        filterMenu.All = { id:"All", category:"schools", label:"All Schools", text:"District and Charter Schools", column:"Agency", value:"Both" };


        // High
        // Includes 2014-15 high schools, 6-12 MS/HS, adult, and alternative education schools.
        // Middle
        // Includes 2014-15 middle schools and special education schools.
        // Elem
        // Includes 2014-15 early childhood, elementary and elem/middle grade schools.

        // == PK_K, Elem, Middle, High, ES_MS, MS_HS, Alt, SPED
        filterMenu.EMH = { id:"EMH", category:"schools", label:"All Levels", text:"All Grade Levels", column:"Level", value:"EMH" };
        filterMenu.Elem = { id:"Elem", category:"schools", label:"Elementary Schools", text:"Elementary, Elem/Middle, Early Childhood Schools", column:"Level", value:"ES" };
        filterMenu.Middle = { id:"Middle", category:"schools", label:"Middle Schools", text:"Middle Schools, Special Ed", column:"Level", value:"MS" };
        filterMenu.High = { id:"High", category:"schools", label:"High Schools", text:"High Schools, 6-12 MS/HS, Adult, Alternative Schools", column:"Level", value:"HS" };

        // == spendPast, spendLifetime, spendPlanned
        filterMenu.spendPast = { id:"spendPast", category:"expenditures", label:"Past Spending", text:"Total facility spending (1998-2015)", column:"MajorExp9815", value:null };
        filterMenu.spendPlanned = { id:"spendPlanned", category:"expenditures", label:"Future Spend", text:"Planned facility spending (2016-2021)", column:"TotalAllotandPlan1621", value:null };
        filterMenu.spendLifetime = { id:"spendLifetime", category:"expenditures", label:"Total Spend", text:"Total facility spending (1998-2021)", column:"LifetimeBudget", value:null };

        // == spendSqFt, spendEnroll
        filterMenu.spendSqFt = { id:"spendSqFt", category:"expenditures", label:"/sqft", text:"per sqFt", column:"SpentPerSqFt", value:null };
        filterMenu.spendEnroll = { id:"spendEnroll", category:"expenditures", label:"/student", text:"per student", column:"SpentPerMaxOccupancy", value:null };
        filterMenu.spendAmount = { id:"spendAmount", category:"expenditures", label:"", text:"dollar amount", column:null, value:null };

        // == zones
        filterMenu.Ward = { id:"Ward", category:"zone", label:"Wards", text:"Ward", column:"Ward", value:null };
        filterMenu.FeederHS = { id:"FeederHS", category:"zone", label:"HSfeeders", text:"High School Feeder Pattern", column:"FeederHS", value:null };
        filterMenu.FeederMS = { id:"FeederMS", category:"zone", label:"MSfeeders", text:"Middle School Boundary", column:"FeederMS", value:null };
        filterMenu.Elementary = { id:"Elementary", category:"zone", label:"Elementary zones", text:"Elementary zones", column:null, value:null };

    }
    function Display() {
        console.log("Display");
        this.displayMode = null;
        this.agencyMenu = ["agency", filterMenu.District, filterMenu.Charter, filterMenu.All];
        this.levelsMenu = ["levels", filterMenu.High, filterMenu.Middle, filterMenu.Elem];
        this.expendMenu = ["expend", filterMenu.spendLifetime, filterMenu.spendPast, filterMenu.spendPlanned];
        this.zonesMenu = ["zones", filterMenu.Ward, filterMenu.FeederHS, filterMenu.FeederMS, filterMenu.Elementary];
        this.expendMathMenu = ["expendMath", filterMenu.spendAmount, filterMenu.spendEnroll, filterMenu.spendSqFt];
        this.filterMenusArray = [this.agencyMenu, this.levelsMenu, this.zonesMenu, this.expendMenu];
        this.filterTitlesObject = { "agency":"All", "levels":null, "expend":null, "zones": "Ward" };
        this.filterTitlesArray = [];
        this.schoolNamesArray = [];
        this.categoryLabels = ["sector", "schools", "spending", "location"];
        this.groupLabels = ["who", "what", "when", "where"];
        this.dataFilters = { "agency": "All", "levels": null, "expend": null, "zones": "Ward", "math": "spendAmount", "selectedZone": null  };
    }
    function ZonesCollection() {
        console.log("ZonesCollection");
        this.zoneA = "Ward";       // FeederHS, FeederMS, Elementary, Ward, Quadrant
        this.zoneGeojson_A = null;         // geojson data
        this.zoneGeojson_B = null;       // geojson data
        this.zoneGeojson_AB = null;       // geojson data
        this.mapBounds = null;
        this.aggregatorArray = [];
        this.mapListenersArray = [];
        this.zoneFeaturesArray = [];
        this.indexColorsArray = ["green", "red", "orange", "purple", "salmon", "blue", "yellow", "tomato", "darkkhaki", "goldenrod"];
        this.dataColorsArray = ["#b2bdc7", "#99a8b5", "#7f92a2", "#667c90", "#4c677d", "#32516a", "#193b58", "#002646"];
        this.defaultColor = "white";
        this.dataIncrement = 0;
        this.dataBins = 8;
    }
    function SchoolsCollection() {
        console.log("SchoolsCollection");
        this.dataSource = null;
        this.aggregatorArray = [];
        this.schoolColorsArray = [];
        this.sharedAddressArray = [];
        this.schoolMarkersArray = [];
        this.selectedSchoolsArray = [];
        this.selectedSchool = null;
        this.jsonData = null;         // geojson data
        this.active = false;
    }
    function Menu() {
        console.log("Menu");
    }

    // ======= ======= ======= initDataObjects ======= ======= =======
    function initDataObjects() {
        console.log("initDataObjects");
        schoolsCollectionObj = new SchoolsCollection();
        zonesCollectionObj = new ZonesCollection();
        displayObj = new Display();
    }



    // ======= ======= ======= ======= ======= DISPLAY ======= ======= ======= ======= =======
    // ======= ======= ======= ======= ======= DISPLAY ======= ======= ======= ======= =======
    // ======= ======= ======= ======= ======= DISPLAY ======= ======= ======= ======= =======


    // ======= ======= ======= makeSearchAndHoverDisplay ======= ======= =======
    Display.prototype.makeSearchAndHoverDisplay = function() {
        console.log("makeSearchAndHoverDisplay");

        var filterContainer = ("#filter-container ");
        var menuHtml = "";
        this.makeColorLegend();
        menuHtml += this.makeSearchDisplay();
        menuHtml += this.makeHoverDisplay();
        $(filterContainer).append(menuHtml);
        this.activateSearchButton("searchButton");
        this.activateSearchWindow("searchWindow");
    }

    // ======= ======= ======= makeColorLegend ======= ======= =======
    Display.prototype.makeColorLegend = function() {
        console.log("makeColorLegend");
        var legendHtml = "<div id='legend'>";
        legendHtml += "<div><p class='legend-text'>District Schools</p><div class=legend-color-dcps>&nbsp;</div></div>";
        legendHtml += "<div><p class='legend-text'>Charter Schools</p><div class=legend-color-pcs>&nbsp;</div></div>";
        legendHtml += "</div>";
        $("body").append(legendHtml);
    }

    // ======= ======= ======= makeSelectBox ======= ======= =======
    Display.prototype.makeSelectBox = function(jsonData) {
        console.log("makeSelectBox");

        var selectBox = null
        var selectHtml = "<select id='school-select'>";
        var nextSchool, nextSchoolName;
        for (var i = 0; i < jsonData.length; i++ ) {
            nextSchool = jsonData[i];
            nextSchoolName = nextSchool.School;
            selectHtml += "<option value='" + nextSchoolName + "'>" + nextSchoolName + "</option>";
        }
        selectHtml += "</select>";

        var filterContainer = ("#filter-container ");
        selectBox = $("#filter-container").children("select");
        console.log("  selectBox: ", selectBox);
        if (selectBox) {
            $(filterContainer).append(selectHtml);
            this.activateSelectBox();
        }

    }

    // ======= ======= ======= makeSearchDisplay ======= ======= =======
    Display.prototype.makeSearchDisplay = function() {
        // console.log("makeSearchDisplay");
        var searchHtml = "<div id='search' class='category'>";
        searchHtml += "<input id='searchWindow' type='text' placeholder='  school name'/ >";
        searchHtml += "<input type='button' id='searchButton' value='search'/ ></div>";
        return searchHtml;
    }

    // ======= ======= ======= makeHoverDisplay ======= ======= =======
    Display.prototype.makeHoverDisplay = function() {
        // console.log("makeHoverDisplay");
        var hoverHtml = "<div id='mouseover-text'><h2>&nbsp;</h2></div>";
        return hoverHtml;
    }

    // ======= ======= ======= makeMathSelect ======= ======= =======
    Display.prototype.makeMathSelect = function(whichMenu, chartOrProfile) {
        console.log("makeMathSelect");

        // == filter-container  bar container
        var subMenuContainer = $("#sub-nav-container");

        // == build sub-menu; attach to chart or profile div
        var nextCategory = whichMenu[0];
        if (chartOrProfile == "chart") {
            var subMenuHtml = "<select id='expendMathC' name='expendMath'>";
        } else if (chartOrProfile == "profile") {
            var subMenuHtml = "<select id='expendMathP' name='expendMath'>";
        }

        var nextItem, nextId, nextText;
        for (var i = 1; i < whichMenu.length; i++) {
            nextItem = whichMenu[i];
            nextId = nextItem.id;
            nextText = nextItem.text;
            if (displayObj.dataFilters.math == nextId) {
                subMenuHtml += "<option selected='selected' value='" + nextId + "'>" + nextText + "</option>";
            } else {
                subMenuHtml += "<option value='" + nextId + "'>" + nextText + "</option>";
            }
        }
        subMenuHtml += "</select>";
        return subMenuHtml;
    }

    // ======= ======= ======= activateFilterMenus ======= ======= =======
    Display.prototype.activateFilterMenus = function() {
        console.log("activateFilterMenus");

        var nextMenu, nextFilter;

        for (var i = 0; i < this.filterMenusArray.length; i++) {
            nextMenu = this.filterMenusArray[i];
            for (var j = 1; j < nextMenu.length; j++) {
                nextFilter = nextMenu[j];
                this.activateFilterLink(nextFilter);
            }
        }
    }

    // ======= ======= ======= activateClearButton ======= ======= =======
    Display.prototype.activateClearButton = function() {
        console.log("activateClearButton");

        var self = this;
        $("#clear-button").fadeIn( "slow", function() {
            console.log("*** FADEIN ***");
        });

        // ======= ======= ======= selectFilter ======= ======= =======
        $("#clear-button").off("click").on("click", function(event){
            console.log("\n======= clear ======= ");

            // == clear menus (html) and filters (displayObj)
            checkFilterSelection(self, zonesCollectionObj);
            clearFilterSelctions();
            clearProfileChart();
            checkFilterSelection(self, zonesCollectionObj);
            $("#searchWindow").val('');
            updateHoverText(null);

            // == load default map
            zonesCollectionObj.getZoneData();
        });
    }

    // ======= ======= ======= activateSearchWindow ======= ======= =======
    Display.prototype.activateSearchWindow = function(windowId) {
        console.log("activateSearchWindow");

        $("#" + windowId).on('input',function(e){
            console.log("input");
            clearProfileChart();
        });
    }

    // ======= ======= ======= activateSelectBox ======= ======= =======
    Display.prototype.activateSelectBox = function(windowId) {
        console.log("activateSelectBox");

        var self = this;
        $("#school-select").on('change',function(e){
            console.log("school-select");
            $("#searchWindow").val("");
            if ($('#profile-container').find('#profile').length) {
                $("#profile-container").fadeIn( "fast", function() {
                    console.log("*** FADEIN profile-container ***");
                });
            } else {
                clearProfileChart();
            };
            self.findSearchSchool();
        });
    }

    // ======= ======= ======= activateCloseButton ======= ======= =======
    Display.prototype.activateCloseButton = function(buttonId) {
        console.log("activateCloseButton");

        var self = this;
        var buttonElement = $("#close-X");

        // ======= selectFilter =======
        $(buttonElement).off("click").on("click", function(event){
            console.log("\n======= close =======");

            // == remove previous chart or profile html if any
            $("#profile-container").fadeOut( "fast", function() {
                    console.log("*** FADEOUT profile-container ***");
                    $("#profile").remove();
            });
            if ($('#chart-container').find('#chart').length) {
                $("#chart-container").fadeIn( "slow", function() {
                    console.log("*** FADEIN chart-container ***");
                });
            }
            if ($('#legend-container').find('#legend').length) {
                $("#legend").remove();
            }
        });
    }

    // ======= ======= ======= activateSearchButton ======= ======= =======
    Display.prototype.activateSearchButton = function(buttonId) {
        console.log("activateSearchButton");

        var self = this;
        var buttonElement = $("#" + buttonId);

        // ======= selectFilter =======
        $(buttonElement).off("click").on("click", function(event){
            console.log("\n======= search =======");
            self.findSearchSchool();
        });
        // ======= selectFilter =======
        $( window ).bind('keypress', function(event){
            if ( event.keyCode == 13 ) {
                console.log("\n======= search =======");
                self.findSearchSchool();
            }
        });
    }

    // ======= ======= ======= activateFilterLink ======= ======= =======
    Display.prototype.activateFilterLink = function(nextItem) {
        console.log("activateFilterLink");

        // == id ties DOM element to menu object
        var self = this;
        var nextId = nextItem.id;
        var nextElement = $("#" + nextId);

        // ======= ======= ======= mouseover ======= ======= =======
        $(nextElement).off("mouseover").on("mouseover", function(event){
            // console.log("\n======= mouseover ======= ");
            var whichFilter = this.id;
            var menuObject = filterMenu[whichFilter];
            var whichText = menuObject.text;
            updateHoverText(whichText);
        });

        // ======= ======= ======= mouseout ======= ======= =======
        $(nextElement).off("mouseout").on("mouseout", function(event){
            // console.log("\n======= mouseout ======= ");
            updateHoverText("");
        });

        // ======= ======= ======= selectFilter ======= ======= =======
        $(nextElement).off("click").on("click", function(event){
            console.log("\n======= selectFilter ======= ");

            var classList = $(this).attr('class').split(/\s+/);
            var whichCategory = classList[1];
            var whichFilter = this.id;
            var menuObject = filterMenu[whichFilter];
            var whichValue = menuObject.value;
            var whichText = menuObject.text;
            var htmlString;
            checkFilterSelection(self, zonesCollectionObj, whichCategory);
            event.stopImmediatePropagation();

            // == store selected filter value  (agency, levels, expend, zone) on display object
            switch(whichCategory) {

                // == agency filter (all, district, charter)
                case "agency":
                    self.dataFilters.agency = whichFilter;
                    clearZoneAggregator(zonesCollectionObj);
                    if (whichFilter == "All") {
                        setMenuState(displayObj, self.agencyMenu, ["A", "A", "S"]);
                        resetMenuState(displayObj, "zones");
                    } else if (whichFilter == "District") {
                        setMenuState(displayObj, self.agencyMenu, ["S", "A", "A"]);
                        resetMenuState(displayObj, "zones");
                    } else if (whichFilter == "Charter") {
                        self.dataFilters.zones = "Ward";
                        zonesCollectionObj.zoneA = "Ward";
                        zonesCollectionObj.zoneGeojson_AB = null;
                        zonesCollectionObj.aggregatorArray = [];
                        if (self.dataFilters.levels == "HS") {
                            setMenuState(displayObj, self.levelsMenu, ["S", "A", "A"]);
                        } else if (self.dataFilters.levels == "MS") {
                            setMenuState(displayObj, self.levelsMenu, ["A", "S", "A"]);
                        } else if (self.dataFilters.levels == "ES") {
                            setMenuState(displayObj, self.levelsMenu, ["A", "A", "S"]);
                        }
                        setMenuState(displayObj, self.agencyMenu, ["A", "S", "A"]);
                        setMenuState(displayObj, self.zonesMenu, ["S", "D", "D"]);
                    }
                    break;

                // == levels filter (ES, MS, HS)
                case "levels":
                    self.dataFilters.levels = whichValue;
                    zonesCollectionObj.aggregatorArray = [];
                    if (whichValue == "HS") {
                        setMenuState(displayObj, self.levelsMenu, ["S", "A", "A"]);
                        zonesCollectionObj.zoneA = "FeederHS";
                        // resetMenuState(displayObj, "levels");
                    } else if (whichValue == "MS") {
                        setMenuState(displayObj, self.levelsMenu, ["A", "S", "A"]);
                        zonesCollectionObj.zoneA = "FeederMS";
                        // resetMenuState(displayObj, "levels");
                    } else if (whichValue == "ES") {
                        setMenuState(displayObj, self.levelsMenu, ["A", "A", "S"]);
                        zonesCollectionObj.zoneA = "Elementary";
                        // resetMenuState(displayObj, "levels");
                    } else {
                        zonesCollectionObj.zoneA = "Ward";
                    }
                    break;

                // == expenditures filter (past, present, planed, etc.)
                case "expend":
                    self.dataFilters.expend = whichFilter;
                    if (whichFilter == "spendLifetime") {
                        setMenuState(displayObj, self.expendMenu, ["S", "A", "A"]);
                    } else if (whichFilter == "spendPast") {
                        setMenuState(displayObj, self.expendMenu, ["A", "S", "A"]);
                    } else if (whichFilter == "spendPlanned") {
                        setMenuState(displayObj, self.expendMenu, ["A", "A", "S"]);
                    }
                    clearZoneAggregator(zonesCollectionObj);
                    break;

                // == wards or feeder zones for map
                case "zones":
                console.log("  ======= ======= dataFilters.levels: ", self.dataFilters.levels);
                    self.dataFilters.zones = whichFilter;
                    zonesCollectionObj.zoneA = whichFilter;
                    zonesCollectionObj.zoneGeojson_AB = null;
                    zonesCollectionObj.aggregatorArray = [];
                    var tempAgency = self.dataFilters.agency;
                    var tempLevels = self.dataFilters.levels;
                    console.log("  tempAgency: ", tempAgency);
                    console.log("  tempLevels: ", tempLevels);

                    // == high school feeder zone selected
                    if (whichFilter == "FeederHS") {
                        self.dataFilters.agency = "District";
                        setMenuState(displayObj, self.agencyMenu, ["S", "D", "D"]);
                        setMenuState(displayObj, self.zonesMenu, ["A", "S", "A"]);

                        // == high school feeder zones apply to middle or elem schools
                        if (tempLevels == "ES") {
                            self.dataFilters.levels = "ES";
                            setMenuState(displayObj, self.levelsMenu, ["A", "A", "S"]);
                            levelObject = filterMenu["Elem"];
                        } else if (tempLevels == "MS") {
                            self.dataFilters.levels = "MS";
                            setMenuState(displayObj, self.levelsMenu, ["A", "S", "A"]);
                            levelObject = filterMenu["Middle"];
                        } else if (tempLevels == "HS") {
                            self.dataFilters.levels = "HS";
                            setMenuState(displayObj, self.levelsMenu, ["S", "A", "A"]);
                            levelObject = filterMenu["High"];
                        } else if (tempLevels == null) {
                            self.dataFilters.levels = null;
                            setMenuState(displayObj, self.levelsMenu, ["A", "A", "A"]);
                            levelObject = filterMenu[null];
                        }

                    // == middle school feeder zone selected
                    } else if (whichFilter == "FeederMS") {
                        self.dataFilters.agency = "District";
                        setMenuState(displayObj, self.agencyMenu, ["S", "D", "D"]);
                        setMenuState(displayObj, self.zonesMenu, ["A", "A", "S"]);

                        // == high school feeder zones apply to middle or elem schools
                        if (tempLevels == "ES") {
                            self.dataFilters.levels = "ES";
                            setMenuState(displayObj, self.levelsMenu, ["A", "A", "S"]);
                            levelObject = filterMenu["Elem"];
                        } else if (tempLevels == "MS") {
                            self.dataFilters.levels = "MS";
                            setMenuState(displayObj, self.levelsMenu, ["A", "S", "A"]);
                            levelObject = filterMenu["Middle"];
                        } else if (tempLevels == "HS") {
                            self.dataFilters.levels = "HS";
                            setMenuState(displayObj, self.levelsMenu, ["S", "A", "A"]);
                            levelObject = filterMenu["High"];
                        } else if (tempLevels == null) {
                            self.dataFilters.levels = null;
                            setMenuState(displayObj, self.levelsMenu, ["A", "A", "A"]);
                            levelObject = filterMenu[null];
                        }

                        // == middle school feeder zones apply to elementary schools only
                        // self.dataFilters.levels = "ES";
                        // setMenuState(displayObj, self.zonesMenu, ["A", "A", "S"]);
                        // setMenuState(displayObj, self.levelsMenu, ["D", "D", "S"]);
                        // levelObject = filterMenu["Elem"];

                    // == elementary zone selected
                    } else if (whichFilter == "Elementary") {
                        self.dataFilters.levels = "ES";
                        setMenuState(displayObj, self.zonesMenu, ["A", "A", "A"]);
                        setMenuState(displayObj, self.levelsMenu, ["A", "A", "A"]);

                    // == no zone or Ward selected
                    } else {
                        if (displayObj.dataFilters.levels == "HS") {
                            setMenuState(displayObj, self.levelsMenu, ["S", "A", "A"]);
                        } else if (displayObj.dataFilters.levels == "MS") {
                            setMenuState(displayObj, self.levelsMenu, ["A", "S", "A"]);
                        } else if (displayObj.dataFilters.levels == "ES") {
                            setMenuState(displayObj, self.levelsMenu, ["A", "A", "S"]);
                        } else {
                            setMenuState(displayObj, self.levelsMenu, ["A", "A", "A"]);
                        }
                        if (displayObj.dataFilters.agency == "District") {
                            setMenuState(displayObj, self.agencyMenu, ["S", "A", "A"]);
                        } else if (displayObj.dataFilters.agency == "Charter") {
                            setMenuState(displayObj, self.agencyMenu, ["A", "S", "A"]);
                        } else if (displayObj.dataFilters.agency == "All") {
                            setMenuState(displayObj, self.agencyMenu, ["A", "A", "S"]);
                        } else {
                            setMenuState(displayObj, self.agencyMenu, ["A", "A", "A"]);
                        }
                        setMenuState(displayObj, self.zonesMenu, ["S", "A", "A"]);
                    }
                    break;
            }

            if (self.dataFilters.expend == null) {
                clearProfileChart();
            }

            updateHoverText(null);
            checkFilterSelection(self, zonesCollectionObj, whichCategory);
            zonesCollectionObj.getZoneData();
        });
    }

    // ======= ======= ======= resetMenuState ======= ======= =======
    function resetMenuState(displayObj, whichMenu) {
        console.log("resetMenuState");

        // == restore levels menu for new zones selection (e.g. deactivate HS for feeders)
        if (whichMenu == "zones") {
            if (displayObj.dataFilters.zones == "Ward") {
                setMenuState(displayObj, displayObj.zonesMenu, ["S", "A", "A"]);
            } else if (displayObj.dataFilters.zones == "FeederHS") {
                if ((displayObj.dataFilters.levels == "HS") || (displayObj.dataFilters.levels == "MS")) {
                    // setMenuState(displayObj, displayObj.levelsMenu, ["D", "S", "A"]);
                } else if (displayObj.dataFilters.levels == "ES") {
                    // setMenuState(displayObj, displayObj.levelsMenu, ["D", "A", "S"]);
                }
                setMenuState(displayObj, displayObj.zonesMenu, ["A", "S", "A"]);
            } else if (displayObj.dataFilters.zones == "FeederMS") {
                // setMenuState(displayObj, displayObj.levelsMenu, ["D", "D", "S"]);
                setMenuState(displayObj, displayObj.zonesMenu, ["A", "A", "S"]);
            } else {
                setMenuState(displayObj, displayObj.zonesMenu, ["A", "A", "A"]);
            }

        // == set levels menu according to zones selection (e.g. deactivate HS for feeders)
        } else if (whichMenu == "levels") {
            if (displayObj.dataFilters.levels == "HS") {
                if (displayObj.dataFilters.zones == "Ward") {
                    setMenuState(displayObj, displayObj.levelsMenu, ["S", "A", "A"]);
                } else if ((displayObj.dataFilters.zones == "FeederHS") || (displayObj.dataFilters.zones == "FeederMS")) {
                    setMenuState(displayObj, displayObj.levelsMenu, ["D", "S", "A"]);
                }
            } else if (displayObj.dataFilters.levels == "MS") {
                if (displayObj.dataFilters.zones == "Ward") {
                    setMenuState(displayObj, displayObj.levelsMenu, ["A", "S", "A"]);
                } else if ((displayObj.dataFilters.zones == "FeederHS") || (displayObj.dataFilters.zones == "FeederMS")) {
                    setMenuState(displayObj, displayObj.levelsMenu, ["D", "S", "A"]);
                }
            } else if (displayObj.dataFilters.levels == "ES") {
                if (displayObj.dataFilters.zones == "Ward") {
                    setMenuState(displayObj, displayObj.levelsMenu, ["A", "A", "S"]);
                } else if (displayObj.dataFilters.zones == "FeederHS") {
                    setMenuState(displayObj, displayObj.levelsMenu, ["D", "A", "S"]);
                } else if (displayObj.dataFilters.zones == "FeederMS") {
                    setMenuState(displayObj, displayObj.levelsMenu, ["D", "D", "S"]);
                }
            }
        }
    }

    // ======= ======= ======= clearFilterSelctions ======= ======= =======
    function clearFilterSelctions() {
        console.log("clearFilterSelctions");

        setMenuState(displayObj, displayObj.agencyMenu, ["A", "A", "S"]);
        setMenuState(displayObj, displayObj.levelsMenu, ["A", "A", "A"]);
        setMenuState(displayObj, displayObj.zonesMenu, ["S", "A", "A"]);
        setMenuState(displayObj, displayObj.expendMenu, ["A", "A", "A"]);
        displayObj.filterTitlesArray = [];
        displayObj.dataFilters.agency = "All";
        displayObj.dataFilters.levels = null;
        displayObj.dataFilters.zones = "Ward";
        displayObj.dataFilters.expend = null;
        displayObj.dataFilters.math = "spendAmount";
        zonesCollectionObj.zoneGeojson_A = null;
        zonesCollectionObj.zoneGeojson_B = null;
        zonesCollectionObj.zoneGeojson_AB = null;
        zonesCollectionObj.aggregatorArray = [];
        zonesCollectionObj.zoneA = "Ward";
        displayObj.filterTitlesObject = { "agency":"District and Charter Schools", "levels":null, "expend":null, "zones": "Ward" };
        displayObj.filterTitlesArray = [displayObj.agencyMenu[1].text, displayObj.zonesMenu[1].text];
        console.log("  displayObj.filterTitlesArray: ", displayObj.filterTitlesArray);
        updateFilterSelections(displayObj);
    }

    // ======= ======= ======= findSearchSchool ======= ======= =======
    Display.prototype.findSearchSchool = function() {
        console.log("findSearchSchool");

        var self = this;
        var searchSchoolName = null;
        updateHoverText(null);
        updateFilterSelections(displayObj);
        if ($("#searchWindow").val()) {
            searchSchoolName = $("#searchWindow").val();
        } else {
            searchSchoolName = $("#school-select").val();
        }
        console.log("  searchSchoolName: ", searchSchoolName);

        // var url = "Data_Schools/DC_OpenSchools_Master_214.csv";
        // var url = "Data_Schools/DCSchools_FY1415_Master_321.csv ";
        // var url = "../../DCSchools_FY1415_Master_321.csv ";
        // var url = "https://rawgit.com/codefordc/school-modernization/master/Output%20Data/DCSchools_FY1415_Master_46.csv";
        var url = "https://rawgit.com/codefordc/school-modernization/master/Output%20Data/DCSchools_FY1415_Master_412.csv";

        var filterTitleContainer = $("#filters-selections").children("h2");
        var jsonData, foundDataArray, schoolText, tempSchoolText;

        // ======= get map geojson data =======
        $.ajax({
            dataType: "text",
            url: url
        }).done(function(textData){
            console.log("*** ajax success ***");
            jsonData = CSV2JSON(textData);
            console.dir(jsonData);
            foundDataArray = buildSearchArray(jsonData, searchSchoolName);
            tempSchoolText = displayFoundSchool(foundDataArray);
            schoolText = tempSchoolText.substring(0, tempSchoolText.length - 2);
            $(filterTitleContainer).html(schoolText);
            $("#searchWindow").val("");

        // == errors/fails
        }).fail(function(){
            console.log("*** ajax fail ***");
        }).error(function() {
            console.log("*** ajax error ***");
        });
    }

    // ======= ======= ======= buildSearchArray ======= ======= =======
    function buildSearchArray(jsonData, searchSchoolName) {
        console.log("buildSearchArray");

        var nextSchool, schoolName;
        var foundDataArray = [];

        // ======= search school data by name =======
        for (var i = 0; i < jsonData.length; i++) {
            nextSchool = jsonData[i];
            schoolName = nextSchool.School;
            if (schoolName) {
                var checkSchool = schoolName.indexOf(searchSchoolName);
                if (checkSchool > -1) {
                    foundDataArray.push([i, nextSchool]);
                }
            }
        }
        return foundDataArray;
    }

    // ======= ======= ======= displayFoundSchool ======= ======= =======
    function displayFoundSchool(foundDataArray) {
        console.log("displayFoundSchool");

        var filterTitleContainer = $("#filters-selections").children("h2");
        var schoolText, hoverText, nextSchool, nextSchoolName;

        // == display found school name or "no data" message
        if (foundDataArray.length > 0) {

            // == more than one school matches search
            if (foundDataArray.length > 1) {
                $(filterTitleContainer).css("font-size", "14px");
                schoolText = "<span class='filterLabel'>Multiple schools: </span>";
                hoverText = "<span class='filterLabel'>Multiple schools found. </span>Re-enter choice from options above map.";
                updateHoverText(hoverText);

            // == single school matches search
            } else {
                displayObj.activateClearButton();
                makeSchoolProfile(schoolsCollectionObj, zonesCollectionObj, displayObj, foundDataArray[0][1]);
                // hiliteSchoolMarker(foundDataArray);
                updateHoverText(null);
                $(filterTitleContainer).css("font-size", "16px");
                schoolText = "<span class='filterLabel'>Your school: </span>";
                $("#profile-container").css("display", "table");
            }

            // == change to display mode
            $(filterTitleContainer).addClass("filterList");

            // == create autoComplete array, save on display object
            var schoolNamesArray = [];
            for (var i = 0; i < foundDataArray.length; i++) {
                nextSchool = foundDataArray[i][1];
                nextSchoolName = nextSchool.School;
                schoolText += nextSchoolName + ", ";
                schoolNamesArray.push(nextSchoolName);
            }
            displayObj.dataFilters.selectedSchool = schoolNamesArray;
        } else {
            $(filterTitleContainer).addClass("filterList");
            schoolText = "No data.  Please try again.  ";
        }
        return schoolText;
    }

    // ======= ======= ======= hiliteSchoolMarker ======= ======= =======
    function hiliteSchoolMarker(foundDataArray) {
        console.log("hiliteSchoolMarker");

        var schoolIndex = foundDataArray[0][0];
        var flashCounter = 0;
        var schoolMarker = schoolsCollectionObj.schoolMarkersArray[schoolIndex];
        console.dir(schoolMarker);

        var hilite = setInterval(flashMarker, 500);

        function flashMarker() {
            flashCounter++;
            schoolMarker.icon.fillColor = "purple";
            schoolMarker.icon.strikeColor = "black";
            schoolMarker.icon.strokeWeight = 6;
            schoolMarker.icon.scale = .6;
            schoolMarker.setMap(map);
            if (flashCounter > 4) {
                clearInterval(hilite);
            }
            setTimeout(resetMarker, 400);
        }
r
        function resetMarker() {
            schoolMarker.icon.fillColor = schoolMarker.defaultColor;
            schoolMarker.icon.scale = 0.2;
            schoolMarker.icon.strikeColor = "purple";
            schoolMarker.icon.strokeWeight = 2;
            schoolMarker.setMap(map);
        }
    }




    // ======= ======= ======= ======= ======= ZONES ======= ======= ======= ======= =======
    // ======= ======= ======= ======= ======= ZONES ======= ======= ======= ======= =======
    // ======= ======= ======= ======= ======= ZONES ======= ======= ======= ======= =======

    // ======= ======= ======= getZoneData ======= ======= =======
    ZonesCollection.prototype.getZoneData = function() {
        console.log("\n----- getZoneData -----");
        console.log("  this.aggregatorArray.length: ", this.aggregatorArray.length);
        console.dir(this.aggregatorArray);

        var self = this;
        var selectedZonesArray = getZoneUrls(displayObj, zonesCollectionObj);
        var urlA = selectedZonesArray[0];
        var urlB = selectedZonesArray[1];
        var feederFlag = selectedZonesArray[2];

        // ======= get map geojson data =======
        $.ajax({
            dataType: "json",
            url: urlA
        }).done(function(geoJsonData, featureArray){
            console.log("*** ajax success ***");
            self.zoneGeojson_A = geoJsonData;
            console.dir(geoJsonData);

            // == aggregate for urlA zones
            if (self.aggregatorArray.length == 0) {
                makeZoneAggregator(self, displayObj, self.zoneGeojson_A);
            }

            // == get secondary map data for urlB
            if (feederFlag == true) {
                self.getFeederZones(urlB);
            } else {
                schoolsCollectionObj.getSchoolData();
            }

        // == errors/fails
        }).fail(function(){
            console.log("*** ajax fail ***");
        }).error(function() {
            console.log("*** ajax error ***");
        });
    }

    // ======= ======= ======= getFeederZones ======= ======= =======
    ZonesCollection.prototype.getFeederZones = function(urlB) {
        console.log("\n----- getFeederZones -----");

        var featuresA, featuresB, featuresAll;
        var self = this;

        $.ajax({
            dataType: "json",
            url: urlB
        }).done(function(geoJsonData, featureArray){
            console.log("*** ajax success ***");
            self.zoneGeojson_B = geoJsonData;
            featuresA = self.zoneGeojson_A.features;
            featuresB = self.zoneGeojson_B.features;
            featuresAll = featuresB.concat(featuresA);
            mergedGeojsonData = {
                "type": "FeatureCollection",
                "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
                "features": featuresAll
            }
            self.zoneGeojson_AB = mergedGeojsonData;
            console.log("******* geoJson *******");
            console.dir(self.zoneGeojson_A);
            console.dir(self.zoneGeojson_B);
            console.dir(self.zoneGeojson_AB);
            schoolsCollectionObj.getSchoolData();

        // == errors/fails
        }).fail(function(){
            console.log("*** ajax fail ***");
        }).error(function() {
            console.log("*** ajax error ***");
        });
    }


    // ======= ======= ======= ======= ======= SCHOOLS ======= ======= ======= ======= =======
    // ======= ======= ======= ======= ======= SCHOOLS ======= ======= ======= ======= =======
    // ======= ======= ======= ======= ======= SCHOOLS ======= ======= ======= ======= =======



    // ======= ======= ======= getSchoolData ======= ======= =======
    SchoolsCollection.prototype.getSchoolData = function() {
        console.log("\n----- getSchoolData -----");

        var self = this;
        var presetMode = displayObj.displayMode;

        if ((displayObj.displayMode == "storyMap")  || (displayObj.displayMode == "toolMap")) {
            var websitePrefix = "prototypes/filter-map/";
        } else {
            var websitePrefix = "";
        }
        // var url = websitePrefix + "Data_Schools/DCSchools_FY1415_Master_321.csv"
        // var url = websitePrefix + "../../DCSchools_FY1415_Master_321.csv"
        // var url = "../../DCSchools_FY1415_Master_321.csv ";
        // var url = "https://rawgit.com/codefordc/school-modernization/master/Output%20Data/DCSchools_FY1415_Master_46.csv";
        var url = "https://rawgit.com/codefordc/school-modernization/master/Output%20Data/DCSchools_FY1415_Master_412.csv";

        // ======= get school data =======
        if (this.jsonData == null) {
            $.ajax({
                // url: websitePrefix + "Data_Schools/DC_OpenSchools_Master_214.csv",
                url: url,
                method: "GET",
                dataType: "text"
            }).done(function(textData){
                console.log("*** ajax success ***");
                console.dir(textData);
                jsonData = CSV2JSON(textData);
                console.dir(jsonData);

                // == store school json data
                self.jsonData = jsonData;
                getSchoolData();

            // == errors/fails
            }).fail(function(){
                console.log("*** ajax fail ***");
            }).error(function() {
                console.log("*** ajax error ***");
            });

        } else {
            getSchoolData();
        }

        // ======= ======= ======= getSchoolData ======= ======= =======
        function getSchoolData() {
            console.log("getSchoolData");

            // ======= variables and temp arrays =======
            var schoolIndex = -1;
            var sharedAddressArray = [];
            var selectedCodesArray = [];
            var selectedNamesArray = [];
            var rejectedCodesArray = [];
            var selectedSchoolsArray = [];
            var rejectedAggregatorArray = [];
            var nextSchool, schoolData, selectSchool, rejectedAggregatorCode;

            // ======= SCHOOL DATA LOOP =======
            if (displayObj.displayMode != "noSchools") {
                for (var i = 0; i < jsonData.length; i++) {
                    var filterFlagCount = 0;

                    // == check school with filter settings
                    nextSchool = jsonData[i];
                    selectSchool = self.checkFilterMatch(nextSchool);

                    // == build arrays of selected/not selected schools
                    if (selectSchool == true) {
                        schoolIndex++;
                        schoolData = getDataDetails(nextSchool, schoolIndex);

                        selectedSchoolsArray.push(schoolData)
                        selectedCodesArray.push(schoolData.schoolCode)
                        selectedNamesArray.push(processSchoolName(schoolData.schoolName))

                        // == store school that matches school zone (e.g. Deal Middle School with Deal Middle School Zone)
                        if ((displayObj.dataFilters.expend != null) && (displayObj.dataFilters.levels != null) && (displayObj.dataFilters.zones == null)) {
                            captureSchoolData(zonesCollectionObj, displayObj, schoolData, schoolIndex);

                        // == aggregate multiple school data for selected zone type (e.g all-school totals for Ward 3)
                        } else {
                            rejectedAggregatorCode = aggregateZoneData(zonesCollectionObj, displayObj, schoolData, schoolIndex);
                            if (rejectedAggregatorCode) {
                                rejectedAggregatorArray.push(rejectedAggregatorCode);
                            }
                        }

                        // == handle multiple schools at same Address
                        if (schoolData.unqBuilding == 2) {
                            sharedAddressArray.push(schoolData.schoolAddress);
                        }

                    } else {
                        rejectedCodesArray.push(nextSchool.School_ID);
                    }
                }
                self.sharedAddressArray = sharedAddressArray;
                self.selectedSchoolsArray = selectedSchoolsArray;

                // checkSchoolData(zonesCollectionObj, schoolsCollectionObj, selectedSchoolsArray, selectedCodesArray, rejectedCodesArray, rejectedAggregatorArray);

                // ======= make map layers ======
                if (selectedSchoolsArray.length > 0) {
                    zonesCollectionObj.makeZoneLayer();
                    self.makeSchoolLayer();
                } else {
                    displayFilterMessage("Sorry, no schools matched criteria.  Click CLEAR");
                    clearProfileChart();
                }

            } else {
                zonesCollectionObj.makeZoneLayer();
                self.makeSchoolLayer();
            }
        }
    }

    // ======= ======= ======= checkFilterMatch ======= ======= =======
    SchoolsCollection.prototype.checkFilterMatch = function(nextSchool) {
        // console.log("checkFilterMatch");

        var checkAgency = false;
        var school = nextSchool.School;
        var schoolType = nextSchool.Agency;
        var schoolLevel = nextSchool.Level;
        var schoolWard = "Ward " + nextSchool.Ward;
        var schoolFeederHS = nextSchool.FeederHS;
        var schoolFeederMS = nextSchool.FeederMS;
        var shortName = processSchoolName(school);

        // == check agency match
        if (displayObj.dataFilters.agency) {
            if (displayObj.dataFilters.agency != "All") {
                if (displayObj.dataFilters.agency == "District") {
                    checkAgency = "DCPS";
                } else if (displayObj.dataFilters.agency == "Charter") {
                    checkAgency = "PCS";
                }
                if (checkAgency == schoolType) {
                    var agencyMatch = true;
                } else {
                    var agencyMatch = false;
                }
            } else {
                var agencyMatch = true;
            }
        } else {
            var agencyMatch = true;
        }

        // == check levels match
        if (displayObj.dataFilters.levels) {
            if (displayObj.dataFilters.levels == "HS") {
                levelFilter = ["HS", "ADULT", "MS/HS", "ALT"];
                var checkLevel = levelFilter.indexOf(schoolLevel);
                if (checkLevel > -1) {
                    var levelsMatch = true;
                }
            } else if (displayObj.dataFilters.levels == "MS") {
                levelFilter = ["MS", "SPED"];
                var checkLevel = levelFilter.indexOf(schoolLevel);
                if (checkLevel > -1) {
                    var levelsMatch = true;
                }
            } else if (displayObj.dataFilters.levels == "ES") {
                levelFilter = ["ES", "ES/MS", "PK3-K"];
                var checkLevel = levelFilter.indexOf(schoolLevel);
                if (checkLevel > -1) {
                    var levelsMatch = true;
                }
            }
        } else {
            var levelsMatch = true;
        }

        // == return match result
        if ((levelsMatch == true) && (agencyMatch == true)) {
            return true;
        } else {
            return false;
        }
    }

    // ======= ======= ======= checkFilterMatch ======= ======= =======
    function checkFilterMatch(school, schoolType, schoolLevel, schoolWard, schoolFeederMS, schoolFeederHS) {
        console.log("checkFilterMatch");

        console.log("******* school: ", school);
        console.log("  schoolAgency: ", schoolType);
        console.log("  schoolLevel: ", schoolLevel);
        console.log("  schoolWard: ", schoolWard);
        console.log("  schoolFeederMS: ", schoolFeederMS);
        console.log("  schoolFeederHS: ", schoolFeederHS);
        console.log("  displayObj.dataFilters.agency: ", displayObj.dataFilters.agency);
        console.log("  displayObj.dataFilters.levels: ", displayObj.dataFilters.levels);
        console.log("  displayObj.dataFilters.zones: ", displayObj.dataFilters.zones);
    }

    // ======= ======= ======= loadAutoComplete ======= ======= =======
    SchoolsCollection.prototype.loadAutoComplete = function() {
        console.log("loadAutoComplete");

        var self = this;

        if ((displayObj.displayMode == "storyMap")  || (displayObj.displayMode == "toolMap")) {
            var websitePrefix = "prototypes/filter-map/";
        } else {
            var websitePrefix = "";
        }
        // var url = "Data_Schools/DCSchools_FY1415_Master_321.csv"
        // var url = "../../DCSchools_FY1415_Master_321.csv ";
        // var url = "https://rawgit.com/codefordc/school-modernization/master/Output%20Data/DCSchools_FY1415_Master_46.csv";
        var url = "https://rawgit.com/codefordc/school-modernization/master/Output%20Data/DCSchools_FY1415_Master_412.csv";

        // ======= get selected data =======
        $.ajax({
            // url: "Data_Schools/DC_OpenSchools_Master_214.csv",
            url: url,
            method: "GET",
            dataType: "text"
        }).done(function(textData) {
            console.log("*** ajax success ***");
            console.dir(textData);
            jsonData = CSV2JSON(textData);
            console.dir(jsonData);
            displayObj.makeSelectBox(jsonData);
            displayObj.makeSearchAndHoverDisplay();

            // == store school json data
            self.jsonData = jsonData;

            // == get school names
            displayObj.schoolNamesArray = [];
            for (var i = 0; i < jsonData.length - 1; i++) {
                var filterFlagCount = 0;

                // == level filter
                nextSchool = jsonData[i];
                if (nextSchool) {
                    displayObj.schoolNamesArray.push(processSchoolName(nextSchool.School))
                }
            }
            initAutoComplete(displayObj);

        // == errors/fails
        }).fail(function(){
            console.log("*** ajax fail ***");
        }).error(function() {
            console.log("*** ajax error ***");
        });
    }



    // ======= ======= ======= ======= ======= ZONE LAYER ======= ======= ======= ======= =======
    // ======= ======= ======= ======= ======= ZONE LAYER ======= ======= ======= ======= =======
    // ======= ======= ======= ======= ======= ZONE LAYER ======= ======= ======= ======= =======



    ZonesCollection.prototype.makeZoneLayer = function() {
        console.log("\n----- makeZoneLayer -----");

        var self = this;
        var colorIndex = -1;
        var featureIndex = -1;
        var itemOpacity = 0.5;
        var strokeColor = "purple";
        var strokeWeight = 2;
        var itemColor, itemOpacity, centerLatLng, zoneName;

        // ======= ======= ======= cleanup ======= ======= =======
        de_activateZoneListeners(this);
        var featureCount = 0
        map.data.forEach(function(feature) {
            if (feature) {
                featureCount++;
                itemName = feature.getProperty('itemName');
                map.data.remove(feature);
            }
        });
        this.zoneFeaturesArray = [];

        // ======= ======= ======= add single or merged geoJson to map ======= ======= =======
        zoneAcount = this.zoneGeojson_A.features.length;
        if (this.zoneGeojson_AB) {
            map.data.addGeoJson(this.zoneGeojson_AB);
            zoneBcount = this.zoneGeojson_B.features.length;
        } else {
            map.data.addGeoJson(this.zoneGeojson_A);
            zoneBcount = 0;
        }

        // ======= ======= ======= calculate min, max, increment, average, median ======= ======= =======
        if (displayObj.dataFilters.expend) {
            this.dataIncrement = doTheMath(this, displayObj);
        }

        // ======= FEATURES DATA LOOP =======
        map.data.forEach(function(feature) {
            featureIndex++;

            // ======= get and validate name for each feature =======
            zoneName = removeAbbreviations(feature.getProperty('NAME'))

            // ======= get center lat lng of feature =======
            centerLatLng = makeZoneGeometry(feature);

            // ======= set feature properties =======
            feature.setProperty('itemName', zoneName);
            feature.setProperty('center', centerLatLng);
            feature.setProperty('index', featureIndex);

            // ======= store feature properties =======
            self.zoneFeaturesArray.push(feature);
        });
        console.log("*** new features Ct ", self.zoneFeaturesArray.length);

        // ======= FEATURES FORMATTING LOOPS =======
        var featureIndex = -1;
        var dataDelayCount = 0;
        if (zoneBcount > 0) {

            // == elementary or middle school zones in feeder areas
            console.log("*** LOWER ZONES ***");
            for (var i = 0; i < zoneBcount; i++) {
                var start = new Date().getTime();
                feature = self.zoneFeaturesArray[i];
                nextName = feature.getProperty('itemName');
                featureIndex++;

                zoneFormatArray = getZoneFormat(self, displayObj, featureIndex, nextName, "lower");

                feature.setProperty('itemColor', zoneFormatArray[0]);
                feature.setProperty('strokeColor', zoneFormatArray[1]);
                feature.setProperty('strokeWeight', zoneFormatArray[2]);
                feature.setProperty('itemOpacity', zoneFormatArray[3]);

                setFeatureStyle(feature);

                var end = new Date().getTime();
                var time = end - start;
                if (time > 0) {
                    dataDelayCount++;
                }
            }

            // == feeder zones or wards
            console.log("*** UPPER ZONES ***");
            for (var i = zoneBcount; i < self.zoneFeaturesArray.length; i++) {
                var start = new Date().getTime();
                feature = self.zoneFeaturesArray[i];
                nextName = feature.getProperty('itemName');
                featureIndex++;

                zoneAIndex = featureIndex - zoneBcount;
                zoneFormatArray = getZoneFormat(self, displayObj, zoneAIndex, nextName, "upper");

                feature.setProperty('itemColor', zoneFormatArray[0]);
                feature.setProperty('strokeColor', zoneFormatArray[1]);
                feature.setProperty('strokeWeight', zoneFormatArray[2]);
                feature.setProperty('itemOpacity', zoneFormatArray[3]);

                setFeatureStyle(feature);

                var end = new Date().getTime();
                var time = end - start;
                if (time > 0) {
                    dataDelayCount++;
                }
            }

        // == single zone layer
        } else {
            for (var i = 0; i < self.zoneFeaturesArray.length; i++) {
                var start = new Date().getTime();
                feature = self.zoneFeaturesArray[i];
                nextName = feature.getProperty('itemName');
                featureIndex++;
                colorIndex++;

                zoneFormatArray = getZoneFormat(self, displayObj, featureIndex, nextName, "single");

                feature.setProperty('itemColor', zoneFormatArray[0]);
                feature.setProperty('strokeColor', zoneFormatArray[1]);
                feature.setProperty('strokeWeight', zoneFormatArray[2]);
                feature.setProperty('itemOpacity', zoneFormatArray[3]);

                setFeatureStyle(feature);

                var end = new Date().getTime();
                var time = end - start;
                if (time > 0) {
                    dataDelayCount++;
                }
            }
        }

        // ======= ======= ======= setFeatureStyle ======= ======= =======
        function setFeatureStyle(feature) {
            // console.log("setFeatureStyle");

            // ======= colorize each feature based on colorList =======
            map.data.setStyle(function(feature) {
                var nextColor = feature.getProperty('itemColor');
                var strokeColor = feature.getProperty('strokeColor');
                var strokeWeight = feature.getProperty('strokeWeight');
                var nextOpacity = feature.getProperty('itemOpacity');
                return {
                  fillColor: nextColor,
                  strokeColor: strokeColor,
                  strokeWeight: strokeWeight,
                  fillOpacity: nextOpacity
                };
            });
        }

        // ======= ======= ======= show rankings chart ======= ======= =======
        if ((displayObj.dataFilters.levels) || (displayObj.dataFilters.zones)) {
            if (displayObj.dataFilters.expend) {
                makeRankChart(zonesCollectionObj, schoolsCollectionObj, displayObj, zoneBcount);
            } else {
                console.log("  displayObj.displayMode: ", displayObj.displayMode);
                if (displayObj.displayMode == "storyMap") {
                    var chartHtml = "<div id='chart'>&nbsp;</div>";
                    $("#chart-container").append(chartHtml);
                }
            }
        }
    }

    // ======= ======= ======= activateZoneListeners ======= ======= =======
    ZonesCollection.prototype.activateZoneListeners = function() {
        console.log("activateZoneListeners");
        console.log("  this.zoneA: ", this.zoneA);

        var self = this;
        var zoneA = this.zoneA;

        // ======= ======= ======= mouseover ======= ======= =======
        var zoneMouseover = map.data.addListener('mouseover', function(event) {
            // console.log("--- mouseover ---");
            var itemName = event.feature.getProperty('itemName');
            updateHoverText(itemName);
            displayFilterMessage("Select zone or school");
            if (map.get('clickedZone')!= event.feature ) {
                map.data.overrideStyle(event.feature, {
                    fillColor: "white",
                    fillOpacity: 0.5,
                    strokePosition: "center",
                    strokeWeight: 8
                });
            }
        });

        // ======= ======= ======= mouseout ======= ======= =======
        var zoneMouseout = map.data.addListener('mouseout', function(event) {
            // console.log("--- mouseout ---");
            var featureIndex = event.feature.getProperty('index');
            var itemColor = event.feature.getProperty('itemColor');
            if (map.get('clickedZone')!= event.feature ) {
                map.data.overrideStyle(event.feature, {
                    fillColor: itemColor,
                    strokeWeight: 1
                });
            }
            updateHoverText(null);
        });

        // ======= ======= ======= click ======= ======= =======
        var zoneMouseClick = map.data.addListener('click', function(event) {
            console.log("\n======= select zone =======");

            // == identify clicked zone from zone name value
            var zoneName = event.feature.getProperty('NAME');
            var checkZone = zoneName.indexOf(", ");
            if (checkZone > -1) {
                splitZoneName = zoneName.split(", ");
                var zoneName = splitZoneName[0];
            }

            // == set new zone info on menuObject
            displayObj.dataFilters.selectedZone = zoneName;
            updateHoverText(zoneName);
            displayFilterMessage(displayObj, zoneName, "add");
            de_activateZoneListeners(self);
            zonesCollectionObj.getZoneData();
        });

        // == add listeners to listeners array
        this.mapListenersArray.push(zoneMouseover);
        this.mapListenersArray.push(zoneMouseout);
        this.mapListenersArray.push(zoneMouseClick);

        // ======= ======= ======= zoomToZone ======= ======= =======
        function zoomToZone(event) {
            console.log("zoomToZone");
            var clickedZone = map.get('clickedZone');
            if (clickedZone && clickedZone != event.feature) {
                map.data.revertStyle(clickedZone);
            }
            map.set('clickedZone', event.feature);
            map.data.overrideStyle(event.feature, {
                fillOpacity: 0.9,
                fillColor: "gray",
                strokeWeight: 4
            });

            var bounds = new google.maps.LatLngBounds();
            var center = bounds.getCenter();
            processPoints(event.feature.getGeometry(), bounds.extend, bounds);
            map.fitBounds(bounds);
        }

        // ======= ======= ======= processPoints ======= ======= =======
        function processPoints(geometry, callback, thisArg) {
            if (geometry instanceof google.maps.LatLng) {
                callback.call(thisArg, geometry);
            } else if (geometry instanceof google.maps.Data.Point) {
                callback.call(thisArg, geometry.get());
            } else {
                geometry.getArray().forEach(function(g) {
                    processPoints(g, callback, thisArg);
                });
            }
        }
    }



    // ======= ======= ======= ======= ======= SCHOOLS LAYER ======= ======= ======= ======= =======
    // ======= ======= ======= ======= ======= SCHOOLS LAYER ======= ======= ======= ======= =======
    // ======= ======= ======= ======= ======= SCHOOLS LAYER ======= ======= ======= ======= =======

    // ======= ======= ======= makeSchoolLayer ======= ======= =======
    SchoolsCollection.prototype.makeSchoolLayer = function() {
        console.log("\n----- makeSchoolLayer -----");

        var selectedSchoolsArray = this.selectedSchoolsArray;

        // ======= clear existing listeners if any =======
        removeMarkers(this);

        // == get data to load on markers
        for (var i = 0; i < selectedSchoolsArray.length; i++) {
            nextSchoolData = selectedSchoolsArray[i];
            schoolMarker = null;
            nextSchool = nextSchoolData.schoolName;
            nextSchoolCode = nextSchoolData.schoolCode;
            nextSchoolType = nextSchoolData.schoolAgency;
            nextSchoolAddress = nextSchoolData.schoolAddress;
            unqBuilding = nextSchoolData.unqBuilding;
            nextLat = nextSchoolData.schoolLAT;
            nextLng = nextSchoolData.schoolLON;
            schoolLoc = new google.maps.LatLng(nextLat, nextLng);

            // == set color of school circle
            if (nextSchoolType == "DCPS") {
                fillColor = "#7aa25c";
                strokeColor = "black";
            } else {
                fillColor = "orange";
                strokeColor = "crimson ";
            }

            // == show markers for available data
            if (displayObj.displayMode == "storyMap") {
                var iconSize = 0.15;
            } else {
                var iconSize = 0.2;
            }
            var icon = {
                path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
                fillColor: fillColor,
                strokeColor: strokeColor,
                fillOpacity: 1,
                strokeWeight: 1,
                scale: iconSize
            }

            var schoolMarker = new google.maps.Marker({
                map: map,
                icon: icon,
                title: nextSchool,
                draggable: false,
                position: schoolLoc,
                schoolIndex: i,
                schoolName: nextSchool,
                schoolCode: nextSchoolCode,
                schoolType: nextSchoolType,
                unqBuilding: unqBuilding,
                schoolAddress: nextSchoolAddress,
                defaultColor: fillColor
            });
            schoolMarker.setMap(map);

            // == store marker on chart object
            this.schoolMarkersArray.push(schoolMarker);

            // == activate marker mouseover/mouseout
            this.activateSchoolMarker(schoolMarker, true);
        }

        // == check array content for consistency
        console.log("\n******* ******* arrays check *******");
        console.dir(this.aggregatorArray);
        console.log("  .aggregatorArray: ", zonesCollectionObj.aggregatorArray);
        console.log("  aggregatorArrayCt: ", zonesCollectionObj.aggregatorArray.length);
        console.log("  zoneFeaturesArrayCt: ", zonesCollectionObj.zoneFeaturesArray.length);
        console.log("  selectedSchoolsCt: ", schoolsCollectionObj.selectedSchoolsArray.length);
        console.log("  schoolMarkersArrayCt: ", schoolsCollectionObj.schoolMarkersArray.length);

    }

    // ======= ======= ======= activateSchoolMarker ======= ======= =======
    SchoolsCollection.prototype.activateSchoolMarker = function(schoolMarker, mouseClick) {
        // console.log("activateSchoolMarker");

        // ======= mouseover event listener =======
        google.maps.event.addListener(schoolMarker, 'mouseover', function (event) {
            // console.log("--- mouseover ---");
            var schoolIndex = this.schoolIndex;
            var schoolName = this.schoolName;
            var schoolType = this.schoolType;
            var unqBuilding = this.unqBuilding;
            if (unqBuilding == 2) {
                schoolName = "multiple schools/shared address";
                schoolType = "";
            }
            updateHoverText(schoolName, schoolType);
        });

        // ======= mouseout event listener =======
        google.maps.event.addListener(schoolMarker, 'mouseout', function (event) {
            // console.log("--- mouseout ---");
            updateHoverText(null);
        });

        // ======= click event listener =======
        if (mouseClick == true) {
            google.maps.event.addListener(schoolMarker, 'click', function (event) {
                console.log("--- click ---");
                var schoolIndex = this.schoolIndex;
                var schoolName = this.schoolName;
                var schoolCode = this.schoolCode;
                var unqBuilding = this.unqBuilding;
                console.log("  schoolCode: ", schoolCode);
                if (unqBuilding == 2) {
                    multiSchoolProfile(schoolsCollectionObj, zonesCollectionObj, displayObj, null, schoolIndex);
                } else {
                    makeSchoolProfile(schoolsCollectionObj, zonesCollectionObj, displayObj, null, schoolIndex);
                }
            });
        }
    }

    // ======= ======= ======= setFilterSelections ======= ======= =======
    function setFilterSelections(agency, levels, expend, zones, math, presetMode) {
        console.log("******* setFilterSelections *******");

        // == pre-defined filter settings for introductory map displays
        displayObj.displayMode = presetMode;
        clearFilterSelctions();
        updateHoverText(null);
        initMap(zonesCollectionObj, displayObj);

        // == agency
        if (agency) {
            displayObj.dataFilters.agency = agency;
            if (zonesCollectionObj.aggregatorArray.length > 0) {
                clearZoneAggregator();
            }
        }

        // == levels
        if (levels) {
            displayObj.dataFilters.levels = levels;
            zonesCollectionObj.aggregatorArray = [];
            if (levels == "HS") {
                zonesCollectionObj.zoneA = "FeederHS";
            } else if (levels == "MS") {
                zonesCollectionObj.zoneA = "FeederMS";
            } else if (levels == "ES") {
                zonesCollectionObj.zoneA = "Elementary";
            } else {
                zonesCollectionObj.zoneA = "Ward";
            }
        }

        // == expend
        if (expend) {
            displayObj.dataFilters.expend = expend;
            if (zonesCollectionObj.aggregatorArray.length > 0) {
                clearZoneAggregator();
            }
        }

        // == zones
        if (zones) {
            zonesCollectionObj.zoneA = zones;
            displayObj.dataFilters.zones = zones;
            zonesCollectionObj.aggregatorArray = [];
        }

        // == math
        if (math) {
            console.log("math filter");
            displayObj.dataFilters.math = math;
        }

        updateHoverText(null);
        checkFilterSelection(displayObj, zonesCollectionObj);
        zonesCollectionObj.getZoneData();
    }



    // ======= ======= ======= ======= ======= INIT ======= ======= ======= ======= =======
    // ======= ======= ======= ======= ======= INIT ======= ======= ======= ======= =======
    // ======= ======= ======= ======= ======= INIT ======= ======= ======= ======= =======

    initMenuObjects();
    initDataObjects();
    displayObj.displayMode = presetMode;
    initMap(zonesCollectionObj, displayObj);
    console.log("  displayObj.displayMode: ", displayObj.displayMode);

    if (displayObj.displayMode != "storyMap") {
        this.jsonData = null;
        displayObj.activateFilterMenus();
        displayObj.activateClearButton();
        setMenuState(displayObj, displayObj.agencyMenu, ["A", "A", "S"]);
        setMenuState(displayObj, displayObj.zonesMenu, ["S", "A", "A"]);
        schoolsCollectionObj.loadAutoComplete();
        checkFilterSelection(displayObj, zonesCollectionObj, "init");
        zonesCollectionObj.getZoneData();
    }

    // == see getZoneData for parameter values
    return setFilterSelections;
}
