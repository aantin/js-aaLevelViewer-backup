"use strict"; // é
/*
    name:           aaLevelViewer
    description:    A simple app to step through image series by index or by level

    author:         Antoine ANTIN
    creation date:  2024-03-21
    repository:     https://github.com/aantin/js-aaLevelViewer-dev
*/
(() => {
    const ENV = {
        APP_NAME: "aaLevelViewer",
    };
    const $$ = aa.html;
    // --------------------------------
    function __ (txt, lang="en") {
        aa.arg.test(txt, aa.nonEmptyString, "'txt'");
        const langs = {
            en: {},
            fr: {},
        };
        return langs[lang]?.[txt] ?? txt;
    }
    // --------------------------------
    const Level = (() => {
        const {cut, get, set} = aa.mapFactory();
        function _ (that) { return aa.getAccessor.call(that, {cut, get, set}); }
        function Level () { get(Level, "construct").apply(this, arguments); }
        const blueprint = {
            accessors: {
                publics: {
                    name:       null,
                    sources:    null,
                },
            },
            construct: function () {
                const that = _(this);
                that.sources = new aa.Collection({authenticate: aa.nonEmptyString});
            },
            methods: {
                privates: {
                },
                publics: {
                },
                setters: {
                    sources: function (sources) {
                        const that = _(this);
                        that.sources.push(...sources);
                    },
                },
            },
            verifiers: {
                name:       aa.nonEmptyString,
                sources:    aa.isArrayLike,
            },
        };
        aa.manufacture(Level, blueprint, {cut, get, set});
        return Level;
    })();
    const Series = (() => {
        const {cut, get, set} = aa.mapFactory();
        function _ (that) { return aa.getAccessor.call(that, {cut, get, set}); }
        function Series () { get(Series, "construct").apply(this, arguments); }
        const blueprint = {
            accessors: {
                publics: {
                    archive:    null,
                    name:       null,
                    levels:     null,
                },
            },
            construct: function () {
                const that = _(this);
                that.levels = new aa.Collection({authenticate: aa.instanceof(Level)});
            },
            methods: {
                privates: {
                },
                publics: {
                },
                setters: {
                    levels: function (levels) {
                        const that = _(this);
                        levels = levels.map(level => level instanceof Level ? level : new Level(level));
                        that.levels.push(...levels);
                    },
                },
            },
            verifiers: {
                archive:    aa.nonEmptyString,
                name:       aa.nonEmptyString,
                levels:     aa.isArrayLike,
            },
        };
        aa.manufacture(Series, blueprint, {cut, get, set});
        return Series;
    })();
    const LevelViewer = (() => {
        const {cut, get, set} = aa.mapFactory();
        function _ (that) { return aa.getAccessor.call(that, {cut, get, set}); }
        function LevelViewer () { get(LevelViewer, "construct").apply(this, arguments); }
        const privates = {
            singleton: null,
        };
        const blueprint = {
            accessors: {
                publics: {
                    series: null,
                },
            },
            construct: function () {
                const that = _(this);
                that.series = new aa.Collection({authenticate: aa.instanceof(Series)});
            },
            methods: {
                privates: {
                },
                publics: {
                    load:   function (data={}) {
                        aa.arg.test(data, aa.verifyObject({
                            series: aa.isArrayLike,
                        }), "'data'");
                        data.sprinkle({
                            series: []
                        });
                        const that = _(this);
                        data.series = data.series.map(serie => serie instanceof Series ? serie : new Series(serie));
                        that.series.push(...data.series);
                    },
                    render: function () {
                        const that = _(this);
                        const body = document.body;
                        
                        let seriesIndex = -1;
                        let imgIndex = -1;
                        let levelIndex = -1;
                        
                        let currentSeries = that.series.first;
                        let currentLevel = currentSeries.levels?.first;
                        if (!currentSeries) {
                            document.querySelector("#loading").innerHTML = __(`Series not found`);
                            return;
                        }

                        ({
                            "image-next": {
                                description: __("Next image"),
                                shortcut: "<Right>",
                                on: {execute:  e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    imgIndex++;
                                    actions.update();
                                    document.querySelector("#right")?.focus();
                                }},
                            },
                            "image-previous": {
                                description: __("Previous image"),
                                shortcut: "<Left>",
                                on: {execute: e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    imgIndex--;
                                    actions.update();
                                    document.querySelector("#left")?.focus();
                                }},
                            },
                            "level-previous": {
                                description: __("Previous level"),
                                shortcut: "<Up>",
                                on: {execute: e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    levelIndex--;
                                    actions.update();
                                    document.querySelector("#up")?.focus();
                                }},
                            },
                            "level-next": {
                                description: __("Next level"),
                                shortcut: "<Down>",
                                on: {execute: e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    levelIndex++;
                                    actions.update();
                                    document.querySelector("#down")?.focus();
                                }},
                            },
                            "series-previous": {
                                description: __("Previous series"),
                                shortcut: "<PageUp>",
                                on: {execute: e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    seriesIndex--;
                                    if (that.series.length > 1) {
                                        imgIndex = 0;
                                        levelIndex = 0;
                                    }
                                    actions.update();
                                    document.querySelector("#page-up")?.focus();
                                }}
                            },
                            "series-next": {
                                description: __("Next series"),
                                shortcut: "<PageDown>",
                                on: {execute: e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    seriesIndex++;
                                    if (that.series.length > 1) {
                                        imgIndex = 0;
                                        levelIndex = 0;
                                    }
                                    actions.update();
                                    document.querySelector("#page-down")?.focus();
                                }}
                            },
                        }).forEach((spec, name) => {
                            spec.sprinkle({
                                name,
                                app: ENV.APP_NAME,
                            });
                            const shortcut = spec.shortcut;
                            if (shortcut) {
                                delete spec.shortcut;
                            }
                            const action = new aa.Action(spec);
                            if (shortcut) {
                                aa.events.app(ENV.APP_NAME).on(shortcut, action);
                            }
                        });

                        const actions = {
                            start: () => {
                                seriesIndex = 0;
                                imgIndex = 0;
                                levelIndex = 0;

                                const loading = document.querySelector("#loading");
                                loading?.parentNode?.removeChild(loading);

                                body.style.backgroundImage = `url(${currentLevel.sources[imgIndex]})`;
                                body.append($$("aside.bottom",
                                    $$(`button#page-up.icon${that.series.length < 2 ? '.hidden' : ''}`, $$("icon.step-backward") /* ⇞ */, {
                                        disabled: that.series.length < 2,
                                        on: {click: e => {
                                            aa.action("series-previous", a => a.execute());
                                        }}},
                                        $$("tooltip", {
                                        text: "Previous series",
                                        direction: "left",
                                        shortcut: aa.shortcut.format("<PageUp>", ["simple"])
                                    })),
                                    $$("h1#series-name", currentSeries.name),
                                    $$(`button#page-down.icon${that.series.length < 2 ? '.hidden' : ''}`, $$("icon.step-forward") /* ⇟ */, {
                                        disabled: that.series.length < 2,
                                        on: {click: e => {
                                            aa.action("series-next", a => a.execute());
                                        }}},
                                        $$("tooltip", {
                                        text: "Next series",
                                        direction: "right",
                                        shortcut: aa.shortcut.format("<PageDown>", ["simple"])
                                    })),
                                ));
                                body.append($$("aside.top",
                                    $$("table",
                                        $$("tr",
                                            $$("td"),
                                            $$("td", $$("button#up.icon", $$("span.fa.fa-fw.fa-chevron-up"), {
                                                on: {click: e => {
                                                    levelIndex--;
                                                    actions.update();
                                                }}
                                            }, $$("tooltip", {
                                                direction: "left",
                                                text: aa.action("level-previous")?.description,
                                                shortcut: aa.shortcut.format("<Up>", ["simple"])
                                            }))),
                                        ),
                                        $$("tr",
                                            $$("td", $$("button#left.icon", $$("span.fa.fa-fw.fa-chevron-left"), {
                                                on: {click: e => {
                                                    imgIndex--;
                                                    actions.update();
                                                }}
                                            }, $$("tooltip", {
                                                direction: "left",
                                                text: aa.action("image-previous")?.description,
                                                shortcut: aa.shortcut.format("<Left>", ["simple"])
                                            }))),
                                            $$("td"),
                                            $$("td", $$("button#right.icon", $$("span.fa.fa-fw.fa-chevron-right"), {
                                                on: {click: e => {
                                                    imgIndex++;
                                                    actions.update();
                                                }}
                                            }, $$("tooltip", {
                                                direction: "right",
                                                text: aa.action("image-next")?.description,
                                                shortcut: aa.shortcut.format("<Right>", ["simple"])
                                            }))),
                                        ),
                                        $$("tr",
                                            $$("td"),
                                            $$("td", $$("button#down.icon", $$("span.fa.fa-fw.fa-chevron-down"), {
                                                on: {click: e => {
                                                    levelIndex++;
                                                    actions.update();
                                                }}
                                            }, $$("tooltip", {
                                                direction: "right",
                                                text: aa.action("level-next")?.description,
                                                shortcut: aa.shortcut.format("<Down>", ["simple"])
                                            }))),
                                        ),
                                    ),
                                    $$("h1#label", currentLevel.name),
                                    $$(`a#archive${currentSeries.archive ? '' : '.hidden'}`, {href: currentSeries.archive}, currentSeries.archive?.getFilename() ?? '')
                                ));
                            },
                            update: e => {
                                // Series:
                                if (seriesIndex < 0) seriesIndex = that.series.length - 1;
                                if (seriesIndex >= that.series.length) seriesIndex = 0;
                                currentSeries = that.series[seriesIndex];
                                const archive = document.querySelector("#archive");
                                archive.classList[currentSeries.archive ? "remove" : "add"]("hidden");
                                archive.innerHTML = currentSeries.archive?.getFilename() ?? '';
                                document.querySelector("#series-name").innerHTML = currentSeries.name ?? '';

                                // Level:
                                if (levelIndex < 0) levelIndex = currentSeries.levels.length - 1;
                                if (levelIndex >= currentSeries.levels.length) levelIndex = 0;
                                currentLevel = currentSeries.levels[levelIndex];
                                document.querySelector("#label").innerHTML = currentLevel.name;
                                
                                // Source:
                                if (imgIndex >= currentLevel.sources.length) imgIndex = 0;
                                if (imgIndex < 0) imgIndex = currentLevel.sources.length - 1;
                                body.style.backgroundImage = `url(${currentLevel.sources[imgIndex]})`;
                            },
                        };

                        let count = that.series.reduce((acc, serie) => {
                            acc += currentSeries.levels.reduce((acc, level) => {
                                acc += level.sources.length;
                                return acc;
                            }, 0);
                            return acc;
                        }, 0);
                        if (count === 0) {
                            document.querySelector("#loading").innerHTML = __("Source not found");
                            return;
                        }
                        setTimeout(() => {
                            that.series.forEach(serie => {
                                serie.levels.forEach(level => {
                                    level.sources.forEach(src => {
                                        const img = new Image();
                                        img.addEventListener("load", e => {
                                            count--;
                                            if (count === 0) actions.start();
                                        });
                                        img.src = src;
                                    });
                                });
                            });
                        }, 500);
                        return this;
                    },
                },
                setters: {
                },
            },
            statics: {
                load:   function (data) {
                    privates.singleton = privates.singleton ?? new LevelViewer();
                    privates.singleton.load(data);
                    return privates.singleton;
                },
                render: function () {
                    LevelViewer
                    .load()
                    .render();
                },
            },
            verifiers: {
                series: aa.isArrayLike,
            },
        };
        aa.manufacture(LevelViewer, blueprint, {cut, get, set});
        return LevelViewer;
    })();
    aa.events.app(ENV.APP_NAME).on({
        "bodyload": () => {
            LevelViewer.render();
        }
    });

    window.LevelViewer = LevelViewer;
})();
