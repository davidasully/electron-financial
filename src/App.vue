<template>
    <v-app>
        <template>
            <div class="home">
                <div id="left"></div>
                <div id="bottom"></div>
                <v-app-bar flat app height="20" :class="{'grey darken-3': true, titlebar: true, 'mr-n3': true}">
                    <v-spacer></v-spacer>
                    <v-btn x-small text @click.prevent="windowMin" class="pt-2 titlebar-btns">
                        <v-icon small>maximize</v-icon>
                    </v-btn>
                    <v-btn x-small text @click.prevent="windowSize" class="titlebar-btns">
                        <v-icon v-if="!windowMax" small>fullscreen</v-icon>
                        <v-icon v-if="windowMax" small>fullscreen_exit</v-icon>
                    </v-btn>
                    <v-btn x-small text @click.prevent="windowClose" class="titlebar-btns">
                        <v-icon small>close</v-icon>
                    </v-btn>
                </v-app-bar>
                <v-toolbar flat height="65"
                           :class="{'grey darken-3': true, titlebar: true, 'mt-3': true, 'mb-1': true}"
                >
                    <!--                    <v-icon @click="drawer = !drawer">menu</v-icon>-->
                    <span @click="navigateHome"
                          style="cursor: pointer"
                          class="title ml-3 mr-5 titlebar-btns"
                    >Health Solutions
                <span class="font-weight-light">Forecast</span></span>
                    <v-spacer></v-spacer>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-btn v-on="on" icon x-large @click.prevent="togglePivotTab"
                                   class="titlebar-btns">
                                <v-icon>table_chart</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ `${keepAlive.includes('PivotView') ? 'Close' : 'Open'} pivot tab`}}</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-btn v-on="on" icon x-large @click.prevent="exportCSV"
                                   class="titlebar-btns">
                                <v-icon>save</v-icon>
                            </v-btn>
                        </template>
                        <span>Export data to CSV</span>
                    </v-tooltip>

                    <!--BEGIN ADD NEW FORM -->
                    <v-dialog v-model="dialog" persistent max-width="600px">
                        <template v-slot:activator="{ on: dialog }">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on: tooltip }">
                                    <v-btn
                                            icon
                                            x-large
                                            class="mr-5 titlebar-btns"
                                            v-on="{ ...tooltip, ...dialog }"
                                    >
                                        <v-icon>add_circle</v-icon>
                                    </v-btn>
                                </template>
                                <span>Add a line</span>
                            </v-tooltip>

                        </template>
                        <v-form ref="form">
                            <v-card>
                                <v-card-title>
                                    <span class="headline">Add Forecast Line</span>
                                </v-card-title>
                                <v-card-text>
                                    <v-container grid-list-md>
                                        <v-layout wrap>
                                            <v-flex xs12 md5>
                                                <v-radio-group row v-model="positionType">
                                                    <v-radio label="Summary" value="S" color="primary"></v-radio>
                                                    <v-radio label="New" value="N" color="primary"></v-radio>
                                                </v-radio-group>
                                            </v-flex>
                                            <v-flex xs12 md7>
                                                <v-select
                                                        :items="default_positions.map(item => item.type_name)"
                                                        label="Position Description*"
                                                        :rules="[v => !!v || 'Position type selection required.']"
                                                        required
                                                        v-model="position.type"
                                                ></v-select>
                                            </v-flex>
                                            <v-flex xs12 md6>
                                                <v-text-field
                                                        label="Empl ID (Optional)"
                                                        v-model="position.uid"
                                                ></v-text-field>
                                            </v-flex>
                                            <v-flex xs12 md6>
                                                <v-text-field
                                                        label="Position Nbr (Optional)"
                                                        v-model="position.pid"
                                                ></v-text-field>
                                            </v-flex>
                                            <v-flex xs12 md6>
                                                <v-text-field
                                                        label="Name (Optional)"
                                                        v-model="position.name"
                                                ></v-text-field>
                                            </v-flex>
                                            <v-flex xs6 md3>
                                                <v-text-field
                                                        label="Dept ID*"
                                                        :rules="[v => !!v || 'Dept ID required']"
                                                        required
                                                        v-model="position.deptid"
                                                ></v-text-field>
                                            </v-flex>
                                            <v-flex xs6 md3>
                                                <v-text-field
                                                        label="FTE*"
                                                        :rules="[v => !!v || 'FTE required']"
                                                        required
                                                        v-model="position.fte"
                                                ></v-text-field>
                                            </v-flex>
                                        </v-layout>
                                    </v-container>
                                    <small>*indicates required field</small>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="error" text @click="closeDialog">Close</v-btn>
                                    <v-btn color="primary" @click="submitNew(position)">Submit</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-form>
                    </v-dialog>
                    <!--END ADD NEW FORM -->

                    <v-text-field
                            solo-inverted
                            flat
                            hide-details
                            label="Search"
                            prepend-inner-icon="search"
                            v-model="search"
                            @keyup="updateSearch()"
                            class="titlebar-btns mr-n3"
                    ></v-text-field>

                </v-toolbar>


                <v-content>
                    <v-snackbar
                            top right
                            v-model="snackbar.active"
                            :color="snackbar.color"
                            :timeout="snackbar.timeout"
                    >
                        {{ snackbar.message }}
                        <v-btn v-if="snackbar.btn.text" text :to="snackbar.btn.to">{{snackbar.btn.text}}</v-btn>
                    </v-snackbar>

                    <v-overlay absolute :value="overlay" class="mt-n6 ml-3">
                        <v-progress-circular indeterminate size="64"></v-progress-circular>
                    </v-overlay>

                    <Tabs class="mt-n7 ml-3"></Tabs>

                    <keep-alive :include="keepAlive">
                        <router-view class="ml-3"></router-view>
                    </keep-alive>

                </v-content>
            </div>
        </template>
    </v-app>
</template>

<script>
    import Tabs from '@/components/Tabs'
    import {remote} from 'electron'

    const initialState = () => {
        return {
            windowMax: false,
            scrolled: false,
            dialog: false,
            search: '',
            positionType: 'N',
            position: {
                type: '',
                uid: '',
                name: '',
                pid: '',
                deptid: '',
                fte: 0
            }
        }
    };

    export default {
        name: 'App',
        components: {
            Tabs
        },
        data() {
            return initialState()
        },
        methods: {
            setDarkMode() {
                this.$vuetify.theme.dark = this.darkModeState
            },
            resetWindow() {
                Object.assign(this.$data, initialState())
            },
            windowClose() {
                let window = remote.getCurrentWindow();
                window.close()
            },
            windowMin() {
                let window = remote.getCurrentWindow();
                window.minimize()
            },
            windowSize() {
                let window = remote.getCurrentWindow();
                if (!window.isMaximized()) {
                    window.maximize();
                    this.windowMax = true
                } else {
                    window.unmaximize();
                    this.windowMax = false
                }
            },
            closeDialog() {
                this.dialog = false;
                this.$refs.form.resetValidation()
            },
            updateSearch() {
                this.$store.state.search = this.search
            },
            navigateHome() {
                this.$router.push('/')
            },
            togglePivotTab() {
                this.$store.dispatch('togglePivotTab')
            },
            submitNew(payload) {
                if (this.$refs.form.validate()) {
                    payload['type'] = this.default_positions.filter(dp => {
                        return dp.type_name === payload.type
                    })[0].type;
                    // payload['quarter'] = this.$store.state.set.quarter
                    this.$store.dispatch('addPerson', payload);
                    this.resetWindow();
                    this.$refs.form.resetValidation()
                }
            },
            exportCSV() {
                let csvContent = "data:text/csv;charset=utf-8,";
                let arrData = this.$store.getters.combinedBPC;
                if (arrData.length > 0) {
                    let keys = Object.keys(arrData[arrData.length - 1]);
                    csvContent += [
                        keys.join(","),
                        ...arrData.map(row => {
                                return keys.map(key => row[key])
                                    .map(item => {
                                        if (typeof item === 'string') {
                                            return "\"" + item + "\""
                                        }
                                        return item
                                    })
                                    .join(",")
                            }
                        )
                    ]
                        .join("\n")
                        .replace(/(^\[)|(]$)/gm, "");

                    const data = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", data);
                    link.setAttribute("download", "export.csv");
                    link.click();
                }
            }
        },
        computed: {
            default_positions() {
                return this.$store.state.data.default_positions
                    .filter(item => item.group === this.positionType)
                    .sort((a, b) => (a.type_name > b.type_name) ? 1 : -1)
            },
            snackbar() {
                return this.$store.state.snackbar
            },
            keepAlive() {
                let keep = ['Home'];
                let showPivot = this.$store.state.pivotTab;
                if (showPivot) {
                    keep.unshift('PivotView')
                }
                return keep
            },
            overlay() {
                let loaded = Object.values(this.$store.state.loading);
                return loaded.length !== 0 ? !loaded.every(i => !i) : true;
            }
        },
        created() {
            this.$vuetify.theme.dark = true;
            this.$store.dispatch('loadBPC');
            this.$store.dispatch('loadPersons');
            this.$store.dispatch('loadForecasts');
            this.$store.dispatch('loadMappedAccounts');
            this.$store.dispatch('loadDefaultPositions');
        },
        mounted() {
            this.$router.push('/')
        }
    }
</script>
<style>
    #bottom, #left {
        background: #424242;
        position: fixed;
    }

    #left {
        top: 0;
        bottom: 0;
        width: 12px;
    }

    #left {
        left: 0;
    }

    #bottom {
        left: 0;
        right: 0;
        height: 12px;
    }

    #bottom {
        bottom: 0;
    }

    .titlebar {
        -webkit-app-region: drag;
    }

    .titlebar-btns {
        -webkit-app-region: no-drag;
        -webkit-user-select: none;
    }

    ::-webkit-scrollbar {
        width: 12px; /* for vertical scrollbars */
        height: 12px; /* for horizontal scrollbars */
    }

    ::-webkit-scrollbar-track {
        background: #424242;
    }

    ::-webkit-scrollbar-thumb {
        background: #212121;
    }
</style>