var tpt = {
    layers: {
        "p": {
            name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
            symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
            position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
            color: "#31aeb0",
            requires: new Decimal(10), // Can be a function that takes requirement increases into account
            resource: "prestige points", // Name of prestige currency
            baseResource: "points", // Name of resource prestige is based on
            baseAmount() { return player.points }, // Get the current amount of baseResource
            type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
            exponent() { return 0.5 }, // Prestige currency exponent
            gainMult() { // Calculate the multiplier for main currency from bonuses
                let mult = new Decimal(1)
                if (hasAchievement("a", 13)) mult = mult.times(1.1);
                if (hasAchievement("a", 32)) mult = mult.times(2);
                if (hasUpgrade("p", 21)) mult = mult.times(1.8);
                if (hasUpgrade("p", 23)) mult = mult.times(upgradeEffect("p", 23));
                if (hasUpgrade("p", 41)) mult = mult.times(upgradeEffect("p", 41));
                if (hasUpgrade("b", 11)) mult = mult.times(upgradeEffect("b", 11));
                if (hasUpgrade("g", 11)) mult = mult.times(upgradeEffect("g", 11));
                if (player.t.unlocked) mult = mult.times(tmp.t.enEff);
                if (player.e.unlocked) mult = mult.times(tmp.e.buyables[11].effect.first);
                if (player.s.unlocked) mult = mult.times(buyableEffect("s", 11));
                if (hasUpgrade("e", 12)) mult = mult.times(upgradeEffect("e", 12));
                if (hasUpgrade("b", 31)) mult = mult.times(upgradeEffect("b", 31));
                return mult
            },
            gainExp() { // Calculate the exponent on main currency from bonuses
                let exp = new Decimal(1)
                if (hasUpgrade("p", 31)) exp = exp.times(1.05);
                return exp;
            },
            row: 0, // Row the layer is in on the tree (0 is the first row)
            hotkeys: [
                { key: "p", description: "Press P to Prestige.", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
            ],
            layerShown() { return true },
            passiveGeneration() { return (hasMilestone("g", 1)) ? 1 : 0 },
            doReset(resettingLayer) {
                let keep = [];
                if (hasMilestone("b", 0) && resettingLayer == "b") keep.push("upgrades")
                if (hasMilestone("g", 0) && resettingLayer == "g") keep.push("upgrades")
                if (hasMilestone("e", 1) && resettingLayer == "e") keep.push("upgrades")
                if (hasMilestone("t", 1) && resettingLayer == "t") keep.push("upgrades")
                if (hasMilestone("s", 1) && resettingLayer == "s") keep.push("upgrades")
                if (hasAchievement("a", 41)) keep.push("upgrades")
                if (layers[resettingLayer].row > this.row) layerDataReset("p", keep)
            },
            startData() {
                return {
                    unlocked: false,
                    points: new Decimal(0),
                    best: new Decimal(0),
                    total: new Decimal(0),
                    first: 0,
                }
            },
            upgrades: {
                rows: 4,
                cols: 4,
                11: {
                    title: "Begin",
                    description: "Generate 1 Point every second.",
                    cost() { return new Decimal(1) },
                },
                12: {
                    title: "Prestige Boost",
                    description: "Prestige Points boost Point generation.",
                    cost() { return new Decimal(1) },
                    effect() {

                        let eff = player.p.points.plus(2).pow(0.5);
                        if (hasUpgrade("g", 14)) eff = eff.pow(1.5);
                        if (hasUpgrade("g", 24)) eff = eff.pow(1.4666667);

                        if (hasUpgrade("p", 14)) eff = eff.pow(3);

                        return eff;
                    },
                    unlocked() { return hasUpgrade("p", 11) },
                    effectDisplay() { return format(tmp.p.upgrades[12].effect) + "x" },
                },
                13: {
                    title: "Self-Synergy",
                    description: "Points boost their own generation.",
                    cost() { return new Decimal(5) },
                    effect() {
                        let eff = player.points.plus(1).log10().pow(0.75).plus(1);
                        if (hasUpgrade("p", 33)) eff = eff.pow(upgradeEffect("p", 33));
                        if (hasUpgrade("g", 15)) eff = eff.pow(upgradeEffect("g", 15));
                        return eff;
                    },
                    unlocked() { return hasUpgrade("p", 12) },
                    effectDisplay() { return format(tmp.p.upgrades[13].effect) + "x" },
                },
                21: {
                    title: "More Prestige",
                    description() { return "Prestige Point gain is increased by " + "80" + "%." },
                    cost() { return new Decimal(20) },
                    unlocked() { return hasAchievement("a", 21) && hasUpgrade("p", 11) },
                },
                22: {
                    title: "Upgrade Power",
                    description: "Point generation is faster based on your Prestige Upgrades bought.",
                    cost() { return new Decimal(75) },
                    effect() {
                        let eff = Decimal.pow(1.4, player.p.upgrades.length);
                        if (hasUpgrade("p", 32)) eff = eff.pow(2);
                        return eff;
                    },
                    unlocked() { return hasAchievement("a", 21) && hasUpgrade("p", 12) },
                    effectDisplay() { return format(tmp.p.upgrades[22].effect) + "x" },
                },
                23: {
                    title: "Reverse Prestige Boost",
                    description: "Prestige Point gain is boosted by your Points.",
                    cost() { return 5e3 },
                    effect() {
                        let eff = player.points.plus(1).log10().cbrt().plus(1);
                        if (hasUpgrade("p", 33)) eff = eff.pow(upgradeEffect("p", 33));
                        if (hasUpgrade("g", 23)) eff = eff.pow(upgradeEffect("g", 23));
                        return eff;
                    },
                    unlocked() { return hasAchievement("a", 21) && hasUpgrade("p", 13) },
                    effectDisplay() { return format(tmp.p.upgrades[23].effect) + "x" },
                },
                31: {
                    title: "WE NEED MORE PRESTIGE",
                    description: "Prestige Point gain is raised to the power of 1.05.",
                    cost() { return new Decimal(1e45) },
                    unlocked() { return hasAchievement("a", 23) && hasUpgrade("p", 21) },
                },
                32: {
                    title: "Still Useless",
                    description: "<b>Upgrade Power</b> is squared.",
                    cost() { return new Decimal(1e56) },
                    unlocked() { return hasAchievement("a", 23) && hasUpgrade("p", 22) },
                },
                33: {
                    title: "Column Leader",
                    description: "Both above upgrades are stronger based on your Total Prestige Points.",
                    cost() { return new Decimal(1e60) },
                    effect() { return player.p.total.plus(1).log10().plus(1).log10().div(5).plus(1) },
                    unlocked() { return hasAchievement("a", 23) && hasUpgrade("p", 23) },
                    effectDisplay() { return "^" + format(tmp.p.upgrades[33].effect) },
                },
            },
        },

        "b": {
            name: "boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
            symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
            position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
            color: "#6e64c4",
            requires() { return new Decimal(200).times((player.b.unlockOrder && !player.b.unlocked) ? 5000 : 1) }, // Can be a function that takes requirement increases into account
            resource: "boosters", // Name of prestige currency
            baseResource: "points", // Name of resource prestige is based on
            baseAmount() { return player.points }, // Get the current amount of baseResource
            type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
            branches: ["p"],
            exponent() { return 1.25 }, // Prestige currency exponent
            base() { return 5 },
            gainMult() {
                let mult = new Decimal(1);
                if (hasUpgrade("b", 23)) mult = mult.div(upgradeEffect("b", 23));
                if (player.s.unlocked) mult = mult.div(buyableEffect("s", 13));
                return mult;
            },
            canBuyMax() { return hasMilestone("b", 1) },
            row: 1, // Row the layer is in on the tree (0 is the first row)
            hotkeys: [
                { key: "b", description: "Press B to perform a booster reset", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
            ],
            layerShown() { return player.p.unlocked },
            automate() { },
            resetsNothing() { return hasMilestone("t", 4) },
            addToBase() {
                let base = new Decimal(0);
                if (hasUpgrade("b", 12)) base = base.plus(upgradeEffect("b", 12));
                if (hasUpgrade("b", 13)) base = base.plus(upgradeEffect("b", 13));
                if (hasUpgrade("t", 11)) base = base.plus(upgradeEffect("t", 11));
                if (hasUpgrade("e", 11)) base = base.plus(upgradeEffect("e", 11).b);
                if (player.e.unlocked) base = base.plus(layers.e.buyables[11].effect().second);
                if (player.s.unlocked) base = base.plus(buyableEffect("s", 12));
                if (hasUpgrade("t", 25)) base = base.plus(upgradeEffect("t", 25));
                return base;
            },
            effectBase() {
                let base = new Decimal(2);

                // ADD
                base = base.plus(tmp.b.addToBase);


                return base.pow(tmp.b.power);
            },
            power() {
                let power = new Decimal(1);
                return power;
            },
            effect() {
                if (!unl(this.layer)) return new Decimal(1);
                return Decimal.pow(tmp.b.effectBase, player.b.points).max(0);
            },
            effectDescription() {
                return "which are boosting Point generation by " + format(tmp.b.effect) + "x"
            },
            doReset(resettingLayer) {
                let keep = [];
                if (hasMilestone("e", 0) && resettingLayer == "e") keep.push("milestones")
                if (hasMilestone("t", 0) && resettingLayer == "t") keep.push("milestones")
                if (hasMilestone("s", 0) && resettingLayer == "s") keep.push("milestones")
                if (hasMilestone("t", 2) || hasAchievement("a", 64)) keep.push("upgrades")
                if (hasMilestone("e", 2) && resettingLayer == "e") keep.push("upgrades")
                if (layers[resettingLayer].row > this.row) layerDataReset("b", keep)
            },
            startData() {
                return {
                    unlocked: false,
                    points: new Decimal(0),
                    best: new Decimal(0),
                    total: new Decimal(0),
                    unlockOrder: 0,
                    first: 0,
                    auto: false,
                }
            },
            autoPrestige() { return (hasMilestone("t", 3) && player.b.auto) },
            increaseUnlockOrder: ["g"],
            milestones: {
                0: {
                    requirementDescription: "8 Boosters",
                    done() { return player.b.best.gte(8) || hasAchievement("a", 41) || hasAchievement("a", 71) },
                    effectDescription: "Keep Prestige Upgrades on reset.",
                },
                1: {
                    requirementDescription: "15 Boosters",
                    done() { return player.b.best.gte(15) || hasAchievement("a", 71) },
                    effectDescription: "You can buy max Boosters.",
                },
            },
            upgrades: {
                rows: 3,
                cols: 4,
                11: {
                    title: "BP Combo",
                    description: "Best Boosters boost Prestige Point gain.",
                    cost() { return new Decimal(3) },
                    effect() {
                        let ret = player.b.best.sqrt().plus(1);
                        if (hasUpgrade("b", 32)) ret = Decimal.pow(1.125, player.b.best).times(ret);
                        if (hasUpgrade("s", 15)) ret = ret.pow(buyableEffect("s", 14).root(2.7));
                        if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) ret = ret.pow(upgradeEffect("b", 14));
                        return ret;
                    },
                    unlocked() { return player.b.unlocked },
                    effectDisplay() { return format(tmp.b.upgrades[11].effect) + "x" },
                },
                12: {
                    title: "Cross-Contamination",
                    description: "Generators add to the Booster effect base.",
                    cost() { return new Decimal(7) },
                    effect() {
                        let ret = player.g.points.add(1).log10().sqrt().div(3).times(hasUpgrade("e", 14) ? upgradeEffect("e", 14) : 1);
                        if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) ret = ret.pow(upgradeEffect("b", 14));
                        return ret;
                    },
                    unlocked() { return player.b.unlocked && player.g.unlocked },
                    effectDisplay() { return "+" + format(tmp.b.upgrades[12].effect) },
                },
                13: {
                    title: "PB Reversal",
                    description: "Total Prestige Points add to the Booster effect base.",
                    cost() { return new Decimal(8) },
                    effect() {
                        let ret = player.p.total.add(1).log10().add(1).log10().div(3).times(hasUpgrade("e", 14) ? upgradeEffect("e", 14) : 1)
                        if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) ret = ret.pow(upgradeEffect("b", 14));
                        return ret;
                    },
                    unlocked() { return player.b.unlocked && player.b.best.gte(7) },
                    effectDisplay() { return "+" + format(tmp.b.upgrades[13].effect) },
                },
                21: {
                    title: "Gen Z^2",
                    description: "Square the Generator Power effect.",
                    cost() { return new Decimal(9) },
                    unlocked() { return hasUpgrade("b", 11) && hasUpgrade("b", 12) },
                },
                22: {
                    title: "Up to the Fifth Floor",
                    description: "Raise the Generator Power effect ^1.2.",
                    cost() { return new Decimal(15) },
                    unlocked() { return hasUpgrade("b", 12) && hasUpgrade("b", 13) },
                },
                23: {
                    title: "Discount One",
                    description: "Boosters are cheaper based on your Points.",
                    cost() { return new Decimal(18) },
                    effect() {
                        let ret = player.points.add(1).log10().add(1).pow(3.2);
                        if (player.s.unlocked) ret = ret.pow(buyableEffect("s", 14));
                        return ret;
                    },
                    unlocked() { return hasUpgrade("b", 21) || hasUpgrade("b", 22) },
                    effectDisplay() { return "/" + format(tmp.b.upgrades[23].effect) },
                },
            },
        },

        "g": {
            name: "generators", // This is optional, only used in a few places, If absent it just uses the layer id.
            symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
            position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
            color: "#a3d9a5",
            requires() { return new Decimal(200).times((player.g.unlockOrder && !player.g.unlocked) ? 5000 : 1) }, // Can be a function that takes requirement increases into account
            resource: "generators", // Name of prestige currency
            baseResource: "points", // Name of resource prestige is based on
            baseAmount() { return player.points }, // Get the current amount of baseResource
            type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
            branches: ["p"],
            exponent() { return 1.25 }, // Prestige currency exponent
            base() { return 5 },
            gainMult() {
                let mult = new Decimal(1);
                if (hasUpgrade("g", 22)) mult = mult.div(upgradeEffect("g", 22));
                if (player.s.unlocked) mult = mult.div(buyableEffect("s", 13));
                return mult;
            },
            canBuyMax() { return hasMilestone("g", 2) },
            row: 1, // Row the layer is in on the tree (0 is the first row)
            hotkeys: [
                { key: "g", description: "Press G to perform a generator reset", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
            ],
            layerShown() { return player.p.unlocked },
            automate() { },
            resetsNothing() { return hasMilestone("s", 4) },
            effBase() {
                let base = new Decimal(2);

                // ADD
                if (hasUpgrade("g", 12)) base = base.plus(upgradeEffect("g", 12));
                if (hasUpgrade("g", 13)) base = base.plus(upgradeEffect("g", 13));
                if (hasUpgrade("e", 11)) base = base.plus(upgradeEffect("e", 11).g);
                if (player.e.unlocked) base = base.plus(layers.e.buyables[11].effect().second);
                if (player.s.unlocked) base = base.plus(buyableEffect("s", 12));

                return base;
            },
            effect() {
                if (!unl(this.layer)) return new Decimal(0);
                let eff = Decimal.pow(this.effBase(), player.g.points).sub(1).max(0);
                if (hasUpgrade("g", 21)) eff = eff.times(upgradeEffect("g", 21));
                if (hasUpgrade("g", 25)) eff = eff.times(upgradeEffect("g", 25));
                if (hasUpgrade("t", 15)) eff = eff.times(tmp.t.enEff);
                if (hasUpgrade("s", 12)) eff = eff.times(upgradeEffect("s", 12));
                if (hasUpgrade("s", 13)) eff = eff.times(upgradeEffect("s", 13));
                return eff;
            },
            effectDescription() {
                return "which are generating " + format(tmp.g.effect) + " Generator Power/sec"
            },
            update(diff) {
                if (player.g.unlocked) player.g.power = player.g.power.plus(tmp.g.effect.times(diff));
            },
            startData() {
                return {
                    unlocked: false,
                    points: new Decimal(0),
                    best: new Decimal(0),
                    total: new Decimal(0),
                    power: new Decimal(0),
                    unlockOrder: 0,
                    first: 0,
                    auto: false,
                }
            },
            autoPrestige() { return (hasMilestone("s", 3) && player.g.auto) },
            powerExp() {
                let exp = new Decimal(1 / 3);
                if (hasUpgrade("b", 21)) exp = exp.times(2);
                if (hasUpgrade("b", 22)) exp = exp.times(1.2);
                if (hasAchievement("a", 152)) exp = exp.times(1.4);
                return exp;
            },
            powerEff() {
                if (!unl(this.layer)) return new Decimal(1);
                return player.g.power.plus(1).pow(this.powerExp());
            },
            doReset(resettingLayer) {
                let keep = [];
                player.g.power = new Decimal(0);
                if (hasMilestone("e", 0) && resettingLayer == "e") keep.push("milestones")
                if (hasMilestone("t", 0) && resettingLayer == "t") keep.push("milestones")
                if (hasMilestone("s", 0) && resettingLayer == "s") keep.push("milestones")
                if (hasMilestone("s", 2) || hasAchievement("a", 64)) keep.push("upgrades")
                if (hasMilestone("e", 2) && resettingLayer == "e") keep.push("upgrades")
                if (layers[resettingLayer].row > this.row) layerDataReset("g", keep)
            },
            tabFormat: ["main-display",
                "prestige-button",
                "blank",
                ["display-text",
                    function () { return 'You have ' + format(player.g.power) + ' Generator Power, which boosts Point generation by ' + format(tmp.g.powerEff) + 'x' },
                    {}],
                "blank",
                ["display-text",
                    function () { return 'Your best Generators is ' + formatWhole(player.g.best) + '<br>You have made a total of ' + formatWhole(player.g.total) + " Generators." },
                    {}],
                "blank",
                "milestones", "blank", "blank", "upgrades"],
            increaseUnlockOrder: ["b"],
            milestones: {
                0: {
                    requirementDescription: "8 Generators",
                    done() { return player.g.best.gte(8) || hasAchievement("a", 41) || hasAchievement("a", 71) },
                    effectDescription: "Keep Prestige Upgrades on reset.",
                },
                1: {
                    requirementDescription: "10 Generators",
                    done() { return player.g.best.gte(10) || hasAchievement("a", 71) },
                    effectDescription: "You gain 100% of Prestige Point gain every second.",
                },
                2: {
                    requirementDescription: "15 Generators",
                    done() { return player.g.best.gte(15) || hasAchievement("a", 71) },
                    effectDescription: "You can buy max Generators.",
                },
            },
            upgrades: {
                rows: 3,
                cols: 5,
                11: {
                    title: "GP Combo",
                    description: "Best Generators boost Prestige Point gain.",
                    cost() { return new Decimal(3) },
                    effect() { return player.g.best.sqrt().plus(1) },
                    unlocked() { return player.g.unlocked },
                    effectDisplay() { return format(tmp.g.upgrades[11].effect) + "x" },
                },
                12: {
                    title: "I Need More!",
                    description: "Boosters add to the Generator base.",
                    cost() { return new Decimal(7) },
                    effect() {
                        let ret = player.b.points.add(1).log10().sqrt().div(3).times(hasUpgrade("e", 14) ? upgradeEffect("e", 14) : 1);
                        if (hasUpgrade("s", 24)) ret = ret.times(upgradeEffect("s", 24));
                        return ret;
                    },
                    unlocked() { return player.b.unlocked && player.g.unlocked },
                    effectDisplay() { return "+" + format(tmp.g.upgrades[12].effect) },
                },
                13: {
                    title: "I Need More II",
                    description: "Best Prestige Points add to the Generator base.",
                    cost() { return new Decimal(8) },
                    effect() {
                        let ret = player.p.best.add(1).log10().add(1).log10().div(3).times(hasUpgrade("e", 14) ? upgradeEffect("e", 14) : 1);
                        if (hasUpgrade("s", 24)) ret = ret.times(upgradeEffect("s", 24));
                        return ret;
                    },
                    unlocked() { return player.g.best.gte(8) },
                    effectDisplay() { return "+" + format(tmp.g.upgrades[13].effect) },
                },
                14: {
                    title: "Boost the Boost",
                    description() { return "<b>Prestige Boost</b> is raised to the power of 1.5." },
                    cost() { return new Decimal(13) },
                    unlocked() { return player.g.best.gte(10) },
                },
                15: {
                    title: "Outer Synergy",
                    description: "<b>Self-Synergy</b> is stronger based on your Generators.",
                    cost() { return new Decimal(15) },
                    effect() {
                        let eff = player.g.points.sqrt().add(1);
                        if (eff.gte(400)) eff = eff.cbrt().times(Math.pow(400, 2 / 3))
                        return eff;
                    },
                    unlocked() { return hasUpgrade("g", 13) },
                    effectDisplay() { return "^" + format(tmp.g.upgrades[15].effect) },
                },
                21: {
                    title: "I Need More III",
                    description: "Generator Power boost its own generation.",
                    cost() { return new Decimal(1e10) },
                    currencyDisplayName: "generator power",
                    currencyInternalName: "power",
                    currencyLayer: "g",
                    effect() {
                        let ret = player.g.power.add(1).log10().add(1);
                        if (hasUpgrade("s", 24)) ret = ret.pow(upgradeEffect("s", 24));
                        return ret;
                    },
                    unlocked() { return hasUpgrade("g", 15) },
                    effectDisplay() { return format(tmp.g.upgrades[21].effect) + "x" },
                },
                22: {
                    title: "Discount Two",
                    description: "Generators are cheaper based on your Prestige Points.",
                    cost() { return new Decimal(1e11) },
                    currencyDisplayName: "generator power",
                    currencyInternalName: "power",
                    currencyLayer: "g",
                    effect() {
                        let eff = player.p.points.add(1).pow(0.25);
                        if (hasUpgrade("g", 32) && player.i.buyables[12].gte(2)) eff = eff.pow(upgradeEffect("g", 32));
                        return eff;
                    },
                    unlocked() { return hasUpgrade("g", 15) },
                    effectDisplay() { return "/" + format(tmp.g.upgrades[22].effect) },
                },
                23: {
                    title: "Double Reversal",
                    description: "<b>Reverse Prestige Boost</b> is stronger based on your Boosters.",
                    cost() { return new Decimal(1e12) },
                    currencyDisplayName: "generator power",
                    currencyInternalName: "power",
                    currencyLayer: "g",
                    effect() { return player.b.points.pow(0.85).add(1) },
                    unlocked() { return hasUpgrade("g", 15) && player.b.unlocked },
                    effectDisplay() { return "^" + format(tmp.g.upgrades[23].effect) },
                },
                24: {
                    title: "Boost the Boost Again",
                    description: "<b>Prestige Boost</b> is raised to the power of 1.467.",
                    cost() { return new Decimal(20) },
                    unlocked() { return hasUpgrade("g", 14) && (hasUpgrade("g", 21) || hasUpgrade("g", 22)) },
                },
                25: {
                    title: "I Need More IV",
                    description: "Prestige Points boost Generator Power gain.",
                    cost() { return new Decimal(1e14) },
                    currencyDisplayName: "generator power",
                    currencyInternalName: "power",
                    currencyLayer: "g",
                    effect() {
                        let ret = player.p.points.add(1).log10().pow(3).add(1);
                        if (hasUpgrade("s", 24)) ret = ret.pow(upgradeEffect("s", 24));
                        return ret;
                    },
                    unlocked() { return hasUpgrade("g", 23) && hasUpgrade("g", 24) },
                    effectDisplay() { return format(tmp.g.upgrades[25].effect) + "x" },
                },
            },
        },

        "t": {
            name: "time", // This is optional, only used in a few places, If absent it just uses the layer id.
            symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
            position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
            startData() {
                return {
                    unlocked: false,
                    points: new Decimal(0),
                    best: new Decimal(0),
                    energy: new Decimal(0),
                    first: 0,
                    auto: false,
                    unlockOrder: 0,
                    autoExt: false,
                }
            },
            color: "#006609",
            requires() { return new Decimal(1e120).times(Decimal.pow("1e180", Decimal.pow(player[this.layer].unlockOrder, 1.415038))) }, // Can be a function that takes requirement increases into account
            resource: "time capsules", // Name of prestige currency
            baseResource: "points", // Name of resource prestige is based on
            baseAmount() { return player.points }, // Get the current amount of baseResource
            type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
            exponent() { return new Decimal(1.85) }, // Prestige currency exponent
            base() { return new Decimal(1e15) },
            gainMult() { // Calculate the multiplier for main currency from bonuses
                let mult = new Decimal(1)
                return mult
            },
            gainExp() { // Calculate the exponent on main currency from bonuses
                return new Decimal(1)
            },
            enCapMult() {
                let mult = new Decimal(1);
                if (hasUpgrade("t", 12)) mult = mult.times(upgradeEffect("t", 12));
                if (hasUpgrade("t", 21)) mult = mult.times(100);
                if (hasUpgrade("t", 22)) mult = mult.times(upgradeEffect("t", 22));
                return mult;
            },
            enGainMult() {
                let mult = new Decimal(1);
                if (hasUpgrade("t", 22)) mult = mult.times(upgradeEffect("t", 22));
                return mult;
            },
            effBaseMult() {
                let mult = new Decimal(1);
                return mult;
            },
            effBasePow() {
                let exp = new Decimal(1);
                return exp;
            },
            effGainBaseMult() {
                let mult = new Decimal(1);
                return mult;
            },
            effLimBaseMult() {
                let mult = new Decimal(1);
                return mult;
            },
            nonExtraTCPow() {
                let pow = new Decimal(1);
                return pow;
            },
            effect() {
                if (!unl(this.layer)) return { gain: new Decimal(0), limit: new Decimal(0) };
                else return {
                    gain: Decimal.pow(tmp.t.effBaseMult.times(tmp.t.effGainBaseMult).times(3).pow(tmp.t.effBasePow), player.t.points.times(tmp.t.nonExtraTCPow).plus(player.t.buyables[11]).plus(tmp.t.freeExtraTimeCapsules)).sub(1).max(0).times(player.t.points.times(tmp.t.nonExtraTCPow).plus(player.t.buyables[11]).gt(0) ? 1 : 0).times(tmp.t.enGainMult).max(0),
                    limit: Decimal.pow(tmp.t.effBaseMult.times(tmp.t.effLimBaseMult).times(2).pow(tmp.t.effBasePow), player.t.points.times(tmp.t.nonExtraTCPow).plus(player.t.buyables[11]).plus(tmp.t.freeExtraTimeCapsules)).sub(1).max(0).times(100).times(player.t.points.times(tmp.t.nonExtraTCPow).plus(player.t.buyables[11]).gt(0) ? 1 : 0).times(tmp.t.enCapMult).max(0),
                }
            },
            effect2() {
                if (!unl(this.layer)) return new Decimal(1);
                let c = player.t.points.plus(player.t.buyables[11]).plus(tmp.t.freeExtraTimeCapsules);
                return Decimal.pow(1.01, c.sqrt());
            },
            effectDescription() {
                return "which are generating " + format(tmp.t.effect.gain) + " Time Energy/sec, but with a limit of " + format(tmp.t.effect.limit) + " Time Energy"
            },
            enEff() {
                if (!unl(this.layer)) return new Decimal(1);
                let eff = player.t.energy.add(1).pow(1.2);
                if (hasUpgrade("t", 14)) eff = eff.pow(1.3);
                if (hasUpgrade("q", 24)) eff = eff.pow(7.5);
                return softcap("timeEnEff", eff);
            },
            enEff2() {
                if (!unl(this.layer)) return new Decimal(0);
                if (!hasUpgrade("t", 24)) return new Decimal(0);
                let exp = 5 / 9
                if (hasUpgrade("t", 35) && player.i.buyables[12].gte(4)) exp = .565;
                let eff = player.t.energy.max(0).plus(1).log10().pow(exp);
                return softcap("timeEnEff2", eff).floor();
            },
            nextEnEff2() {
                if (!hasUpgrade("t", 24)) return new Decimal(1 / 0);
                let next = Decimal.pow(10, reverse_softcap("timeEnEff2", tmp.t.enEff2.plus(1)).pow(1.8)).sub(1);
                return next;
            },
            autoPrestige() { return player.t.auto },
            update(diff) {
                if (player.t.unlocked) player.t.energy = player.t.energy.plus(this.effect().gain.times(diff)).min(this.effect().limit).max(0);
            },
            row: 2, // Row the layer is in on the tree (0 is the first row)
            hotkeys: [
                { key: "t", description: "Press T to Time Reset", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
            ],
            tabFormat: ["main-display",
                "prestige-button",
                "blank",
                ["display-text",
                    function () { return 'You have ' + format(player.t.energy) + ' Time Energy, which boosts Point & Prestige Point gain by ' + format(tmp.t.enEff) + 'x' + (tmp.nerdMode ? " ((x+1)^" + format(1.2 * (hasUpgrade("t", 14) ? 1.3 : 1) * (hasUpgrade("q", 24) ? 7.5 : 1)) + ")" : "") + (hasUpgrade("t", 24) ? (", and provides " + formatWhole(tmp.t.enEff2) + " free Extra Time Capsules (" + (tmp.nerdMode ? "log(x+1)^0.556" : ("next at " + format(tmp.t.nextEnEff2))) + ").") : "") },
                    {}],
                "blank",
                ["display-text",
                    function () { return 'Your best Time Capsules is ' + formatWhole(player.t.best) },
                    {}],
                "blank",
                "milestones", "blank", "buyables", "blank", "upgrades"],
            increaseUnlockOrder: ["e", "s"],
            doReset(resettingLayer) {
                let keep = [];
                if (hasMilestone("q", 2) || hasAchievement("a", 64)) keep.push("upgrades")
                if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
            },
            layerShown() { return player.b.unlocked },
            branches: ["b"],
            upgrades: {
                rows: 4,
                cols: 5,
                11: {
                    title: "Pseudo-Boost",
                    description: "Non-extra Time Capsules add to the Booster base.",
                    cost() { return new Decimal(2) },
                    unlocked() { return player.t.unlocked },
                    effect() {
                        return player.t.points.pow(0.9).add(0.5).plus(hasUpgrade("t", 13) ? upgradeEffect("t", 13) : 0)
                    },
                    effectDisplay() { return "+" + format(tmp.t.upgrades[11].effect) },
                },
                12: {
                    title: "Limit Stretcher",
                    description: "Time Energy cap starts later based on Boosters, and +1 Extra Time Capsule.",
                    cost() { return new Decimal([5e4, 2e5, 2.5e6][player[this.layer].unlockOrder || 0]) },
                    currencyDisplayName: "time energy",
                    currencyInternalName: "energy",
                    currencyLayer: "t",
                    unlocked() { return player.t.best.gte(2) },
                    effect() {
                        return player.b.points.pow(0.95).add(1)
                    },
                    effectDisplay() { return format(tmp.t.upgrades[12].effect) + "x" },
                },
                13: {
                    title: "Pseudo-Pseudo-Boost",
                    description: "Extra Time Capsules add to the <b>Pseudo-Boost</b>'s effect.",
                    cost() { return new Decimal([3e6, 3e7, 3e8][player[this.layer].unlockOrder || 0]) },
                    currencyDisplayName: "time energy",
                    currencyInternalName: "energy",
                    currencyLayer: "t",
                    unlocked() { return hasUpgrade("t", 12) },
                    effect() {
                        return player.t.buyables[11].add(tmp.t.freeExtraTimeCapsules).pow(0.95);
                    },
                    effectDisplay() { return "+" + format(tmp.t.upgrades[13].effect) },
                },
                14: {
                    title: "More Time",
                    description: "The Time Energy effect is raised to the power of 1.3.",
                    cost() { return new Decimal(player.t.unlockOrder >= 2 ? 5 : 4) },
                    unlocked() { return hasUpgrade("t", 13) },
                },
                15: {
                    title: "Time Potency",
                    description: "Time Energy affects Generator Power gain.",
                    cost() { return new Decimal([1.25e7, (player.s.unlocked ? 3e8 : 6e7), 1.5e9][player[this.layer].unlockOrder || 0]) },
                    currencyDisplayName: "time energy",
                    currencyInternalName: "energy",
                    currencyLayer: "t",
                    unlocked() { return hasUpgrade("t", 13) },
                },
                21: {
                    title: "Weakened Chains",
                    description: "The Time Energy limit is multiplied by 100.",
                    cost() { return new Decimal(12) },
                    unlocked() { return hasAchievement("a", 33) },
                },
                22: {
                    title: "Enhanced Time",
                    description: "Enhance Points boost Time Energy's generation and limit.",
                    cost() { return new Decimal(9) },
                    unlocked() { return hasAchievement("a", 33) },
                    effect() {
                        return player.e.points.plus(1).root(10);
                    },
                    effectDisplay() { return format(tmp.t.upgrades[22].effect) + "x" },
                },
                23: {
                    title: "Reverting Time",
                    description: "Time acts as if you chose it first.",
                    cost() { return new Decimal(player[this.layer].unlockOrder >= 2 ? 3e9 : (player.s.unlocked ? 6.5e8 : 1.35e8)) },
                    currencyDisplayName: "time energy",
                    currencyInternalName: "energy",
                    currencyLayer: "t",
                    unlocked() { return (player[this.layer].unlockOrder > 0 || hasUpgrade("t", 23)) && hasUpgrade("t", 13) },
                    onPurchase() { player[this.layer].unlockOrder = 0; },
                },
                24: {
                    title: "Time Dilation",
                    description: "Unlock a new Time Energy effect.",
                    cost() { return new Decimal(2e17) },
                    currencyDisplayName: "time energy",
                    currencyInternalName: "energy",
                    currencyLayer: "t",
                    unlocked() { return hasAchievement("a", 33) },
                },
                25: {
                    title: "Basic",
                    description: "Time Energy adds to the Booster base.",
                    cost() { return new Decimal(3e19) },
                    currencyDisplayName: "time energy",
                    currencyInternalName: "energy",
                    currencyLayer: "t",
                    unlocked() { return hasAchievement("a", 33) },
                    effect() { return player.t.energy.plus(1).log10().div(1.2) },
                    effectDisplay() { return "+" + format(tmp.t.upgrades[25].effect) },
                },
            },
            freeExtraTimeCapsules() {
                let free = new Decimal(0);
                if (hasUpgrade("t", 12)) free = free.plus(1);
                if (hasUpgrade("t", 24)) free = free.plus(tmp.t.enEff2);
                return free;
            },
            buyables: {
                rows: 1,
                cols: 1,
                11: {
                    title: "Extra Time Capsules",
                    costScalingEnabled() {
                        return false
                    },
                    costExp() {
                        let exp = new Decimal(1.2);
                        return exp;
                    },
                    cost(x = player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                        if (x.gte(25) && tmp[this.layer].buyables[this.id].costScalingEnabled) x = x.pow(2).div(25)
                        let cost = x.times(0.4).pow(tmp[this.layer].buyables[this.id].costExp).add(1).times(10)
                        return cost.floor()
                    },
                    display() { // Everything else displayed in the buyable button after the title
                        let data = tmp[this.layer].buyables[this.id]
                        let e = tmp.t.freeExtraTimeCapsules;
                        let display = "Cost: " + formatWhole(data.cost) + " Boosters" + "\n\
                        Amount: " + formatWhole(player[this.layer].buyables[this.id]) + (e.gt(0) ? (" + " + formatWhole(e)) : "")
                        return display;
                    },
                    unlocked() { return player[this.layer].unlocked },
                    canAfford() {
                        return player.b.points.gte(tmp[this.layer].buyables[this.id].cost)
                    },
                    buy() {
                        cost = tmp[this.layer].buyables[this.id].cost
                        player.b.points = player.b.points.sub(cost)
                        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    },
                    buyMax() {
                        if (!this.canAfford()) return;
                        let b = player.b.points.plus(1);
                        let tempBuy = b.div(10).sub(1).max(0).root(tmp[this.layer].buyables[this.id].costExp).div(0.4);
                        if (tempBuy.gte(25) && tmp[this.layer].buyables[this.id].costScalingEnabled) tempBuy = tempBuy.times(25).sqrt();
                        let target = tempBuy.plus(1).floor();
                        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
                    },
                    autoed() { return false },
                    style: { 'height': '222px' },
                },
            },
            milestones: {
                0: {
                    requirementDescription: "2 Time Capsules",
                    done() { return player.t.best.gte(2) || hasAchievement("a", 71) },
                    effectDescription: "Keep Booster/Generator milestones on reset.",
                },
                1: {
                    requirementDescription: "3 Time Capsules",
                    done() { return player.t.best.gte(3) || hasAchievement("a", 41) || hasAchievement("a", 71) },
                    effectDescription: "Keep Prestige Upgrades on reset.",
                },
                2: {
                    requirementDescription: "4 Time Capsules",
                    done() { return player.t.best.gte(4) || hasAchievement("a", 71) },
                    effectDescription: "Keep Booster Upgrades on all resets.",
                },
                3: {
                    requirementDescription: "5 Time Capsules",
                    done() { return player.t.best.gte(5) || hasAchievement("a", 71) },
                    effectDescription: "Unlock Auto-Boosters.",
                    toggles: [["b", "auto"]],
                },
                4: {
                    requirementDescription: "8 Time Capsules",
                    done() { return player.t.best.gte(8) || hasAchievement("a", 71) },
                    effectDescription: "Boosters reset nothing.",
                },
            },
        },

        "e": {
            name: "enhance", // This is optional, only used in a few places, If absent it just uses the layer id.
            symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
            position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
            startData() {
                return {
                    unlocked: false,
                    points: new Decimal(0),
                    best: new Decimal(0),
                    total: new Decimal(0),
                    first: 0,
                    auto: false,
                    unlockOrder: 0,
                }
            },
            color: "#b82fbd",
            requires() { return new Decimal(1e120).times(Decimal.pow("1e180", Decimal.pow(player[this.layer].unlockOrder, 1.415038))) }, // Can be a function that takes requirement increases into account
            resource: "enhance points", // Name of prestige currency
            baseResource: "points", // Name of resource prestige is based on
            baseAmount() { return player.points }, // Get the current amount of baseResource
            type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
            exponent() { return new Decimal(.02) }, // Prestige currency exponent
            gainMult() { // Calculate the multiplier for main currency from bonuses
                let mult = new Decimal(1)
                if (hasUpgrade("e", 24)) mult = mult.times(upgradeEffect("e", 24));
                return mult
            },
            gainExp() { // Calculate the exponent on main currency from bonuses
                return new Decimal(1)
            },
            passiveGeneration() { return 0 },
            update(diff) {
                if (player.e.auto && hasMilestone("q", 1)) this.buyables[11].buyMax();
            },
            row: 2, // Row the layer is in on the tree (0 is the first row)
            hotkeys: [
                { key: "e", description: "Press E to Enhance Reset", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
            ],
            increaseUnlockOrder: ["t", "s"],
            doReset(resettingLayer) {
                let keep = []
                if (hasAchievement("a", 64)) keep.push("upgrades")
                if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
            },
            freeEnh() {
                let enh = new Decimal(0);
                if (hasUpgrade("e", 13)) enh = enh.plus(1);
                if (hasUpgrade("e", 21)) enh = enh.plus(2);
                if (hasUpgrade("e", 23)) enh = enh.plus(upgradeEffect("e", 23));
                if (hasUpgrade("e", 32) && player.i.buyables[12].gte(3)) enh = enh.plus(upgradeEffect("e", 32));
                return enh;
            },
            layerShown() { return player.b.unlocked && player.g.unlocked },
            branches: ["b", "g"],
            upgrades: {
                rows: 4,
                cols: 4,
                11: {
                    title: "Row 2 Synergy",
                    description: "Boosters & Generators boost each other.",
                    cost() { return new Decimal((player.e.unlockOrder >= 2) ? 25 : 100) },
                    unlocked() { return player.e.unlocked },
                    effect() {
                        let exp = 1
                        return { g: player.b.points.add(1).log10().pow(exp), b: player.g.points.add(1).log10().pow(exp) }
                    },
                    effectDisplay() { return "+" + format(tmp.e.upgrades[11].effect.g) + " to Generator base, +" + format(tmp.e.upgrades[11].effect.b) + " to Booster base" },
                },
                12: {
                    title: "Enhanced Prestige",
                    description: "Total Enhance Points boost Prestige Point gain.",
                    cost() { return new Decimal(player.e.unlockOrder >= 2 ? 400 : 1e3) },
                    unlocked() { return hasUpgrade("e", 11) },
                    effect() {
                        let ret = player.e.total.add(1).pow(1.5)
                        ret = softcap("e12", ret);
                        return ret
                    },
                    effectDisplay() { return format(tmp.e.upgrades[12].effect) + "x" },
                },
                13: {
                    title: "Enhance Plus",
                    description: "Get a free Enhancer.",
                    cost() { return new Decimal(2.5e3) },
                    unlocked() { return hasUpgrade("e", 11) },
                },
                14: {
                    title: "More Additions",
                    description: "Any Booster/Generator Upgrades that add to the Booster/Generator base are quadrupled.",
                    cost() { return new Decimal(3e23) },
                    unlocked() { return hasAchievement("a", 33) },
                    effect() {
                        let e = new Decimal(4)
                        if (hasUpgrade("b", 33)) e = e.times(upgradeEffect("b", 33))
                        return e;
                    },
                    effectDisplay() { return format(tmp.e.upgrades[14].effect) + "x" },
                },
                21: {
                    title: "Enhance Plus Plus",
                    description: "Get another two free Enhancers",
                    cost() { return new Decimal(player.e.unlockOrder > 0 ? 1e4 : 1e9) },
                    unlocked() { return hasUpgrade("e", 13) && ((!player.s.unlocked || (player.s.unlocked && player.t.unlocked)) && player.t.unlocked) },
                },
                22: {
                    title: "Enhanced Reversion",
                    description: "Enhance acts as if you chose it first.",
                    cost() { return new Decimal(player.e.unlockOrder >= 2 ? 1e3 : 3e4) },
                    unlocked() { return (player[this.layer].unlockOrder > 0 || hasUpgrade("e", 22)) && hasUpgrade("e", 12) },
                    onPurchase() { player[this.layer].unlockOrder = 0; },
                },
                23: {
                    title: "Enter the E-Space",
                    description: "Space Energy provides free Enhancers.",
                    cost() { return new Decimal(2e20) },
                    unlocked() { return hasAchievement("a", 33) },
                    effect() {
                        let eff = player.s.points.pow(2).div(25);
                        return eff.floor();
                    },
                    effectDisplay() { return "+" + formatWhole(tmp.e.upgrades[23].effect) },
                },
                24: {
                    title: "Monstrous Growth",
                    description: "Boosters & Generators boost Enhance Point gain.",
                    cost() { return new Decimal(2.5e28) },
                    unlocked() { return hasAchievement("a", 33) },
                    effect() { return Decimal.pow(1.1, player.b.points.plus(player.g.points).pow(0.9)) },
                    effectDisplay() { return format(tmp.e.upgrades[24].effect) + "x" },
                },
            },
            buyables: {
                rows: 1,
                cols: 1,
                11: {
                    title: "Enhancers",
                    costScalingEnabled() {
                        return false;
                    },
                    cost(x = player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                        if (x.gte(25) && tmp[this.layer].buyables[this.id].costScalingEnabled) x = x.pow(2).div(25)
                        let cost = Decimal.pow(2, x.pow(1.5))
                        return cost.floor()
                    },
                    power() {
                        let pow = new Decimal(1);
                        return pow;
                    },
                    effect(x = player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                        let power = tmp[this.layer].buyables[this.id].power
                        x = x.plus(tmp.e.freeEnh);
                        if (!unl(this.layer)) x = new Decimal(0);

                        let eff = {}
                        if (x.gte(0)) eff.first = Decimal.pow(25, x.pow(power.times(1.1)))
                        else eff.first = Decimal.pow(1 / 25, x.times(-1).pow(power.times(1.1)))
                        eff.first = softcap("enh1", eff.first)

                        if (x.gte(0)) eff.second = x.pow(power.times(0.8))
                        else eff.second = x.times(-1).pow(power.times(0.8)).times(-1)
                        return eff;
                    },
                    display() { // Everything else displayed in the buyable button after the title
                        let data = tmp[this.layer].buyables[this.id]
                        return (tmp.nerdMode ? ("Cost Formula: 2^(" + ((player[this.layer].buyables[this.id].gte(25) && data.costScalingEnabled) ? "((x^2)/25)" : "x") + "^1.5)") : ("Cost: " + formatWhole(data.cost) + " Enhance Points")) + "\n\
                        Amount: " + formatWhole(player[this.layer].buyables[this.id]) + (tmp.e.freeEnh.gt(0) ? (" + " + formatWhole(tmp.e.freeEnh)) : "") + "\n\
                       "+ (tmp.nerdMode ? (" Formula 1: 25^(x^" + format(data.power.times(1.1)) + ")\n\ Formula 2: x^" + format(data.power.times(0.8))) : (" Boosts Prestige Point gain by " + format(data.effect.first) + "x and adds to the Booster/Generator base by " + format(data.effect.second))) + (inChallenge("h", 31) ? ("\nPurchases Left: " + String(10 - player.h.chall31bought)) : "")
                    },
                    unlocked() { return player[this.layer].unlocked },
                    canAfford() {
                        return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)
                    },
                    buy() {
                        cost = tmp[this.layer].buyables[this.id].cost
                        player[this.layer].points = player[this.layer].points.sub(cost)
                        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    },
                    buyMax() {
                        if (!this.canAfford()) return;
                        let tempBuy = player[this.layer].points.max(1).log2().root(1.5)
                        if (tempBuy.gte(25) && tmp[this.layer].buyables[this.id].costScalingEnabled) tempBuy = tempBuy.times(25).sqrt();
                        let target = tempBuy.plus(1).floor();
                        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
                    },
                    autoed() { return false },
                    style: { 'height': '222px' },
                },
            },
            milestones: {
                0: {
                    requirementDescription: "2 Enhance Points",
                    done() { return player.e.best.gte(2) || hasAchievement("a", 71) },
                    effectDescription: "Keep Booster/Generator milestones on reset.",
                },
                1: {
                    requirementDescription: "5 Enhance Points",
                    done() { return player.e.best.gte(5) || hasAchievement("a", 41) || hasAchievement("a", 71) },
                    effectDescription: "Keep Prestige Upgrades on reset.",
                },
                2: {
                    requirementDescription: "25 Enhance Points",
                    done() { return player.e.best.gte(25) || hasAchievement("a", 71) },
                    effectDescription: "Keep Booster/Generator Upgrades on reset.",
                },
            },
        },

        "s": {
            name: "space", // This is optional, only used in a few places, If absent it just uses the layer id.
            symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
            position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
            startData() {
                return {
                    unlocked: false,
                    points: new Decimal(0),
                    best: new Decimal(0),
                    spent: new Decimal(0),
                    first: 0,
                    auto: false,
                    autoBld: false,
                    unlockOrder: 0,
                }
            },
            color: "#dfdfdf",
            requires() { return new Decimal(1e120).times(Decimal.pow("1e180", Decimal.pow(player[this.layer].unlockOrder, 1.415038))) }, // Can be a function that takes requirement increases into account
            resource: "space energy", // Name of prestige currency
            baseResource: "points", // Name of resource prestige is based on
            baseAmount() { return player.points }, // Get the current amount of baseResource
            type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
            exponent() { return new Decimal(1.85) }, // Prestige currency exponent
            base() { return new Decimal(1e15) },
            gainMult() { // Calculate the multiplier for main currency from bonuses
                let mult = new Decimal(1)
                return mult
            },
            gainExp() { // Calculate the exponent on main currency from bonuses
                return new Decimal(1)
            },
            row: 2, // Row the layer is in on the tree (0 is the first row)
            hotkeys: [
                { key: "s", description: "Press S to Space Reset", onPress() { if (canReset(this.layer)) doReset(this.layer) } },
            ],
            resetsNothing() { return false },
            increaseUnlockOrder: ["t", "e"],
            doReset(resettingLayer) {
                let keep = []
                if (hasAchievement("a", 64)) keep.push("upgrades")
                if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
            },
            space() {
                let space = player.s.best.pow(1.1).times(3);
                if (hasUpgrade("s", 13)) space = space.plus(2);

                return space.floor().sub(player.s.spent).max(0);
            },
            buildingBaseRoot() {
                let root = new Decimal(1);
                return root;
            },
            buildingBaseCosts() {
                let rt = tmp.s.buildingBaseRoot;
                return {
                    11: new Decimal(1e3).root(rt),
                    12: new Decimal(1e10).root(rt),
                    13: new Decimal(1e25).root(rt),
                    14: new Decimal(1e48).root(rt),
                    15: new Decimal(1e250).root(rt),
                    16: new Decimal("e3e7").root(rt),
                    17: new Decimal("e4.5e7").root(rt),
                    18: new Decimal("e6e7").root(rt),
                    19: new Decimal("e3.5e8").root(rt),
                    20: new Decimal("e1.5e9").root(rt),
                }
            },
            tabFormat: ["main-display",
                "prestige-button",
                "blank",
                ["display-text",
                    function () { return 'Your best Space Energy is ' + formatWhole(player.s.best) },
                    {}],
                "blank",
                "milestones", "blank",
                ["display-text",
                    function () { return 'You have ' + format(player.g.power) + ' Generator Power' },
                    {}],
                ["display-text",
                    function () { return 'Your Space Energy has provided you with ' + formatWhole(tmp.s.space) + ' Space' },
                    {}],
                ["display-text",
                    function () { return tmp.s.buildingPower.eq(1) ? "" : ("Space Building Power: " + format(tmp.s.buildingPower.times(100)) + "%") },
                    {}],
                "blank",
                "buyables", "blank", "upgrades"],
            layerShown() { return player.g.unlocked },
            branches: ["g"],
            canBuyMax() { return false },
            freeSpaceBuildings() {
                let x = new Decimal(0);
                if (hasUpgrade("s", 11)) x = x.plus(1);
                if (hasUpgrade("s", 22)) x = x.plus(upgradeEffect("s", 22));
                return x;
            },
            freeSpaceBuildings1to4() {
                let x = new Decimal(0);
                if (player.s.unlocked) x = x.plus(buyableEffect("s", 15));
                return x;
            },
            totalBuildingLevels() {
                let len = Object.keys(player.s.buyables).length
                if (len == 0) return new Decimal(0);
                if (len == 1) return Object.values(player.s.buyables)[0].plus(tmp.s.freeSpaceBuildings).plus(toNumber(Object.keys(player.s.buyables)) < 15 ? tmp.s.freeSpaceBuildings1to4 : 0)
                let l = Object.values(player.s.buyables).reduce((a, c, i) => Decimal.add(a, c).plus(toNumber(Object.keys(player.s.buyables)[i]) < 15 ? tmp.s.freeSpaceBuildings1to4 : 0)).plus(tmp.s.freeSpaceBuildings.times(len));
                return l;
            },
            manualBuildingLevels() {
                let len = Object.keys(player.s.buyables).length
                if (len == 0) return new Decimal(0);
                if (len == 1) return Object.values(player.s.buyables)[0]
                let l = Object.values(player.s.buyables).reduce((a, c) => Decimal.add(a, c));
                return l;
            },
            buildingPower() {
                if (!unl(this.layer)) return new Decimal(0);
                let pow = new Decimal(1);
                if (hasUpgrade("s", 21)) pow = pow.plus(0.08);
                if (hasAchievement("a", 103)) pow = pow.plus(.1);

                return pow;
            },
            autoPrestige() { return false },
            update(diff) {
            },
            upgrades: {
                rows: 3,
                cols: 5,
                11: {
                    title: "Space X",
                    description: "Add a free level to all Space Buildings.",
                    cost() { return new Decimal(2) },
                    unlocked() { return player[this.layer].unlocked }
                },
                12: {
                    title: "Generator Generator",
                    description: "Generator Power boosts its own generation.",
                    cost() { return new Decimal(3) },
                    unlocked() { return hasUpgrade("s", 11) },
                    effect() { return player.g.power.add(1).log10().add(1) },
                    effectDisplay() { return format(tmp.s.upgrades[12].effect) + "x" },
                },
                13: {
                    title: "Shipped Away",
                    description: "Space Building Levels boost Generator Power gain, and you get 2 extra Space.",
                    cost() { return new Decimal([1e37, 1e59, 1e94][player[this.layer].unlockOrder || 0]) },
                    currencyDisplayName: "generator power",
                    currencyInternalName: "power",
                    currencyLayer: "g",
                    unlocked() { return hasUpgrade("s", 11) },
                    effect() { return softcap("s13", Decimal.pow(20, tmp.s.totalBuildingLevels)) },
                    effectDisplay() { return format(tmp.s.upgrades[13].effect) + "x" },
                    formula: "20^x",
                },
                14: {
                    title: "Into The Repeated",
                    description: "Unlock the <b>Quaternary Space Building</b>.",
                    cost() { return new Decimal(4) },
                    unlocked() { return hasUpgrade("s", 12) || hasUpgrade("s", 13) }
                },
                15: {
                    title: "Four Square",
                    description: "The <b>Quaternary Space Building</b> cost is cube rooted, is 3x as strong, and also affects <b>BP Combo</b> (brought to the 2.7th root).",
                    cost() { return new Decimal([1e65, (player.e.unlocked ? 1e94 : 1e88), 1e129][player[this.layer].unlockOrder || 0]) },
                    currencyDisplayName: "generator power",
                    currencyInternalName: "power",
                    currencyLayer: "g",
                    unlocked() { return hasUpgrade("s", 14) },
                },
                21: {
                    title: "Spacious",
                    description: "All Space Buildings are 8% stronger.",
                    cost() { return new Decimal(13) },
                    unlocked() { return hasAchievement("a", 33) },
                },
                22: {
                    title: "Spacetime Anomaly",
                    description: "Non-extra Time Capsules provide free Space Buildings.",
                    cost() { return new Decimal(2.5e207) },
                    currencyDisplayName: "generator power",
                    currencyInternalName: "power",
                    currencyLayer: "g",
                    unlocked() { return hasAchievement("a", 33) },
                    effect() { return player.t.points.cbrt().floor() },
                    effectDisplay() { return "+" + formatWhole(tmp.s.upgrades[22].effect) },
                },
                23: {
                    title: "Revert Space",
                    description() { return (player.e.unlocked && player.t.unlocked && (player.s.unlockOrder || 0) == 0) ? "All Space Building costs are divided by 1e20." : ("Space acts as if you chose it first" + (player.t.unlocked ? ", and all Space Building costs are divided by 1e20." : ".")) },
                    cost() { return new Decimal(player.s.unlockOrder >= 2 ? 1e141 : (player.e.unlocked ? 1e105 : 1e95)) },
                    currencyDisplayName: "generator power",
                    currencyInternalName: "power",
                    currencyLayer: "g",
                    unlocked() { return ((player.e.unlocked && player.t.unlocked && (player.s.unlockOrder || 0) == 0) || player[this.layer].unlockOrder > 0 || hasUpgrade("s", 23)) && hasUpgrade("s", 13) },
                    onPurchase() { player[this.layer].unlockOrder = 0; },
                },
                24: {
                    title: "Want More?",
                    description: "All four of the <b>I Need More</b> upgrades are stronger based on your Total Space Buildings.",
                    cost() { return new Decimal(1e177) },
                    currencyDisplayName: "generator power",
                    currencyInternalName: "power",
                    currencyLayer: "g",
                    unlocked() { return hasAchievement("a", 33) },
                    effect() {
                        return tmp.s.totalBuildingLevels.sqrt().div(5).plus(1);
                    },
                    effectDisplay() { return format(tmp.s.upgrades[24].effect.sub(1).times(100)) + "% stronger" },
                },
                25: {
                    title: "Another One?",
                    description: "Unlock the Quinary Space Building.",
                    cost() { return new Decimal(1e244) },
                    currencyDisplayName: "generator power",
                    currencyInternalName: "power",
                    currencyLayer: "g",
                    unlocked() { return hasAchievement("a", 33) },
                },
            },
            divBuildCosts() {
                let div = new Decimal(1);
                if (hasUpgrade("s", 23) && player.t.unlocked) div = div.times(1e20);
                return div;
            },
            buildScalePower() {
                let scale = new Decimal(1);
                if (hasUpgrade("p", 42)) scale = scale.times(.5);
                return scale;
            },
            buyables: {
                rows: 1,
                cols: 10,
                showRespec() { return player.s.unlocked },
                respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
                    player[this.layer].spent = new Decimal(0);
                    resetBuyables(this.layer)
                    doReset(this.layer, true) // Force a reset
                },
                respecText: "Respec Space Buildings", // Text on Respec button, optional
                11: {
                    title: "Primary Space Building",
                    costExp() {
                        let exp = 1.35;
                        return exp;
                    },
                    cost(x = player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                        let base = tmp.s.buildingBaseCosts[this.id];
                        if (x.eq(0)) return new Decimal(0);
                        return Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp[this.layer].buyables[this.id].costExp)).times(base).div(tmp.s.divBuildCosts);
                    },
                    freeLevels() {
                        let levels = tmp.s.freeSpaceBuildings.plus(tmp.s.freeSpaceBuildings1to4);
                        return levels;
                    },
                    effect(x = player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                        let eff = Decimal.pow(x.plus(1).plus(tmp.s.freeSpaceBuildings).times(tmp.s.buildingPower), player.s.points.sqrt()).times(x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).max(1).times(4)).max(1);
                        return eff;
                    },
                    display() { // Everything else displayed in the buyable button after the title
                        let data = tmp[this.layer].buyables[this.id]
                        return (tmp.nerdMode ? ("Cost Formula: " + format(tmp.s.buildingBaseCosts[this.id]) + "^((x" + ("*" + format(tmp.s.buildScalePower)) + ")^" + format(tmp[this.layer].buyables[this.id].costExp) + ")*" + format(tmp.s.buildingBaseCosts[this.id]) + "/" + format(tmp.s.divBuildCosts)) : ("Cost: " + formatWhole(data.cost) + " Generator Power")) + "\n\
                        Level: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                       "+ (tmp.nerdMode ? ("Formula: level^sqrt(spaceEnergy)*level*4") : (" Space Energy boosts Point gain & Prestige Point gain by " + format(data.effect) + "x"))
                    },
                    unlocked() { return player[this.layer].unlocked },
                    canAfford() {
                        return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)
                    },
                    buy() {
                        cost = tmp[this.layer].buyables[this.id].cost
                        player.g.power = player.g.power.sub(cost)
                        player.s.spent = player.s.spent.plus(1);
                        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    },
                    target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp[this.layer].buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) },
                    buyMax() {
                        if (!this.canAfford() || !this.unlocked()) return;
                        let target = this.target();
                        player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
                        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
                    },
                    style: { 'height': '100px' },
                    sellOne() {
                        let amount = getBuyableAmount(this.layer, this.id)
                    },
                    canSellOne() { return false },
                    autoed() { return false },
                },
                12: {
                    title: "Secondary Space Building",
                    costExp() {
                        let exp = 1.35;
                        return exp;
                    },
                    cost(x = player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                        let base = tmp.s.buildingBaseCosts[this.id];
                        return Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp[this.layer].buyables[this.id].costExp)).times(base).div(tmp.s.divBuildCosts);
                    },
                    freeLevels() {
                        let levels = tmp.s.freeSpaceBuildings.plus(tmp.s.freeSpaceBuildings1to4);
                        return levels;
                    },
                    effect(x = player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                        let eff = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).sqrt();
                        return eff;
                    },
                    display() { // Everything else displayed in the buyable button after the title
                        let data = tmp[this.layer].buyables[this.id]
                        return (tmp.nerdMode ? ("Cost Formula: " + format(tmp.s.buildingBaseCosts[this.id]) + "^((x*" + format(tmp.s.buildScalePower) + ")^" + format(tmp[this.layer].buyables[this.id].costExp) + ")*" + format(tmp.s.buildingBaseCosts[this.id]) + "/" + format(tmp.s.divBuildCosts)) : ("Cost: " + formatWhole(data.cost) + " Generator Power")) + "\n\
                        Level: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                        "+ (tmp.nerdMode ? ("Formula: sqrt(level)") : ("Adds to base of Booster/Generator effects by +" + format(data.effect)))
                    },
                    unlocked() { return player[this.layer].unlocked },
                    canAfford() {
                        return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)
                    },
                    buy() {
                        cost = tmp[this.layer].buyables[this.id].cost
                        player.g.power = player.g.power.sub(cost)
                        player.s.spent = player.s.spent.plus(1);
                        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    },
                    target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp[this.layer].buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) },
                    buyMax() {
                        if (!this.canAfford() || !this.unlocked()) return;
                        let target = this.target();
                        player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
                        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
                    },
                    style: { 'height': '100px' },
                    sellOne() {
                        let amount = getBuyableAmount(this.layer, this.id)
                    },
                    canSellOne() { return false },
                    autoed() { return false },
                },
                13: {
                    title: "Tertiary Space Building",
                    costExp() {
                        let exp = 1.35;
                        return exp;
                    },
                    cost(x = player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                        let base = tmp.s.buildingBaseCosts[this.id];
                        return Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp[this.layer].buyables[this.id].costExp)).times(base).div(tmp.s.divBuildCosts);
                    },
                    freeLevels() {
                        let levels = tmp.s.freeSpaceBuildings.plus(tmp.s.freeSpaceBuildings1to4);
                        return levels;
                    },
                    effect(x = player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                        let eff = Decimal.pow(1e18, x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).pow(0.9))
                        eff = softcap("spaceBuilding3", eff);
                        return eff;
                    },
                    display() { // Everything else displayed in the buyable button after the title
                        let data = tmp[this.layer].buyables[this.id]
                        return (tmp.nerdMode ? ("Cost Formula: " + format(tmp.s.buildingBaseCosts[this.id]) + "^((x*" + format(tmp.s.buildScalePower) + ")^" + format(tmp[this.layer].buyables[this.id].costExp) + ")*" + format(tmp.s.buildingBaseCosts[this.id]) + "/" + format(tmp.s.divBuildCosts)) : ("Cost: " + formatWhole(data.cost) + " Generator Power")) + "\n\
                        Level: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.times(tmp.s.buildingPower).gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                        "+ (tmp.nerdMode ? ("Formula: " + (data.effect.gte("e3e9") ? "10^((level^0.3)*5.45e6)" : "1e18^(level^0.9)")) : ("Divide Booster/Generator cost by " + format(data.effect)))
                    },
                    unlocked() { return player[this.layer].unlocked },
                    canAfford() {
                        return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)
                    },
                    buy() {
                        cost = tmp[this.layer].buyables[this.id].cost
                        player.g.power = player.g.power.sub(cost)
                        player.s.spent = player.s.spent.plus(1);
                        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    },
                    target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp[this.layer].buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) },
                    buyMax() {
                        if (!this.canAfford() || !this.unlocked()) return;
                        let target = this.target();
                        player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
                        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
                    },
                    style: { 'height': '100px' },
                    sellOne() {
                        let amount = getBuyableAmount(this.layer, this.id)
                    },
                    canSellOne() { return false },
                    autoed() { return false },
                },
                14: {
                    title: "Quaternary Space Building",
                    costExp() {
                        let exp = 1.35;
                        return exp;
                    },
                    cost(x = player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                        let base = tmp.s.buildingBaseCosts[this.id];
                        let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp[this.layer].buyables[this.id].costExp)).times(base);
                        if (hasUpgrade("s", 15)) cost = cost.root(3);
                        return cost.div(tmp.s.divBuildCosts);
                    },
                    freeLevels() {
                        let levels = tmp.s.freeSpaceBuildings.plus(tmp.s.freeSpaceBuildings1to4);
                        if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[14 + 1] || 0);
                        return levels;
                    },
                    effect(x = player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                        let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).times((hasUpgrade("s", 15)) ? 3 : 1).add(1).pow(1.25);
                        ret = softcap("spaceBuilding4", ret);
                        return ret;
                    },
                    display() { // Everything else displayed in the buyable button after the title
                        let data = tmp[this.layer].buyables[this.id]
                        let extForm = hasUpgrade("s", 15) ? 3 : 1
                        return (tmp.nerdMode ? ("Cost Formula: " + format(tmp.s.buildingBaseCosts[this.id]) + "^((x*" + format(tmp.s.buildScalePower) + ")^" + format(tmp[this.layer].buyables[this.id].costExp) + ")*" + format(tmp.s.buildingBaseCosts[this.id]) + (hasUpgrade("s", 15) ? "^(1/3)" : "") + "/" + format(tmp.s.divBuildCosts)) : ("Cost: " + formatWhole(data.cost) + " Generator Power")) + "\n\
                        Level: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                        "+ (tmp.nerdMode ? ("Formula: " + (data.effect.gte(1e6) ? ("log(level" + (extForm == 1 ? "" : "*3") + "+1)*2.08e5") : ("(level" + (extForm == 1 ? "" : "*3") + "+1)^1.25"))) : ("<b>Discount One</b> is raised to the power of " + format(data.effect)))
                    },
                    unlocked() { return player[this.layer].unlocked && hasUpgrade("s", 14) },
                    canAfford() {
                        return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)
                    },
                    buy() {
                        cost = tmp[this.layer].buyables[this.id].cost
                        player.g.power = player.g.power.sub(cost)
                        player.s.spent = player.s.spent.plus(1);
                        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    },
                    target() { return player.g.power.times(tmp.s.divBuildCosts).pow(hasUpgrade("s", 15) ? 3 : 1).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp[this.layer].buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) },
                    buyMax() {
                        if (!this.canAfford() || !this.unlocked()) return;
                        let target = this.target();
                        player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
                        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
                    },
                    style: { 'height': '100px' },
                    sellOne() {
                        let amount = getBuyableAmount(this.layer, this.id)
                    },
                    canSellOne() { return false },
                    autoed() { return false },
                },
                15: {
                    title: "Quinary Space Building",
                    cost(x = player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                        let base = tmp.s.buildingBaseCosts[this.id];
                        let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(1.35)).times(base);
                        return cost.div(tmp.s.divBuildCosts);
                    },
                    freeLevels() {
                        let levels = tmp.s.freeSpaceBuildings;
                        return levels;
                    },
                    effect(x = player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                        let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).div(2);
                        return ret.floor();
                    },
                    display() { // Everything else displayed in the buyable button after the title
                        let data = tmp[this.layer].buyables[this.id]
                        return (tmp.nerdMode ? ("Cost Formula: " + format(tmp.s.buildingBaseCosts[this.id]) + "^((x*" + format(tmp.s.buildScalePower) + ")^1.35)*" + format(tmp.s.buildingBaseCosts[this.id]) + "/" + format(tmp.s.divBuildCosts)) : ("Cost: " + formatWhole(data.cost) + " Generator Power")) + "\n\
                        Level: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                        "+ (tmp.nerdMode ? ("Formula: level" + (hasUpgrade("q", 32) ? "" : "/2")) : ("Add " + formatWhole(data.effect) + " levels to all previous Space Buildings."))
                    },
                    unlocked() { return player[this.layer].unlocked && hasUpgrade("s", 25) },
                    canAfford() {
                        return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)
                    },
                    buy() {
                        cost = tmp[this.layer].buyables[this.id].cost
                        player.g.power = player.g.power.sub(cost)
                        player.s.spent = player.s.spent.plus(1);
                        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    },
                    target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(1.35).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) },
                    buyMax() {
                        if (!this.canAfford() || !this.unlocked()) return;
                        let target = this.target();
                        player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
                        player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
                    },
                    style: { 'height': '100px' },
                    sellOne() {
                        let amount = getBuyableAmount(this.layer, this.id)
                    },
                    canSellOne() { return false },
                    autoed() { return false },
                },
            },
            milestones: {
                0: {
                    requirementDescription: "2 Space Energy",
                    done() { return player.s.best.gte(2) || hasAchievement("a", 71) },
                    effectDescription: "Keep Booster/Generator milestones on reset.",
                },
                1: {
                    requirementDescription: "3 Space Energy",
                    done() { return player.s.best.gte(3) || hasAchievement("a", 41) || hasAchievement("a", 71) },
                    effectDescription: "Keep Prestige Upgrades on reset.",
                },
                2: {
                    requirementDescription: "4 Space Energy",
                    done() { return player.s.best.gte(4) || hasAchievement("a", 71) },
                    effectDescription: "Keep Generator Upgrades on all resets.",
                },
                3: {
                    requirementDescription: "5 Space Energy",
                    done() { return player.s.best.gte(5) || hasAchievement("a", 71) },
                    effectDescription: "Unlock Auto-Generators.",
                    toggles: [["g", "auto"]],
                },
                4: {
                    requirementDescription: "8 Space Energy",
                    done() { return player.s.best.gte(8) || hasAchievement("a", 71) },
                    effectDescription: "Generators reset nothing.",
                },
            },
        },

        "a": {
            startData() {
                return {
                    unlocked: true,
                }
            },
            color: "yellow",
            row: "side",
            layerShown() { return true },
            tooltip() { // Optional, tooltip displays when the layer is locked
                return ("Achievements")
            },
            achievements: {
                rows: 16,
                cols: 5,
                11: {
                    name: "All that progress is gone!",
                    done() { return player.p.points.gt(0) },
                    tooltip: "Perform a Prestige reset.",
                    image: "images/achs/11.png",
                },
                12: {
                    name: "Point Hog",
                    done() { return player.points.gte(25) },
                    tooltip: "Reach 25 Points.",
                    image: "images/achs/12.png",
                },
                13: {
                    name: "Prestige all the Way",
                    done() { return player.p.upgrades.length >= 3 },
                    tooltip: "Purchase 3 Prestige Upgrades. Reward: Gain 10% more Prestige Points.",
                    image: "images/achs/13.png",
                },
                14: {
                    name: "Prestige^2",
                    done() { return player.p.points.gte(25) },
                    tooltip: "Reach 25 Prestige Points.",
                    image: "images/achs/14.png",
                },
                21: {
                    name: "New Rows Await!",
                    done() { return player.b.unlocked || player.g.unlocked },
                    tooltip: "Perform a Row 2 reset. Reward: Generate Points 10% faster, and unlock 3 new Prestige Upgrades.",
                    image: "images/achs/21.png",
                },
                22: {
                    name: "I Will Have All of the Layers!",
                    done() { return player.b.unlocked && player.g.unlocked },
                    tooltip: "Unlock Boosters & Generators.",
                    image: "images/achs/22.png",
                },
                23: {
                    name: "Prestige^3",
                    done() { return player.p.points.gte(1e45) },
                    tooltip: "Reach 1e45 Prestige Points. Reward: Unlock 3 new Prestige Upgrades.",
                    image: "images/achs/23.png",
                },
                24: {
                    name: "Hey I don't own that company yet!",
                    done() { return player.points.gte(1e100) },
                    tooltip: "Reach 1e100 Points.",
                    image: "images/achs/24.png",
                },
                31: {
                    name: "Further Further Down",
                    done() { return player.e.unlocked || player.t.unlocked || player.s.unlocked },
                    tooltip: "Perform a Row 3 reset. Reward: Generate Points 50% faster, and Boosters/Generators don't increase each other's requirements.",
                    image: "images/achs/31.png",
                },
                32: {
                    name: "Why no meta-layer?",
                    done() { return player.points.gte(Number.MAX_VALUE) },
                    tooltip: "Reach 1.8e308 Points. Reward: Double Prestige Point gain.",
                    image: "images/achs/32.png",
                },
                33: {
                    name: "That Was Quick",
                    done() { return player.e.unlocked && player.t.unlocked && player.s.unlocked },
                    tooltip: "Unlock Time, Enhance, & Space. Reward: Unlock some new Time, Enhance, & Space Upgrades.",
                    image: "images/achs/33.png",
                },
                34: {
                    name: "Who Needs Row 2 Anyway?",
                    done() { return player.b.best.eq(0) && player.g.best.eq(0) && player.points.gte("1e525") },
                    tooltip: "Reach 1e525 Points without any Boosters or Generators.",
                    image: "images/achs/34.png",
                },
                42: {
                    name: "Yet Another Inf- [COPYRIGHT]",
                    done() { return player.g.power.gte(Number.MAX_VALUE) },
                    tooltip: "Reach 1.8e308 Generator Power.",
                    image: "images/achs/42.png",
                },
                43: {
                    name: "Enhancing a Company",
                    done() { return player.e.points.gte(1e100) },
                    tooltip: "Reach 1e100 Enhance Points.",
                    image: "images/achs/43.png",
                },
                44: {
                    name: "Space is for Dweebs",
                    done() { return tmp.s.manualBuildingLevels.eq(0) && player.g.power.gte("1e370") },
                    tooltip: "Reach 1e370 Generator Power without any Space Buildings.",
                    image: "images/achs/44.png",
                },
            },
            tabFormat: [
                "blank",
                ["display-text", function () { return "Achievements: " + player.a.achievements.length + "/" + (Object.keys(tmp.a.achievements).length - 2) }],
                "blank", "blank",
                "achievements",
            ],
            update(diff) {	// Added this section to call adjustNotificationTime every tick, to reduce notification timers
                //adjustNotificationTime(diff);
            },
        },

        "spells": {
            type: "none",
            row: "side",
            color: "#FF1493",

            startData() {
                return {
                    unlocked: true,
                    mana: 0,
                    points: new Decimal(0),
                    selectedPlayer: undefined,
                    selectedLayer: undefined,
                    s1time: 0,
                    s3time: 0,
                }
            },

            tabFormat: [
                ["display-text", function () { return `You have ${format(player.spells.mana)} mana with cap of 100. It regenerates at speed of 0.1MP/sec (do note game default speedup of 10x)` }],
                ["display-text", "List of enemy players:"],
                function () {
                    let ret = ["column", []]
                    for (let item of Object.keys(currentGameData.gameState.playersStates).filter(v => v != currentGameData.playerID)) {
                        ret[1].push(["row", [
                            ["display-text", `${currentGameData.gameState.players.filter(v => item == v.ip)[0].nick}`],
                            ["clickable", `s${item}`]
                        ]])
                    }
                    return ret
                },
                function () {
                    let ret = ["row", []]
                    for (let item of ["p", "g", "b", "s", "t", "e"]) {
                        ret[1].push(["clickable", `sl${item}`])
                    }
                    return ret
                },
                ["row", [
                    ["buyable", "s1"],
                    ["buyable", "s2"],
                    ["buyable", "s3"],
                ]],
                function () {
                    if (player.spells.s1time > 0) return ["display-text", `Player have:<br>
                    ${format(currentGameData.gameState.playersStates[player.spells.selectedPlayer].p.points)} p<br>
                    ${format(currentGameData.gameState.playersStates[player.spells.selectedPlayer].b.points)} b<br>
                    ${format(currentGameData.gameState.playersStates[player.spells.selectedPlayer].g.points)} g<br>
                    ${format(currentGameData.gameState.playersStates[player.spells.selectedPlayer].t.points)} t<br>
                    ${format(currentGameData.gameState.playersStates[player.spells.selectedPlayer].e.points)} e<br>
                    ${format(currentGameData.gameState.playersStates[player.spells.selectedPlayer].s.points)} s`]
                }
            ],

            update(diff) {
                player.spells.mana += diff * 0.1
                player.spells.mana = Math.min(player.spells.mana, 100) 
                
                player.spells.s1time = Math.max(0, player.spells.s1time - diff)
                player.spells.s3time = Math.max(0, player.spells.s3time - diff)
            },
            clickables: generatePlayerSelectClickables,
            buyables: {
                "s1": {
                    display: "Spend 25 mana to see other player ALL resources for 5 secs (locks selecting players)",
                    canAfford() { return player.spells.mana >= 25 && player.spells.selectedPlayer},
                    buy() {
                        player.spells.mana -= 25
                        player.spells.s1time = 50
                    }
                },
                "s2": {
                    display: "Spend 90 mana to half one selected resource of another player (rounds up)",
                    canAfford() { return player.spells.mana >= 90 },
                    buy() {
                        player.spells.mana -= 90
                        halfPlayerResource(player.spells.selectedPlayer, player.spells.selectedLayer)
                    }
                },
                "s3": {
                    display: "Spend 50 mana to boost point gain x3 for 10 secs",
                    canAfford() { return player.spells.mana >= 50 },
                    buy() {
                        player.spells.mana -= 50
                        player.spells.s3time = 100
                    }
                }
            }
        }
    },
    getStartPoints() { return new Decimal(10) },
    canGenPoints() { return hasUpgrade("p", 11) },
    getPointGen() {
        if (!canGenPoints())
            return new Decimal(0)

        let gain = new Decimal(1)
        if (hasUpgrade("p", 12)) gain = gain.times(upgradeEffect("p", 12));
        if (hasUpgrade("p", 13)) gain = gain.times(upgradeEffect("p", 13));
        if (hasUpgrade("p", 22)) gain = gain.times(upgradeEffect("p", 22));
        if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) gain = gain.times(upgradeEffect("b", 11))

        if (player.b.unlocked) gain = gain.times(tmp.b.effect);
        if (player.g.unlocked) gain = gain.times(tmp.g.powerEff);
        if (player.t.unlocked) gain = gain.times(tmp.t.enEff);
        if (player.s.unlocked) gain = gain.times(buyableEffect("s", 11));

        if (player.spells.s3time > 0) gain = gain.times(3)

        return gain
    },
    isEndgame() { return player.points.gte(new Decimal("e3.14e16")) },
}
