<template>
    <div app class="tabs">
        <v-expand-transition>
                    <v-card v-show="tabs.length > 0 | showPivotTab">
            <v-tabs show-arrows>
                <v-tab to="/">Home</v-tab>
                <v-tab to="/pivot" v-if="showPivotTab">Pivot
                    <v-btn x-small icon text @click.prevent="closePivotTab">
                            <v-icon small>close</v-icon>
                    </v-btn>
                </v-tab>
                <v-tab v-for="tab in tabs" :key="tab.posid" :to="{path: '/person/' + tab.posid}">{{tab.name}}
                    <v-btn x-small icon text @click.prevent="closeTab(tab.posid)">
                        <v-icon small>close</v-icon>
                    </v-btn>
                </v-tab>
            </v-tabs>
        </v-card>
        </v-expand-transition>
    </div>
</template>

<script>
    export default {
        name: "Tabs",
        computed: {
            tabs() {
                return this.$store.getters.tabs
            },
            showPivotTab() {
                return this.$store.state.pivotTab
            }
        },
        methods: {
            closeTab(object) {
                this.$router.push('/');
                this.$store.dispatch('removeSelected', object)
            },
            closePivotTab() {
                this.$router.push('/');
                this.$store.dispatch('togglePivotTab')
            }
        }
    }
</script>

<style scoped>
    .v-btn:hover:before {
        background-color: transparent;
    }
</style>