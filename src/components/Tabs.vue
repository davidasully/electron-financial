<template>
    <div app class="tabs">
        <v-expand-transition>
                    <v-card v-show="tabs.length > 0">
            <v-tabs show-arrows>
                <v-tab to="/">Home</v-tab>
                <v-tab v-for="tab in tabs" :key="tab.name" :to="{path: '/person/' + tab.posid}">{{tab.name}}
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
            }
        },
        methods: {
            closeTab(object) {
                this.$router.push('/')
                this.$store.dispatch('removeSelected', object)
            }
        }
    }
</script>

<style scoped>
    .v-btn:hover:before {
        background-color: transparent;
    }
</style>