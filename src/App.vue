<template>
    <v-app>
        <template>
            <div class="home">
                <v-app-bar
                        app
                        clipped-left
                        color="amber"
                >
                    <v-icon @click="drawer = !drawer">menu</v-icon>
                    <span @click="navigateHome"
                          style="cursor: pointer"
                          class="title ml-3 mr-5"
                    >Business Solutions
                <span class="font-weight-light">Forecast</span></span>
                    <v-spacer></v-spacer>

                    <!--BEGIN ADD NEW FORM -->
                    <v-dialog v-model="dialog" persistent max-width="600px">
                        <template v-slot:activator="{ on }">
                            <v-btn
                                    icon
                                    x-large
                                    class="mr-5"
                                    v-on="on"
                            >
                                <v-icon>add_circle_outline</v-icon>
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
                                                    <v-radio label="Summary" value="S"></v-radio>
                                                    <v-radio label="New" value="N"></v-radio>
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
                                            <v-flex xs12 sm7>
                                                <v-text-field
                                                        label="Name (Optional)"
                                                        v-model="position.name"
                                                ></v-text-field>
                                            </v-flex>
                                            <v-flex xs8 sm3>
                                                <v-text-field
                                                        label="Forecast Amount*"
                                                        :rules="[v => !!v || 'Forecast amount required']"
                                                        required
                                                        v-model="position.amt"
                                                ></v-text-field>
                                            </v-flex>
                                            <v-flex xs4 sm2>
                                                <v-text-field
                                                        label="FTE*"
                                                        :rules="[v => !!v || 'FTE required']"
                                                        required
                                                        v-model="position.fte"
                                                ></v-text-field>
                                            </v-flex>
                                            <v-flex xs12>
                                                <v-textarea
                                                        label="Notes"
                                                        filled
                                                        v-model="position.note"
                                                        :rules="[v => (!v || v.length <= 255) || 'A maximum of 255 characters is allowed.']"
                                                ></v-textarea>
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
                    ></v-text-field>

                </v-app-bar>

                <v-navigation-drawer
                        v-model="drawer"
                        app
                        clipped
                        color="grey lighten-4"
                >
                    <v-list
                            dense
                            class="grey lighten-4"
                    >
                        <template v-for="(item, i) in items">
                            <v-layout
                                    v-if="item.heading"
                                    :key="i"
                                    align-center
                            >
                                <v-flex xs6>
                                    <v-subheader v-if="item.heading">
                                        {{ item.heading }}
                                    </v-subheader>
                                </v-flex>
                                <v-flex
                                        xs6
                                        class="text-right"
                                >
                                    <v-btn
                                            small
                                            text
                                    >edit
                                    </v-btn>
                                </v-flex>
                            </v-layout>
                            <v-divider
                                    v-else-if="item.divider"
                                    :key="i"
                                    dark
                                    class="my-4"
                            ></v-divider>
                            <v-list-item
                                    v-else
                                    :key="i"
                                    :to="item.name"
                            >
                                <v-list-item-action>
                                    <v-icon>{{ item.icon }}</v-icon>
                                </v-list-item-action>
                                <v-list-item-content>
                                    <v-list-item-title class="grey--text">
                                        {{ item.text }}
                                    </v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </template>
                    </v-list>
                </v-navigation-drawer>
                <v-content>

                    <Tabs></Tabs>

                    <keep-alive include="home">
                        <router-view></router-view>
                    </keep-alive>

                </v-content>
                <v-footer app>
                    <img src="@/assets/logo.png" height="60px">
                </v-footer>
            </div>
        </template>
    </v-app>
</template>

<script>
    import Tabs from '@/components/Tabs'

    const initialState = () => {
        return {
            drawer: false,
            dialog: false,
            search: '',
            positionType: 'N',
            position: {
                type: '',
                uid: '',
                name: '',
                pid: '',
                fte: 0,
                amt: 0,
                note: ''
            },
            items: [
                {icon: 'lightbulb_outline', text: 'Pivot Table', name: '/pivot'},
                {icon: 'touch_app', text: 'Reminders', name: ''},
                {divider: true},
                {heading: 'Labels'},
                {icon: 'add', text: 'Create new label', name: ''},
                {divider: true},
                {icon: 'archive', text: 'Archive', name: ''},
                {icon: 'delete', text: 'Trash'},
                {divider: true},
                {icon: 'settings', text: 'Settings', name: ''},
                {icon: 'chat_bubble', text: 'Trash', name: ''},
                {icon: 'help', text: 'Help'},
                {icon: 'phonelink', text: 'App downloads', name: ''},
                {icon: 'keyboard', text: 'Keyboard shortcuts', name: ''},
            ]
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
            submitNew(payload) {
                if (this.$refs.form.validate()) {
                    payload['type'] = this.default_positions.filter(dp => {
                        return dp.type_name === payload.type
                    })[0].type;
                    payload['quarter'] = this.$store.state.set.quarter
                    this.$store.dispatch('addPerson', payload)
                    this.resetWindow()
                    this.$refs.form.resetValidation()
                }
            }

        },
        computed: {
            default_positions() {
                return this.$store.state.data.default_positions
                    .filter(item => item.group === this.positionType)
                    .sort((a, b) => (a.type_name > b.type_name) ? 1 : -1)
            }
        },
        created() {
            this.$vuetify.theme.dark = false
            this.$store.dispatch('loadBPC')
            this.$store.dispatch('loadPersons')
            this.$store.dispatch('loadDefaultPositions')
        },
    }
</script>
