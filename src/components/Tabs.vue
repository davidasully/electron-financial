<template>
    <div app class="tabs">
        <v-expand-transition>
                    <v-card flat v-show="tabs.length > 0 | showPivotTab" class="square-card">
            <v-tabs show-arrows height="35">
                <v-tab to="/">Home</v-tab>
                <v-tab to="/pivot" v-if="showPivotTab">Pivot
                    <v-btn color="error"  x-small icon text @click.prevent="closePivotTab">
                            <v-icon small>close</v-icon>
                    </v-btn>
                </v-tab>
                <v-tab v-for="tab in tabs" :key="tab.posid" :to="{path: '/person/' + tab.posid}">{{tab.name}}
                    <v-btn color="error"  x-small icon text @click.prevent="closeTab(tab.posid)">
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
                return this.$store.getters.tabs.map(i => {
                    let name = i['name'];
                    i['name'] = name.length > 37 ? name.substring(0, 30) + '...' + name.slice(-8): name;
                    return i
                })
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
                this.$store.dispatch('togglePivotTab')
            }
        }
    }
</script>

<style scoped>
    .v-btn:hover:before {
        background-color: transparent;
    }
    .square-card {
        border-radius: 0px;
    }
</style>