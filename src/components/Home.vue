<template>
    <div class="home">

        <v-container
                fluid
                fill-height
                class="my-5"
        >
            <v-layout
                    justify-center
                    align-center
            >
                <v-flex shrink>
                    <v-data-table
                            v-if="this.bpc.length > 0"
                            :headers="bpcHeaders"
                            :items="bpc"
                            :items-per-page="10"
                            :search="search"
                            item-key="posid"
                            show-select
                            class="elevation-1"
                    >
                        <template v-slot:item.empl_class="{ item }">
                            <v-layout justify-center>
                                {{item.empl_class}}
                            </v-layout>
                        </template>
                        <template v-slot:item.fte="{ item }">
                            <span>{{item.fte ? item.fte.toFixed(2) : ''}}</span>
                        </template>
                        <template v-slot:item.annual_rt="{ item }">
                            <span>{{item.annual_rt ? Math.round(item.annual_rt).toLocaleString() : ''}}</span>
                        </template>

                        <template v-slot:item.posid="{ item }">
                            <span @click="openTab(item)" style="cursor: pointer">{{item.posid}}</span>
                        </template>
                    </v-data-table>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script>
    import {DataFrame} from 'data-forge';

    export default {
        name: 'home',
        data() {
            return {
                columns: [
                    'posid', 'name', 'jobcode_descr', 'deptid',
                    'empl_class', 'fte', 'annual_rt',
                ]
            }
        },
        mounted() {
            setTimeout(() => {
                if (this.bpc.length === 0) {
                    this.$forceUpdate()
                }
            }, 1)
        },
        computed: {
            bpc() {
                return new DataFrame(this.$store.getters.combinedBPC)
                    .distinct(r => r.posid)
                    .subset(this.columns)
                    .toArray()
            },
            bpcHeaders() {
                return this.columns.map(name => {
                    return {
                        text: name.replace(/_/g, " ").toUpperCase(),
                        value: name,
                        sortable: name != 'fte' & name != 'annual_rt'
                    }
                })
            },
            search() {
                return this.$store.state.search
            }
        },
        methods: {
            openTab(object) {
                let curr_state = this.$store.state.selected
                let look_in_state = curr_state.filter(item => {
                    return item.posid === object.posid
                })
                if (look_in_state.length === 0) {
                    this.$store.dispatch('addSelected', object)
                }
            }
        }
    }
</script>

<style>

</style>
