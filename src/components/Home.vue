<template>
    <div class="home">
        <v-container
                fluid
                fill-height
                class="mt-1"
        >
            <v-layout
                    justify-center
                    align-center
                    wrap
            >
                <v-flex xs12>
                    <v-switch
                            :label="`${opsOnly ? 'Operational' : 'All'} Accounts`"
                            class="ma-0"
                            v-model="opsOnly"
                    ></v-switch>
                </v-flex>
                <v-flex child-flex xs12>
                    <v-data-table
                            v-if="this.bpc.length > 0"
                            :headers="bpcHeaders"
                            :items="bpc"
                            :items-per-page="10"
                            :search="search"
                            item-key="posid"
                            show-select
                            class="mt-n2"
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
                            <v-layout justify-center>
                                <span>{{item.annual_rt ? Math.round(item.annual_rt).toLocaleString() : ''}}</span>
                            </v-layout>
                        </template>
                        <template v-slot:item.dist_forecast="{ item }">
                            <v-layout justify-center>
                                <span>{{Math.round(item.dist_forecast).toLocaleString()}}</span>
                            </v-layout>
                        </template>
                        <template v-slot:item.original_budget="{ item }">
                            <v-layout justify-center>
                                <span>{{item.original_budget.toLocaleString()}}</span>
                            </v-layout>
                        </template>
                        <template v-slot:item.total_committed="{ item }">
                            <v-layout justify-center>
                                <span>{{Math.round(item.total_committed).toLocaleString()}}</span>
                            </v-layout>
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

    const columns = ['posid', 'name', 'jobcode_descr', 'deptid', 'empl_class', 'fte', 'annual_rt'];

    export default {
        name: 'Home',
        data() {
            return {
                opsOnly: false
            }
        },
        mounted() {
            setTimeout(() => {
                if (this.bpc.length === 0) {
                    this.$forceUpdate()
                }
            }, 10000)
        },
        computed: {
            bpc() {
                return new DataFrame(this.$store.getters.combinedBPC)
                    .where(row => {
                        return this.opsOnly ? row.account_type === 'Operational' : true
                    })
                    .pivot(columns, {
                        original_budget_personal_services: {
                            original_budget: series => series.sum()
                        },
                        total_committed_personal_services: {
                            total_committed: series => series.sum()
                        },
                        dist_forecast: series => series.sum(),
                    })
                    .orderBy(row => row.name)
                    .toArray()
            },
            bpcHeaders() {
                let cols = [...columns, 'original_budget', 'total_committed', 'dist_forecast'];
                return cols.map(name => {
                    return {
                        text: name.replace(/_/g, " ").toUpperCase(),
                        value: name
                    }
                })
            },
            search() {
                return this.$store.state.search
            }
        },
        methods: {
            openTab(object) {
                let curr_state = this.$store.state.selected;
                let look_in_state = curr_state.filter(item => {
                    return item.posid === object.posid
                });
                if (look_in_state.length === 0) {
                    this.$store.dispatch('addSelected', object)
                }
            }
        }
    }
</script>

<style>

</style>
