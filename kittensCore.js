var buttonClick = function (buttonText) { //https://www.reddit.com/r/kittensgame/comments/2jjee9/script_to_auto_build_buildings/clcc5mt
    $(".btnContent:contains('" + buttonText + "')").click();
}

var linkClick = function (buttonText) {
    $("a:contains('" + buttonText + "')").click();
}

var pray = function () {
    if (gamePage.isPaused) { return; }
    var faith = gamePage.resPool.get('faith');

    if (faith.value / faith.maxValue > 0.95) {
        linkClick("Praise the sun!");
    }
}

var craft = function() { //https://www.reddit.com/r/kittensgame/comments/2eqlt5/a_few_kittens_game_scripts_ive_put_together/
    if (gamePage.isPaused) { return; }

    if (debug_on) console.log ("craft()");

    var resources = [
        ["catnip",   "wood"],
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
        if (curRes.value / curRes.maxValue > 0.9
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
    var catpower = gamePage.resPool.get('manpower');

    if (catpower.value / catpower.maxValue > 0.95) {
        linkClick("Send hunters");
    }
}

var books = function () { //https://www.reddit.com/r/kittensgame/comments/2eqlt5/a_few_kittens_game_scripts_ive_put_together/
    if (gamePage.isPaused) { return; }
    var catpower = gamePage.resPool.get('manpower');
    var culture = gamePage.resPool.get('culture');
    var science = gamePage.resPool.get('science');
    var furs = gamePage.resPool.get('furs');
    var parchment = gamePage.resPool.get('parchment');
    var manuscript = gamePage.resPool.get('manuscript');
    var compendium = gamePage.resPool.get('compedium');
    var blueprint = gamePage.resPool.get('blueprint');
    if (gamePage.workshop.getCraft('parchment').unlocked){
        gamePage.craftAll('parchment');
    }
    if (gamePage.workshop.getCraft('manuscript').unlocked) {
        if (parchment.value > 10025 && culture.value > (culture.maxValue * .9)) {
            gamePage.craft('manuscript', 1);
        } // gamePage.craftAll('manuscript');
    }
    if (gamePage.workshop.getCraft('compedium').unlocked) {
        if (manuscript.value > 5050 && science.value > (science.maxValue * .9)) {
            gamePage.craft('compedium', 1);
        } // gamePage.craftAll('compedium');
    }
    if (gamePage.workshop.getCraft('blueprint').unlocked) {
        if (compendium.value > 2575 && science.value > (science.maxValue * .9))  {
            gamePage.craft('blueprint', 1);
        }// gamePage.craftAll('blueprint');
    }
}
