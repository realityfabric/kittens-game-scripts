var debug_on = false; // set to true to enable console logs

//base resources
var catnip = gamePage.resPool.get('catnip');
var wood = gamePage.resPool.get('wood');
var science = gamePage.resPool.get('science');
var catpower = gamePage.resPool.get('manpower');
var minerals = gamePage.resPool.get('minerals');

var iron = gamePage.resPool.get('iron');
var gold = gamePage.resPool.get('gold');
var coal = gamePage.resPool.get('coal');
var titanium = gamePage.resPool.get('titanium');

var culture = gamePage.resPool.get('culture');
var faith = gamePage.resPool.get('faith');

//luxury resources
var furs = gamePage.resPool.get('furs');
var ivory = gamePage.resPool.get('ivory');

//books
var parchment = gamePage.resPool.get('parchment');
var manuscript = gamePage.resPool.get('manuscript');
var compendium = gamePage.resPool.get('compedium');
var blueprint = gamePage.resPool.get('blueprint');

//misc
var oil = gamePage.resPool.get('oil');
var tanker = gamePage.resPool.get('tanker');

var buildpriority = undefined;

var parchmentMin = 1000;
var manuscriptMin = 500;
var compediumMin = 250;

var timer = 30000;

var maxTit = true;
var maxIron = true;
var maxOil = true;
var maxMag = true;

var resetTimer = function (time) {
	timer = time;
	
	clearInterval(autoBuild);
	autoBuild = setInterval(build, timer);
	
	clearInterval(autoMax);
	autoMax = setInterval(function () {
		maxTit();
		maxOil();
		maxIron();
	}, timer / 2);
}

var deadKittens = gamePage.deadKittens;

deadKittensCheck = setInterval(function() {
    if (gamePage.deadKittens > deadKittens) {
        gamePage.isPaused = true;

        alert("Kittens are dying! Take preventative measures.");
    }
}, 200);

var tiers_base = [
	['field','mine','lumberMill','smelter','tradepost'], //buildings which increase production efficiency but that don’t require crafted materials
	['logHouse','library','academy','barn','hut'], //buildings which increase storage capacity but that don’t require crafted materials
	['workshop'], //buildings which increase craft efficiency but that don’t require crafted materials
	['amphitheatre','accelerator','chapel'], //buildings which increase production efficiency that do require crafted materials, but that have at least one uncrafted material cost
	['pasture'], //buildings which produce energy that don't require crafts
	['aqueduct'], //buildings which produce energy that do require crafts
	['factory', 'biolab'], //buildings which increase craft efficiency that do require crafted materials, but that have at least one uncrafted material cost
	['observatory', 'temple'], //buildings which increase storage capacity which do require crafted materials, but that have at least one uncrafted material cost
	['harbor','warehouse',]
];

var tiers_energy = [['reactor','aqueduct','magneto','pasture']];

var tiers = tiers_base;

var checkTier = function () {
	var affordable = function (building) {
		if (debug_on) console.log("Checking affordability of " + building);
		var cost = gamePage.bld.getPrices(building);
		var flag = true;
		
		for (var i = 0; i < cost.length; i++) {
			var resource = gamePage.resPool.get(cost[i].name);
			if (resource.maxValue != 0 && cost[i].val > resource.maxValue) {
				flag = false;
			}
		}
		
		if (debug_on) {
			if (flag) console.log("Affordable: " + building);
		}

		return flag;
	}
	
	var prev_tier_unaffordable = true;
	
	for (var tier_level = 0; tier_level < tiers.length; tier_level++) {
		if (prev_tier_unaffordable) {
			for (var index = 0; index < tiers[tier_level].length; index++) {
				var building = gamePage.bld.get(tiers[tier_level][index]);
				
				if (building.unlocked && affordable(building.name)) {
					prev_tier_unaffordable = false;
				}
			}
			
			if (!prev_tier_unaffordable) {
				return tiers[tier_level];
			}
		} 
	}
}

var nextAff = function (building) {
    var cost = gamePage.bld.getPrices(building);
    var costRatio = gamePage.bld.getPriceRatio(building);
    var flag = true;

    for (var i = 0; i < cost.length; i++) {
        if (gamePage.resPool.get(cost[i].name).maxValue != 0
        && gamePage.resPool.get(cost[i].name).maxValue < cost[i].val * costRatio) {
            flag = false;
        }
    }

    return flag;
}

//var scienceGoals = [];

var trade = function() { //https://www.reddit.com/r/kittensgame/comments/2eqlt5/a_few_kittens_game_scripts_ive_put_together/ckai0yc
	var races = gamePage.diplomacyTab.racePanels;
	
	var zebras = false;
	var zIndex;
	
	for (var i = 0; i < races.length; i++) {
		if (races[i].name == "Dragons") {
			zebras = true;
			zIndex = i;
		}
	}
	
	var tab = gamePage.activeTabId;
	if (gamePage.activeTabId != 'Trade') {
		gamePage.activeTabId = "Trade"
		gamePage.render();
	}
		gamePage.diplomacyTab.racePanels[zIndex].tradeBtn.tradeAll();
	if (tab != 'Trade') {
		gamePage.activeTabId = tab;
		gamePage.render();
	}
	
	
}

autoPray = setInterval(function() { //https://www.reddit.com/r/kittensgame/comments/2eqlt5/a_few_kittens_game_scripts_ive_put_together/
	if (gamePage.isPaused) { return; }
    var origTab = gamePage.activeTabId;

    if (faith.value / faith.maxValue > 0.95) {
        gamePage.activeTabId = 'Religion'; gamePage.render();
        $(".btnContent:contains('Praise the sun')").click();
        gamePage.activeTabId = origTab; gamePage.render();
    }
}, 10 * 1000);

starClick = setInterval(function() { $("#gameLog").find("input").click(); }, 2 * 1000); //https://www.reddit.com/r/kittensgame/comments/2eqlt5/a_few_kittens_game_scripts_ive_put_together/

var craftCatnip = function() { //https://www.reddit.com/r/kittensgame/comments/2eqlt5/a_few_kittens_game_scripts_ive_put_together/
	if (gamePage.isPaused) { return; }
	
    var calendar = gamePage.calendar;

    //run only if not losing stock
    //run only if near max
    //converts 9.9% of stock to wood
    if (catnip.perTickUI < 0) { return; }
    if (catnip.value / catnip.maxValue < 0.999) { return; }  
    gamePage.craft('wood', catnip.maxValue * 0.01 / 50);
}

var craft = function() { //https://www.reddit.com/r/kittensgame/comments/2eqlt5/a_few_kittens_game_scripts_ive_put_together/
	if (gamePage.isPaused) { return; }
	
	if (debug_on) console.log ("craft()");
	
    var resources = [
        ["wood",     "beam" ],
        ["minerals", "slab" ],
        ["coal",     "steel"],
        ["iron",     "plate"],
        ["titanium", "alloy"]
    ];
    
    var affordable = function (craft) {
		if (debug_on) console.log ("Checking affordability of " + craft);
		
		var cost = gamePage.workshop.getCraft(craft).prices;
		var flag = true;
		
		for (var i = 0; i < cost.length; i++) {
			var resource = gamePage.resPool.get(cost[i].name);
			if ((resource.maxValue != 0 
			&& cost[i].val > resource.maxValue)
			|| cost[i].val > resource.value) {
				flag = false;
				
				if (debug_on) console.log ("Craft is not affordable due to " + cost[i].name);
			}
		}

		return flag;
	}

    for (var i = 0; i < resources.length; i++) {
        var curRes = gamePage.resPool.get(resources[i][0]);
        if (curRes.value / curRes.maxValue > 0.999
         && gamePage.workshop.getCraft(resources[i][1]).unlocked
         && affordable(resources[i][1])) {
            gamePage.craft(resources[i][1], 1);
            
            if (debug_on) console.log ("Crafting 1 " + resources[i][1]);
        } else {
			if (debug_on) console.log ("Could not craft " + resources[i][1]);
		}
    }
}

var hunt = function() { //https://www.reddit.com/r/kittensgame/comments/2eqlt5/a_few_kittens_game_scripts_ive_put_together/
	if (gamePage.isPaused) { return; }
    
    if (catpower.value / catpower.maxValue > 0.95) {
        $("a:contains('Send hunters')").click();
	}
}

var books = function () { //https://www.reddit.com/r/kittensgame/comments/2eqlt5/a_few_kittens_game_scripts_ive_put_together/
	if (gamePage.isPaused) { return; }
	
	if (gamePage.workshop.getCraft('parchment').unlocked){ 
		gamePage.craftAll('parchment');
	}
	if (gamePage.workshop.getCraft('manuscript').unlocked) { 
		if (parchment.value > 10025 && culture.value > 400) {
			gamePage.craft('manuscript', 1);
		} // gamePage.craftAll('manuscript');
	}
	if (gamePage.workshop.getCraft('compedium').unlocked) {
		if (manuscript.value > 5050 && science.value > 10000) {
			gamePage.craft('compedium', 1);
		} // gamePage.craftAll('compedium');
	}
	if (gamePage.workshop.getCraft('blueprint').unlocked) {
		if (compendium.value > 2575 && science.value > 25000)  {
			gamePage.craft('blueprint', 1);
		}// gamePage.craftAll('blueprint');
	}
}

var aff = function (building, num) {
	var bld = gamePage.bld.get(building);
	var value = bld.val + num;
	var cost = gamePage.bld.getPrices(building);
	var priceRatio;
	
	if (bld.stages != undefined) {
		priceRatio = bld.stages[bld.stage].priceRatio;
	} else {
		priceRatio = bld.priceRatio;
	}
	
	var flag = true;
	
	for (var i = 0; i < cost.length; i++) {
        if (gamePage.resPool.get(cost[i].name).maxValue != 0
        && gamePage.resPool.get(cost[i].name).maxValue < cost[i].val * Math.pow(priceRatio, num)) {
            flag = false;
        }
        
        if (debug_on) console.log (flag + " / " + priceRatio + " / " + gamePage.resPool.get(cost[i].name).maxValue + " / " + cost[i].val * Math.pow(priceRatio, num));
    }

	

    return flag;
}

var numAffordable = function (building) {
    var more = {num: 0, totalCost: [{}]};
    var cost = gamePage.bld.getPrices(building);
    var bld = gamePage.bld.get(building);
    
    if (bld.stages != undefined) {
		priceRatio = bld.stages[bld.stage].priceRatio;
	} else {
		priceRatio = bld.priceRatio;
	}
    
    more.totalCost = cost;
    
    for (var i = 0; i < 100; i++) {
		if (aff(building, more.num)) {
			if (i > 0) {
				for (var j = 0; j < more.totalCost.length; j++) {
					more.totalCost[j].val += cost[j].val * Math.pow(priceRatio, more.num);
				}
			}
			more.num++;
		} else {
			return more;
		}
	}

	return more;
}

var balance = function() {
	if (gamePage.isPaused) { return;}
	
	
	
	var kittens = gamePage.village.getKittens();
	var freeKittens = kittens; //later in the function this will be modified
	var craftRatio = 1 + gamePage.bld.effectsCached.craftRatio;
	var huntRatio = 1;
	
	var upgrades = gamePage.workshop.upgrades;
	var availableUpgrades  = [];
	
	for (var i = 0; i < upgrades.length; i++) {
		if (upgrades[i].researched) {
			availableUpgrades.push(upgrades[i]);
			
			if (upgrades[i].name == "bolas") {
				huntRatio += 1;
			}
			else if (upgrades[i].name == "huntingArmor") {
				huntRatio += 2;
			}
			else if (upgrades[i].name == "steelArmor") {
				huntRatio += 0.5;
			}
			else if (upgrades[i].name == "alloyArmor") {
				huntRatio += 0.5;
			}
			else if (upgrades[i].name == "nanosuits") {
				huntRatio += 0.5;
			}
		}
	}
	
	var jobs = [
		{name: 'woodcutter', unlocked: false, value: 0, resources: ['wood']},
		{name: 'farmer', unlocked: false, value: 0, resources: ['catnip']},
		{name: 'scholar', unlocked: false, value: 0, resources: ['science']},
		{name: 'hunter', unlocked: false, value: 0, resources: ['manpower']},
		{name: 'miner', unlocked: false, value: 0, resources: ['minerals']},
		{name: 'priest', unlocked: false, value: 0, resources: ['faith']},
		{name: 'geologist', unlocked: false, value: 0, resources: ['coal','gold']},
	];
	
	var automation = [
		{name: 'smelter', unlocked: false, value: 0, on: 0, resources: ['iron', 'gold','coal', 'titanium']},
		{name: 'calciner', unlocked: false, value: 0, on: 0, resources: ['titanium', 'iron']},
		{name: 'oilWell', unlocked: false, value: 0, on: 0, resources: ['oil']},
		{name: 'mint', unlocked: false, value: 0, on: 0, resources: ['manpower']}
	];
	
	var getJob = function (jobName) {
		for (var i = 0; i < jobs.length; i++) {
			if (jobs[i].name == jobName) {
				return jobs[i];
			}
		}
	}
	
	var getAutomation = function (automationName) {
		for (var i = 0; i < automation.length; i++) {
			if (automation[i].name == automationName) {
				return automation[i];
			}
		}
	}
	
	var resources = [
		{name: 'catnip', value: catnip.value, need: 0, perTick: catnip.perTickUI, gatherable: jobs[1].unlocked},
		{name: 'wood', value: wood.value, need: 0, perTick: wood.perTickUI, gatherable: jobs[0].unlocked},
		{name: 'minerals', value: minerals.value, need: 0, perTick: minerals.perTickUI, gatherable: jobs[4].unlocked},
		{name: 'coal', value: coal.value, need: 0, perTick: coal.perTickUI, gatherable: jobs[6].unlocked},
		{name: 'manpower', value: catpower.value, need: 0, perTick: catpower.perTickUI, gatherable: jobs[3].unlocked},
		{name: 'science', value: science.value, need: 0, perTick: science.perTickUI, gatherable: jobs[2].unlocked},
		{name: 'faith', value: faith.value, need: 0, perTick: faith.perTickUI, gatherable: jobs[2].unlocked},
		{name: 'iron', value: iron.value, need: 0, perTick: iron.perTickUI, gatherable: false},
		{name: 'titanium', value: titanium.value, need: 0, perTick: titanium.perTickUI, gatherable: false},
		{name: 'gold', value: gold.value, need: 0, perTick: gold.perTickUI, gatherable: false},
		{name: 'oil', value: oil.value, need: 0, perTick: oil.perTickUI, gatherable: false},
		{name: 'ivory', value: ivory.value, need: 0, perTick: ivory.perTickUI, gatherable: false}
	];
	
	var getResource = function (resourceName) {
		for (var i = 0; i < resources.length; i++) {
			if (resources[i].name == resourceName) {
				return resources[i];
			}
		}
	}
	
	for (var i = 0; i < jobs.length; i++) {
		var job = gamePage.village.jobs[i];
		
		jobs[i].unlocked = job.unlocked;
		
		if (debug_on) console.log(jobs[i].name + " unlocked == " + jobs[i].unlocked);
		
		/*if (jobs[i].name == 'farmer' && jobs[i].unlocked) {
			freeKittens--;
			
			if (debug_on) console.log("Reducing freeKittens to " + freeKittens);
			jobs[i].value++;
			if (debug_on) console.log(jobs[i].name + " workers: " + jobs[i].value);
		}*/ // farmers>0
	}
	
	for (var i = 0; i < automation.length; i++) {
		var automated = gamePage.bld.get(automation[i].name);
		
		automation[i].unlocked = automated.unlocked;
		
		if (automation[i].unlocked) {
			automation[i].value = automated.val;
			
			if (automation[i].value != 0 && (automation[i].on + 1 <= automation[i].value)) {
				automation[i].on++;
			}
		}
	}
	
	var setPerTick = function () {
		for (var i = 0; i < resources.length; i++) {
			resources[i].perTick = gamePage.resPool.get(resources[i].name).perTickUI;
			
			if (debug_on) console.log(resources[i].name + " perTick: " + resources[i].perTick);
		}
	}
	
	//setPerTick();
	
	var affordable = function (building) {
		if (debug_on) console.log("Checking affordability of " + building);
		
		var cost = gamePage.bld.getPrices(building);
		var flag = true;
		
		for (var i = 0; i < cost.length; i++) {
			var resource = gamePage.resPool.get(cost[i].name);
			if (resource.maxValue != 0 && cost[i].val > resource.maxValue) {
				flag = false;
				break;
			}
		}
		
		if (debug_on) {
			if (flag) console.log("Affordable: " + building);
		}

		return flag;
	}
	
	var convertCost = function (price) {
		switch (price.name) {
			case 'catnip':
				resources[0].need += price.val;
				break;
			case 'wood':
				resources[1].need += price.val;
				break;
			case 'minerals':
				resources[2].need += price.val;
				break;
			case 'coal':
				resources[3].need += price.val;
				break;
			case 'manpower':
				resources[4].need += price.val;
				break;
			case 'furs':
				resources[4].need += price.val * (100 / (32.5 * huntRatio));
				break;
			case 'science':
				resources[5].need += price.val;
				break;
			case 'faith':
				resources[6].need += price.val;
				break;
			case 'iron':
				//i'm not sure if this will work properly, but i added it to make sure that when iron is needed minerals are produced, since iron production consumes minerals... this should help to balance that out
				resources[1].need += price.val * ((1/(1+Math.pow(Math.E,resources[1].perTick)))/(1/1+Math.pow(Math.E,resources[7].perTick)));
				resources[2].need += price.val * ((1/(1+Math.pow(Math.E,resources[2].perTick)))/(1/1+Math.pow(Math.E,resources[7].perTick)));
				resources[7].need += price.val;
				break;
			case 'titanium':
				resources[2].need += price.val * ((1/(1+Math.pow(Math.E,resources[2].perTick)))/(1/1+Math.pow(Math.E,resources[8].perTick)));
				resources[10].need += price.val * ((1/(1+Math.pow(Math.E,resources[10].perTick)))/(1/1+Math.pow(Math.E,resources[8].perTick)));
				resources[3].need += price.val * ((1/(1+Math.pow(Math.E,resources[3].perTick)))/(1/1+Math.pow(Math.E,resources[8].perTick)));
				resources[8].need += price.val;
				break;
			case 'gold':
				resources[9].need += price.val;
				break;
			case 'oil':
				resources[10].need += price.val;
				break;
			case 'culture':
			case 'starchart':
			case 'spice':
			case 'unicorns':
			case 'alicorn':
			case 'necrocorn':
			case 'tears':
			case 'karma':
			case 'paragon':
			case 'kittens':
			case 'zebras':
			case 'antimatter':
			case 'timeCrystal':
			case 'sorrow':
			case 'energy':
			case 'unobtainium':
			case 'uranium':
				break; //do nothing
			default:
				var resource = gamePage.resPool.get(price.name);
				if (resource.craftable) {
					var resCost = gamePage.workshop.getCraft(price.name).prices;
					
					for (var i = 0; i < resCost.length; i++) {
						for (var j = 0; j < Math.ceil(resCost[i].val / craftRatio); j++) {
							convertCost(resCost[i]);
						}
					}
				}
				break;
		}
	}
	
	var tickValue = function (resource) { //converts per tick to a value between 0 and 1, the smaller the perTickValue the larger the tickValue result
		if (debug_on) {
			console.log("Tick Value");
			console.log (resource);
		}
		if (resource.need - resource.value > 0 
		&& gamePage.resPool.get(resource.name).maxValue != 0
		&& resource.value < gamePage.resPool.get(resource.name).maxValue) {
			return (1/(1+Math.pow(Math.E,resource.perTick)) * (resource.need - resource.value)); //thanks to Tim
		} else {
			return 0;
		}
		
	}
	
	var totalTickValue = function (allocation) {
		if (debug_on) console.log("Total Tick Value");
		
		var total = 0;
		
		if (allocation == 'jobs') {
			for (var i = 0; i < jobs.length; i++) {
				if (jobs[i].unlocked) {
					for (var j = 0; j < jobs[i].resources.length; j++) {
						if (debug_on) console.log ('totalTickValue ' + jobs[i].resources[j]);
						
						total += tickValue(getResource(jobs[i].resources[j]));
					}
				}
			}
		}
		else if (allocation == 'automation') {
			for (var i = 0; i < automation.length; i++) {
				for (var j = 0; j < automation[i].resources.length; j++) {
					if (automation[i].unlocked) {
						total += tickValue(getResource(automation[i].resources[j]));
					}
				}
			}
		}
		
		if (debug_on) console.log("Total: " + total);
		return total;
	}
	
	var assignJobs = function () {
		if (debug_on) console.log("Assigning jobs");
		gamePage.village.clearJobs();
		for (var i = 0; i < jobs.length; i++) {
			for (var j = 0; j < jobs[i].value; j++) {
				if (gamePage.village.getJob(jobs[i].name).unlocked) {
					gamePage.village.sim.assignJob(jobs[i].name);
					gamePage.village.getJob(jobs[i].name).value++;
				}
			}
		}
	}
	
	var setAutomation = function () {
		for (var i = 0; i < automation.length; i++) {
			automated = gamePage.bld.get(automation[i].name);
			
			if (automated.unlocked) {
				automated.on = automation[i].on;
			}
		}
	}
	
	var prev_tier_unaffordable = true;
	
	for (var tier_level = 0; tier_level < tiers.length; tier_level++) {
		if (prev_tier_unaffordable) {
			for (var index = 0; index < tiers[tier_level].length; index++) {
				var building = gamePage.bld.get(tiers[tier_level][index]);
				
				if (building.unlocked && affordable(building.name)) {
					prev_tier_unaffordable = false;
					
					var cost = numAffordable(building.name).totalCost;
					
					for (var c_index = 0; c_index < cost.length; c_index++) {
						convertCost(cost[c_index]);
					}
				}
			}
		}
	}
	
	for (var i = 0; i < availableUpgrades.length; i++) {
		var flag = true;
		for (var j = 0; j < availableUpgrades[i].prices.length; j++) {
			var res = gamePage.resPool.get(availableUpgrades[i].prices[j].name);
			
			if (res.maxValue < availableUpgrades[i].prices[j].val) {
				flag = false;
			}
		}
		
		if (flag) {
			for (var j = 0; j < availableUpgrades[i].prices.length; j++) {
				convertCost(availableUpgrades[i].prices[j]);
			}
		}
	}
	
	var oilcap = oil.maxValue;
	convertCost({name: 'tanker', val: ((45000 - oilcap) / 500)});
	
	if (tanker.val < 25) {
		gamePage.craftAll('tanker');
	}
	
	/*
	for (var i = 0; i < scienceGoals.length; i++) {
		var tech = gamePage.science.get(scienceGoals[i]);
		var cost = tech.prices;
		
		for (var c_index = 0; c_index < cost.length; c_index++) {
			convertCost(cost[c_index]);
		}
	}
	*/
	
	for (var i = 0; i < resources.length; i++) {
		var res = gamePage.resPool.get(resources[i].name);
		
		resources[i].value = res.value;
	}
		
		//feeding the populace
		var catnipDemand = catnip.maxValue * .95;
		convertCost({name: 'catnip', val: catnipDemand});
		
		
	assignJobs();
	
	if (getResource('catnip').perTick < 0 && freeKittens > 5) {
		getJob('farmer').value+=5;
		freeKittens-=5;
		assignJobs();
		setPerTick();
		
		if (debug_on) console.log(jobs[i].name + " // " + freeKittens + " // " + getResource(jobs[i].resource).perTick);
	}
	
	for (var i = 0; i < jobs.length; i++) {
		if (totalTickValue('jobs') == 0) {
			if (jobs[i].name != 'scholar') {
				jobs[i].value += Math.floor(freeKittens / 6);
			}
			if (jobs[i].name == 'priest') {
				jobs[i].value += freeKittens%6;
			}
		} else {
			for (var j = 0; j < jobs[i].resources.length; j++) {
				jobs[i].value += Math.floor(freeKittens * tickValue(getResource(jobs[i].resources[j])) / totalTickValue('jobs'));
			}
		}
	}
	
	var sumJobs = 0;
	for (var i = 0; i < jobs.length; i++) {
		sumJobs += jobs[i].value;
	}
	
	if (kittens > sumJobs) {
		getJob('priest').value += (kittens - sumJobs);
	}
	
	for (var i = 0; i < automation.length; i++) {
		for (var j = 0; j < automation[i].resources.length; j++) {
			if (totalTickValue('automation') == 0) {
				//do nothing
			}
			else if (totalTickValue('jobs') == 0) {
				automation[i].on = automation[i].value;
			}
			else {
				automation[i].on += Math.floor(automation[i].value * tickValue(getResource(automation[i].resources[j])) / (totalTickValue('automation') + tickValue(getResource('minerals'))));
				
				if (debug_on) console.log (automation[i].on + " / " + automation[i].value);
				
				if (automation[i].on > automation[i].value) {
					automation[i].on = automation[i].value;
				}
			}
		}
	}
	
	if (debug_on) {
		console.log(jobs[0].name + ": " + jobs[0].value + " | " + jobs[1].name + ": " + jobs[1].value + " | " + jobs[2].name + ": " + jobs[2].value + " | " + jobs[3].name + ": " + jobs[3].value + " | " + jobs[4].name + ": " + jobs[4].value + " | " + jobs[5].name + ": " + jobs[5].value + " | " + jobs[6].name + ": " + jobs[6].value);
		console.log(automation[0].name + ": " + automation[0].on + "/" + automation[0].value + " | " + automation[1].name + ": " + automation[1].on + "/" + automation[1].value);
	}
	
	assignJobs();
	setAutomation();
	
	if (maxTit) {
		gamePage.bld.get('calciner').on = gamePage.bld.get('calciner').val;
	}
	if (maxIron) {
		gamePage.bld.get('smelter').on = gamePage.bld.get('smelter').val;
	}
	if (maxOil) {
		gamePage.bld.get('oilWell').on = gamePage.bld.get('oilWell').val;
	}
	if (maxMag) {
		gamePage.bld.get('magneto').on = gamePage.bld.get('magneto').val;
	}
	
	if (gamePage.bld.get('mint').on < 1) {
		gamePage.bld.get('mint').on = 1;
	}
}

var build = function () {
	if (gamePage.isPaused) { return; }
	
	var buildings = gamePage.bld.meta[0].meta;
	
	/*
	scienceGoals = [];
	var techs = gamePage.science.techs;
	for (var i = 0; i < techs.length; i++) {
		if (techs[i].unlocked && !techs[i].researched) {
			scienceGoals.push(techs[i].name);
		}
	}*/
	
	var upgrades = gamePage.workshop.upgrades;
	var availableUpgrades  = [];
	
	for (var i = 0; i < upgrades.length; i++) {
		if (upgrades[i].unlocked && !upgrades[i].researched) {
			availableUpgrades.push(upgrades[i]);
		}
	}
	
	var affordable = function (building) {
		var cost = gamePage.bld.getPrices(building);
		var flag = true;
		
		for (var i = 0; i < cost.length; i++) {
			var resource = gamePage.resPool.get(cost[i].name);
			if (resource.maxValue != 0 
			&& cost[i].val > resource.maxValue) {
				flag = false;
			}
		}

		return flag;
	}
	
	var getPrice = function (building) {
		return gamePage.bld.getPrices(building);
	}
	
	var craftUp = function (resource) {
		if (gamePage.workshop.getCraft(resource).unlocked == false) { return; }
		
		switch (resource) {
			case "beam":
			case "slab":
			case "plate":
			case "steel":
			case "parchment":
				gamePage.craftAll(resource);
				break;
			case "alloy":
			case "gear":
				gamePage.craftAll(resource);
				craftUp("steel");
				break;
			case "scaffold":
				gamePage.craftAll(resource);
				craftUp("beam");
				break;
			case "concrate":
				gamePage.craftAll(resource);
				craftUp("slab");
				craftUp("steel");
				break;
			case "megalith":
				gamePage.craftAll(resource);
				craftUp("beam");
				craftUp("slab");
				craftUp("plate");
				break;
			case "manuscript":
				gamePage.craftAll(resource);
				craftUp("parchment");
				break;
			case "compedium":
				gamePage.craftAll(resource);
				craftUp("manuscript");
				break;
			case "blueprint":
				gamePage.craftAll(resource);
				craftUp('compedium');
				break;
			default:
				return; //if (resource == "catnip" || resource == "wood"||resource == "minerals" ||resource == "iron" ||resource == "coal" ||resource == "titanium" ||resource == "gold" ||resource == "oil" ||resource == "faith" ||resource == "science" ||resource == "manpower" ||resource == "culture" ||resource == "starchart" ||resource == "furs" ||resource == "ivory" ||resource == "spice"){return;} 
				break;
		}
	}
	
	
	
	var tab = gamePage.activeTabId;
	
	var canBuy = true;
	for (var i = 0; i < availableUpgrades.length; i++) {
		var cost = availableUpgrades[i].prices;
		
		for (var c_index = 0; c_index < cost.length; c_index++) {
			if (cost[c_index].val > gamePage.resPool.get(cost[c_index].name).value) {
				canBuy = false;
				break;
			}
		}
		
		if (canBuy) {
			if (gamePage.activeTabId != "Workshop") {
				gamePage.activeTabId = "Workshop";
				gamePage.render();
			}
			for (var i = 0; i < cost.length; i++) {
				if (gamePage.resPool.get(cost[i].name).maxValue == 0 &&
					gamePage.resPool.get(cost[i].name).value < cost[i].val) {
						craftUp(cost[i].name);	
				}
			}	
			
			var btnstr = ".btnContent:contains('" + availableUpgrades[i].title + "')"; //https://www.reddit.com/r/kittensgame/comments/2jjee9/script_to_auto_build_buildings/clcc5mt
			$(btnstr).click();
		}
	}
	
	var prev_tier_unaffordable = true;
	
	for (var tier_level = 0; tier_level < tiers.length; tier_level++) {
		if (prev_tier_unaffordable) {
			for (var index = 0; index < tiers[tier_level].length; index++) {
				var building = gamePage.bld.get(tiers[tier_level][index]);
				if (buildpriority != undefined) {
					building = gamePage.bld.get(buildpriority);
				}
				if (building.unlocked && affordable(building.name)) {
					prev_tier_unaffordable = false;
					
					var cost = getPrice(building.name);
					for (var i = 0; i < cost.length; i++) {
						if (gamePage.resPool.get(cost[i].name).maxValue == 0 &&
							gamePage.resPool.get(cost[i].name).value < cost[i].val) {
								craftUp(cost[i].name);	
						}
					}
					
					if ((building.name == "hut" || building.name == "logHouse") && gamePage.village.getJob('farmer').unlocked == false) {
						return;
					}
					
					var canBuy = true;
					
					for (var c_index = 0; c_index < cost.length; c_index++) {
						if (cost[c_index].val > gamePage.resPool.get(cost[c_index].name).value) {
							canBuy = false;
						}
					}
					
					if (canBuy) {
						if (gamePage.activeTabId != "Bonfire") {
							gamePage.activeTabId = "Bonfire";
							gamePage.render();
						}
						
						var btnstr = "";
						if (building.stages != undefined) {
							btnstr = ".btnContent:contains('" + building.stages[building.stage].label + "')";
						} else {
							btnstr = ".btnContent:contains('" + building.label + "')";
						}
						$(btnstr).click();
						
						if (building.name == "calciner" && (oil.perTickUI < (1/5) || minerals.perTickUI < (30/5))) {
							if (building.on > 0) {
								building.on--;
							}
						}
						if (building.name == "smelter" 
						&& (wood.perTickUI < (30/5) || minerals.perTickUI < (30/5))
						&& (wood.perTickUI < iron.perTickUI || minerals.perTickUI < iron.perTickUI)) {
							if (building.on > 0) {
								building.on--;
							}
						}
						if (building.name == 'mint' && (gold.perTickUI < (0.1 / 5) || catpower.perTickUI < (10/5))) {
							if (building.on > 0) {
								building.on--;
							}
						}
					}
				}
			}
		}
	}
	
	if (tab != "Bonfire") {
		gamePage.activeTabId = tab;
		gamePage.render();
	}
	
	/*
	for (var i = 0; i < scienceGoals.length; i++) {
		if (tab != 'Science') {
			gamePage.activeTabId = 'Science';
			gamePage.render();
		}
		var tech = gamePage.science.get(scienceGoals[i]);
		
		var cost = tech.prices;
		for (var j = 0; j < cost.length; j++) {
			if (gamePage.resPool.get(cost[j].name).maxValue == 0 &&
				gamePage.resPool.get(cost[j].name).value < cost[j].val) {
					craftUp(cost[j].name);	
			}
		}
		
		btnstr = ".btnContent:contains('" + tech.title + "')";
		$(btnstr).click();
	}*/
	
	if (gamePage.activeTabId != tab) {
		gamePage.activeTabId = tab;
		gamePage.render();
	}
	
	balance();
	

	craft(); craftCatnip(); hunt(); books();
	

}

autoBuild = setInterval(build, timer);

maxTit = function() {
    var bld = gamePage.bld.get('calciner');

    bld.on = bld.val;
}

maxOil = function() {
    var bld = gamePage.bld.get('oilWell');

    bld.on = bld.val;
}

maxIron = function() {
	var bld = gamePage.bld.get('smelter');
	
	bld.on = bld.val;
}

autoMax = setInterval(function() {
	maxTit();
	maxOil();
	maxIron();
}, timer / 2);

var ticksToGoal = function (resource, goal) {
    var res = gamePage.resPool.get(resource);

    if (res.value > goal) {
        if (res.perTickUI < 0) {
            return (goal - res.value) / res.perTickUI;
        } else {
            return Infinity;
        }
        return 0;
    } else {
        if (res.perTickUI > 0) {
            return (goal - res.value) / res.perTickUI;
        } else {
            return Infinity;
        }
    }
}
