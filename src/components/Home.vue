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
                    <v-layout child-flex wrap row>
                        <v-flex xs6 md2>
                            <v-select
                                    single-line
                                    label="Account Types"
                                    class="mt-0 ml-3"
                                    :items="accountSelectOptions"
                                    v-model="accountSelect"
                            ></v-select>
                        </v-flex>
                        <v-flex xs6 md3>
                            <v-autocomplete
                                    multiple
                                    dense
                                    single-line
                                    clearable
                                    hide-no-data
                                    label="Cost Center"
                                    class="mt-0 pl-1"
                                    :items="ccDescr"
                                    v-model="ccSelect"
                            >
                                <template v-slot:selection="{ item, index }">
                                    <span v-if="index === 0">{{ truncName(item, 30, ccSelect.length > 1) }}</span>
                                    <span v-if="index === 1"
                                          class="grey--text caption"
                                    > (+{{ ccSelect.length - 1 }} others)</span>
                                </template>
                                <template v-slot:prepend-item>
                                    <v-list-item
                                            ripple
                                            @click="selectAllCostCenter"
                                    >
                                        <v-list-item-content>
                                            <v-list-item-title>Select All</v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                    <v-divider class="mt-2"></v-divider>
                                </template>
                            </v-autocomplete>
                        </v-flex>
                        <v-flex xs6 md3>
                            <v-autocomplete
                                    multiple
                                    dense
                                    single-line
                                    clearable
                                    hide-no-data
                                    label="Program"
                                    class="mt-0 pl-1"
                                    :items="wd2Descr"
                                    v-model="wd2Select"
                            >
                                <template v-slot:selection="{ item, index }">
                                    <span v-if="index === 0">{{ truncName(item, 30, wd2Select.length > 1) }}</span>
                                    <span
                                            v-if="index === 1"
                                            class="grey--text caption"
                                    > (+{{ wd2Select.length - 1 }} others)</span>
                                </template>
                                <template v-slot:prepend-item>
                                    <v-list-item
                                            ripple
                                            @click="selectAllWd2"
                                    >
                                        <v-list-item-content>
                                            <v-list-item-title>Select All</v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                    <v-divider class="mt-2"></v-divider>
                                </template>
                            </v-autocomplete>
                        </v-flex>
                    </v-layout>
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
                        <template v-slot:item.total_forecast="{ item }">
                            <v-layout justify-center>
                                <span>{{Math.round(item.total_forecast || 0).toLocaleString()}}</span>
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
                accountSelectOptions: ['All', 'Operational', 'Non-Operational'],
                accountSelect: 'All',
                ccSelect: [],
                wd2Select: []
            }
        },
        mounted() {
            setTimeout(() => {
                if (this.bpc.length === 0) {
                    this.$forceUpdate()
                }
            }, 10000)
        },
        activated() {
            this.$store.state.searchActive = true
        },
        deactivated() {
            this.$store.state.searchActive = false
        },
        computed: {
            ccDescr() {
                let ccDescr = this.$store.getters.ccDescr;
                if (!ccDescr) {
                    return []
                }
                return ccDescr.map(i => {
                    return i.cost_center_reference_id + '-' + i.cost_center_name
                })
            },
            wd2Descr() {
                let wd2Descr = this.$store.getters.wd2Descr;
                if (!wd2Descr) {
                    return []
                }
                return wd2Descr.map(i => {
                    return i.wd2_cd + '-' + i.wd2_name
                })
            },
            bpc() {
                return new DataFrame(this.$store.getters.combinedBPC)
                    .where(row => {
                        let show = [true];
                        if (this.accountSelect === 'Operational') {
                            show.push(row.account_type === 'Operational')
                        }
                        if (this.accountSelect === 'Non-Operational') {
                            show.push(row.account_type !== 'Operational')
                        }
                        if (this.ccSelect.length > 0) {
                            show.push(this.ccSelect.map(i => i.split('-')[0]).includes(row.cost_center_reference_id))
                        }
                        if (this.wd2Select.length > 0) {
                            show.push(this.wd2Select.map(i => i.split('-')[0]).includes(row.wd2_cd))
                        }
                        return show.every(i => i)
                    })
                    .pivot(columns, {
                        original_budget_personal_services: {
                            original_budget: series => series.sum()
                        },
                        total_committed_personal_services: {
                            total_committed: series => series.sum()
                        },
                        current_forecast: {
                            total_forecast: series => series.sum()
                        }
                    })
                    .orderBy(row => row.name)
                    .toArray()
            },
            bpcHeaders() {
                let cols = [...columns, 'original_budget', 'total_committed', 'total_forecast'];
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
            truncName(x, len, mult) {
                let desiredLen = len;
                let othersTxtLen = 12;
                if (mult) {
                    desiredLen -= othersTxtLen
                }
                let result = x;
                if (x.length > len) {
                    desiredLen -= 3;
                    result = x.slice(0, desiredLen) + '...'
                }
                return result + ' '
            },
            selectAllCostCenter() {
                this.$nextTick(() => {
                    this.ccSelect = this.ccDescr.slice()
                })
            },
            selectAllWd2() {
                this.$nextTick(() => {
                    this.wd2Select = this.wd2Descr.slice()
                })
            },
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
