<template>
    <div class="tabs">
        <v-card>
            <v-tabs>
                <v-tab to="/">Home</v-tab>
                <v-tab v-for="tab in tabs" :key="tab.name" :to="{path: '/person/' + tab.posid}">{{tab.name}}
                    <v-btn x-small icon text @click.prevent="closeTab(tab.posid)">
                        <v-icon small>close</v-icon>
                    </v-btn>
                </v-tab>
            </v-tabs>
        </v-card>

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
                // setTimeout(() => {
                //     this.$router.push('/')
                // }, 1)
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