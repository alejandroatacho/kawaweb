new Vue({
    el: "#app",
    delimiters: ["<%", "%>"],
    data() {
        return {
            data: {
                stats: {
                    out: [{}],
                    load: true
                },
                grades: {},
                scores: {
                    recent: {
                        out: [],
                        load: true,
                        more: {
                            limit: 5,
                            full: true
                        }
                    },
                    best: {
                        out: [],
                        load: true,
                        more: {
                            limit: 5,
                            full: true
                        }
                    }
                },
                maps: {
                    most: {
                        out: [],
                        load: true,
                        more: {
                            limit: 6,
                            full: true
                        }
                    }
                },
                badges: [],
                userpage: {
                    load: true,
                    content: ''
                },
                status: {}
            },
            mode: mode,
            mods: mods,
            modegulag: 0,
            load: 0,
            userid: userid
        };
    },
    async created() {
        // starting a page
        this.modegulag = this.StrtoGulagInt();
        this.LoadProfileData();
        this.LoadAllofdata();
        this.LoadUserStatus();
        console.log('Data:', this.data);
    },
    methods: {
        LoadAllofdata() {
            this.LoadMostBeatmaps();
            this.LoadScores('best');
            this.LoadScores('recent');
        },
        LoadProfileData() {
            this.$set(this.data.stats, 'load', true);
            this.$axios.get(`${window.location.protocol}//api.${domain}/v1/get_player_info`, {
                    params: {
                        id: this.userid,
                        scope: 'all'
                    }
                })
                .then(res => {
                    this.$set(this.data.stats, 'out', res.data.player.stats);
                    this.data.userpage.content = res.data.player.info.userpage_content;
                    if (this.load == 0) {
                        this.$set(this.data, 'badges', res.data.player.info.badges);
                        this.load = 1;
                    }
                    this.data.stats.load = false;
                });
        },
        LoadScores(sort) {
            this.$set(this.data.scores[`${sort}`], 'load', true);
            this.$axios.get(`${window.location.protocol}//api.${domain}/v1/get_player_scores`, {
                    params: {
                        id: this.userid,
                        mode: this.StrtoGulagInt(),
                        scope: sort,
                        limit: this.data.scores[`${sort}`].more.limit
                    }
                })
                .then(res => {
                    this.data.scores[`${sort}`].out = res.data.scores;
                    this.data.scores[`${sort}`].load = false
                    this.data.scores[`${sort}`].more.full = this.data.scores[`${sort}`].out.length != this.data.scores[`${sort}`].more.limit;
                });
        },
        LoadMostBeatmaps() {
            this.$set(this.data.maps.most, 'load', true);
            this.$axios.get(`${window.location.protocol}//api.${domain}/v1/get_player_most_played`, {
                    params: {
                        id: this.userid,
                        mode: this.StrtoGulagInt(),
                        limit: this.data.maps.most.more.limit
                    }
                })
                .then(res => {
                    this.data.maps.most.out = res.data.maps;
                    this.data.maps.most.load = false;
                    this.data.maps.most.more.full = this.data.maps.most.out.length != this.data.maps.most.more.limit;
                });
        },
        LoadUserStatus() {
            this.$axios.get(`${window.location.protocol}//api.${domain}/v1/get_player_status`, {
                    params: {
                        id: this.userid
                    }
                })
                .then(res => {
                    this.$set(this.data, 'status', res.data.player_status)
                })
                .catch(function (error) {
                    clearTimeout(loop);
                    console.log(error);
                });
            loop = setTimeout(this.LoadUserStatus, 5000);
        },
        ChangeModeMods(mode, mods) {
            if (window.event)
                window.event.preventDefault();

            this.mode = mode;
            this.mods = mods;

            this.modegulag = this.StrtoGulagInt();
            this.data.scores.recent.more.limit = 5
            this.data.scores.best.more.limit = 5
            this.data.maps.most.more.limit = 6
            this.LoadAllofdata();
        },
        AddLimit(which) {
            if (window.event)
                window.event.preventDefault();

            if (which == 'bestscore') {
                this.data.scores.best.more.limit += 5;
                this.LoadScores('best');
            } else if (which == 'recentscore') {
                this.data.scores.recent.more.limit += 5;
                this.LoadScores('recent');
            } else if (which == 'mostplay') {
                this.data.maps.most.more.limit += 4;
                this.LoadMostBeatmaps();
            }
        },
        actionIntToStr(d) {
            switch (d.action) {
                case 0:
                    return 'Idle: 🔍 Song Select';
                case 1:
                    return '🌙 AFK';
                case 2:
                    return `Playing: 🎶 ${d.info_text}`;
                case 3:
                    return `Editing: 🔨 ${d.info_text}`;
                case 4:
                    return `Modding: 🔨 ${d.info_text}`;
                case 5:
                    return 'In Multiplayer: Song Select';
                case 6:
                    return `Watching: 👓 ${d.info_text}`;
                    // 7 not used
                case 8:
                    return `Testing: 🎾 ${d.info_text}`;
                case 9:
                    return `Submitting: 🧼 ${d.info_text}`;
                    // 10 paused, never used
                case 11:
                    return 'Idle: 🏢 In multiplayer lobby';
                case 12:
                    return `In Multiplayer: Playing 🌍 ${d.info_text} 🎶`;
                case 13:
                    return 'Idle: 🔍 Searching for beatmaps in osu!direct';
                default:
                    return 'Unknown: 🚔 not yet implemented!';
            }
        },
        addCommas(nStr) {
            nStr += '';
            var x = nStr.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        },
        secondsToDhm(seconds) {
            seconds = Number(seconds);
            var dDisplay = `${Math.floor(seconds / (3600 * 24))}d `;
            var hDisplay = `${Math.floor(seconds % (3600 * 24) / 3600)}h `;
            var mDisplay = `${Math.floor(seconds % 3600 / 60)}m `;
            return dDisplay + hDisplay + mDisplay;
        },
        StrtoGulagInt() {
            switch (this.mode + "|" + this.mods) {
                case 'std|vn':
                    return 0;
                case 'taiko|vn':
                    return 1;
                case 'catch|vn':
                    return 2;
                case 'mania|vn':
                    return 3;
                case 'std|rx':
                    return 4;
                case 'taiko|rx':
                    return 5;
                case 'catch|rx':
                    return 6;
                case 'std|ap':
                    return 8;
                default:
                    return -1;
            }
        },
        StrtoModeInt() {
            switch (this.mode) {
                case 'std':
                    return 0;
                case 'taiko':
                    return 1;
                case 'catch':
                    return 2;
                case 'mania':
                    return 3;
            }
        },
        DisplayCheats(obj) {
            let htmlString = '';
            if (obj.RelaxHack === true) htmlString += `<div>Relax</div>`;
            if (obj.ARChanger === true & obj.ARChangerAR) htmlString += `<div>AR: ${obj.ARChangerAR.toFixed(2)}</div>`;
            if (obj.Timewarp === true) {
                if (obj.TimewarpRate || obj.TimewarpType == 'Rate') htmlString += `<div>TW: ${obj.TimewarpRate}%</div>`
                else if (obj.TimewarpMultiplier || obj.TimewarpType == 'Multiplier') htmlString += `<div>TW: ${obj.TimewarpMultiplier}x</div>`
            }
            if (obj.AimType) {
                if (obj.AimType == 'Correction' || obj.AimCorrectionValue)
                    if (obj.AimCorrectionRelative === true) htmlString += `<div>AC: CS + ${obj.AimCorrectionValue}</div>`
                    else htmlString += `<div>AC: ${obj.AimCorrectionValue}</div>`
                    if (obj.TapOnCorrect === true) htmlString += `<div>AC: TOC</div>`
                if (obj.AimType == 'OBAA') {
                    htmlString += `<div>AA: OsuBuddy</div>`
                }
            }
            if (obj.HiddenRemover === true) htmlString += `<div>No HD</div>`;
            if (obj.FlashlightRemover === true) htmlString += `<div>No FL</div>`;

            return htmlString;
        },
    },
    computed: {},
});