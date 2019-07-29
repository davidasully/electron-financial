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
                    <v-btn  icon x-large class="mr-5=2">
                        <v-icon>add_circle_outline</v-icon>
                    </v-btn>
                    <v-btn icon x-large class="mr-1">
                        <v-icon>create</v-icon>
                    </v-btn>
                    <v-btn icon x-large class="mr-5">
                        <v-icon>delete_outline</v-icon>
                    </v-btn>
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

                    <router-view></router-view>

                </v-content>
                <v-footer app>
                    <img src="@/assets/logo.png" height="60px">
                </v-footer>
            </div>
        </template>
    </v-app>
</template>

<script>
    import Tabs from './components/Tabs'

    export default {
        name: 'App',
        components: {
            Tabs
        },
        data() {
            return {
                drawer: false,
                search: '',
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
        },
        methods: {
            updateSearch() {
                this.$store.state.search = this.search
            },
            navigateHome() {
                this.$router.push('/')
            }
        },
        created() {
            this.$vuetify.theme.dark = false
            this.$store.dispatch('loadBPC')
        },
    }
</script>
