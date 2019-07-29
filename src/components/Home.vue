<template>
    <div class="home">

        <v-container
                fluid
                fill-height

        >
            <v-layout
                    justify-center
                    align-center
            >
                <v-flex shrink>
                    <v-data-table
                            v-if="showTable"
                            :headers="bpcHeaders"
                            :items="bpcData"
                            :items-per-page="10"
                            :search="search"
                            item-key="posid"
                            show-select
                            class="elevation-1"
                    >

                        <template v-slot:item.annual_rt="{ item }">
                            <span>{{item.annual_rt.toLocaleString()}}</span>
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

    const titleCase = (str) => {
        return str.replace(/_/g, " ").toLowerCase().split(' ').map(function (word) {
            return word.replace(word[0], word[0].toUpperCase());
        }).join(' ');
    }

    export default {
        data() {
            return {
                columns: [
                    'posid', 'name', 'jobcode_descr', 'deptid',
                    'ben_elig_flg', 'empl_class', 'annual_rt',
                ]
            }
        },
        computed: {
            bpc() {
                return this.$store.state.data.bpc
            },
            bpcData() {
                return new DataFrame(this.bpc)
                    .generateSeries({
                        posid: r => r.emplid + '-' + r.position_nbr
                    })
                    .subset(this.columns)
                    .distinct(r => r.posid)
                    .toArray()
            },
            bpcHeaders() {
                return this.columns.map(name => {
                    return {
                        text: titleCase(name),
                        value: name
                    }
                })
            },
            showTable() {
                return this.bpc.length > 0
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
                if (curr_state.length < 4 & look_in_state.length === 0 ) {
                    this.$store.dispatch('addSelected', object)
                    // this.$router.push('/person/' + object.posid)
                }
            }
        }
    }
</script>

<style>

</style>
