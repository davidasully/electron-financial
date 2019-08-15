<template>
    <v-app>
        <template>
            <div class="home">
                <v-app-bar
                        app
                        clipped-left
                        :class="{'grey darken-2': isDarkTheme, amber: !isDarkTheme}"
                >
                    <!--                    <v-icon @click="drawer = !drawer">menu</v-icon>-->
                    <span @click="navigateHome"
                          style="cursor: pointer"
                          class="title ml-3 mr-5"
                    >Business Solutions
                <span class="font-weight-light">Forecast</span></span>
                    <v-spacer></v-spacer>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-btn v-on="on" icon x-large @click.prevent="togglePivotTab">
                                <v-icon>table_chart</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ `${keepAlive.includes('PivotView') ? 'Close' : 'Open'} pivot tab`}}</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-btn v-on="on" icon x-large @click.prevent="exportCSV">
                                <v-icon>save</v-icon>
                            </v-btn>
                        </template>
                        <span>Export data to CSV</span>
                    </v-tooltip>

                    <!--BEGIN ADD NEW FORM -->
                    <v-dialog v-model="dialog" persistent max-width="600px">
                        <template v-slot:activator="{ on }">
                            <v-btn
                                    icon
                                    x-large
                                    class="mr-5"
                                    v-on="on"
                            >
                                <v-icon>add_circle</v-icon>
                            </v-btn>
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
                                            <!--                                            <v-flex xs8 sm3>-->
                                            <!--                                                <v-text-field-->
                                            <!--                                                        label="Forecast Amount*"-->
                                            <!--                                                        :rules="[v => !!v || 'Forecast amount required']"-->
                                            <!--                                                        required-->
                                            <!--                                                        v-model="position.amt"-->
                                            <!--                                                ></v-text-field>-->
                                            <!--                                            </v-flex>-->
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
                                            <!--                                            <v-flex xs12>-->
                                            <!--                                                <v-textarea-->
                                            <!--                                                        label="Notes"-->
                                            <!--                                                        filled-->
                                            <!--                                                        v-model="position.note"-->
                                            <!--                                                        :rules="[v => (!v || v.length <= 255) || 'A maximum of 255 characters is allowed.']"-->
                                            <!--                                                ></v-textarea>-->
                                            <!--                                            </v-flex>-->
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
                    ></v-text-field>

                </v-app-bar>


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

                    <v-overlay :value="overlay">
                        <v-progress-circular indeterminate size="64"></v-progress-circular>
                    </v-overlay>

                    <Tabs></Tabs>

                    <keep-alive :include="keepAlive">
                        <router-view></router-view>
                    </keep-alive>

                </v-content>
                <v-footer app>
                    <img :src="require(`@/assets/logo_${isDarkTheme ? 'dark' : 'light'}.png`)" height="60px"
                         alt="ASU Logo">
                    <v-spacer></v-spacer>
                    <v-switch @change="setDarkMode"
                              v-model="darkModeState"
                              :label="`Lights ${darkModeState ? 'on' : 'out'}`"
                              :color="`${darkModeState ? 'error' : 'accent'}`"
                    ></v-switch>
                </v-footer>
            </div>
        </template>
    </v-app>
</template>

<script>
    import Tabs from '@/components/Tabs'

    const initialState = () => {
        return {
            darkModeState: true,
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
            isDarkTheme() {
                return this.$vuetify.theme.dark
            },
            overlay() {
                return this.$store.state.overlay
            }
        },
        created() {
            this.$vuetify.theme.dark = this.darkModeState;
            this.$store.dispatch('loadBPC');
            this.$store.dispatch('loadPersons');
            this.$store.dispatch('loadForecasts');
            this.$store.dispatch('loadMappedAccounts');
            this.$store.dispatch('loadDefaultPositions');
        },
    }
</script>
