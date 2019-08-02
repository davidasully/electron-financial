<template>
    <div class="person" v-if="s">
        <v-layout align-start justify-start column fill-height class="mx-6 mt-2 grey--text ">
            <v-flex class="mb-n1">
                <v-layout>
                    <v-flex>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <h1 v-on="on">{{ `${s.name}${genericName ? ' ' + s.emplid + ' ' : '' }
                                    (${s.empl_class})`
                                    }}</h1>
                            </template>
                            <span>{{'EMPLID: ' + s.emplid}}</span>
                        </v-tooltip>
                    </v-flex>
                    <v-flex v-if="userCreated">
                        <template>

                            <v-layout justify-center>
                                <v-dialog v-model="dialog" persistent max-width="290">
                                    <template v-slot:activator="{ on }">
                                        <v-btn
                                                x-small
                                                icon
                                                text
                                                v-on="on"
                                        >
                                            <v-icon small>delete</v-icon>
                                        </v-btn>

                                    </template>
                                    <v-card>
                                        <v-card-title class="headline">Are you sure?</v-card-title>
                                        <v-card-text>
                                            {{`This action will permanently delete ${s.name} (ID: ${s.emplid}) and associated account distributions.`}}
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="error" text @click="dialog = false">cancel</v-btn>
                                            <v-btn color="primary" text @click="deletePerson(s.emplid)">delete</v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                            </v-layout>
                        </template>


                    </v-flex>
                </v-layout>
            </v-flex>
            <v-flex class="mb-1">
                <h3>
                    {{s.jobcode_descr}}
                    <v-btn color="primary"
                           class="ml-1"
                           x-small
                           @click="showMore = !showMore"
                           rounded
                           depressed
                    >
                        <v-icon v-if="showMore">expand_less</v-icon>
                        <v-icon v-if="!showMore">expand_more</v-icon>
                    </v-btn>
                </h3>
            </v-flex>
            <v-flex class="mb-n1">
                <span>{{(s.forecast_amt ? `Forecast $${s.forecast_amt.toLocaleString()}` : `$${s.annual_rt.toLocaleString()} /year`) + ` at ${s.fte.toFixed(2)} FTE`}}</span>
            </v-flex>
            <v-expand-transition>
                <div v-show="showMore">
                    <v-flex class="mb-n1">
                        <span>{{s.dept_descr}}</span>
                    </v-flex>
                    <v-flex>
                        <span>{{s.ben_elig_flg === 'Y' ? 'Benefit Eligible' : 'Not Benefit Eligible'}}</span>
                    </v-flex>
                </div>
            </v-expand-transition>
        </v-layout>

        <v-container
                fluid
                fill-height
        >
            <v-layout row wrap class="ma-2" v-if="!noAccounting">
                <v-flex
                        v-for="p in person"
                        :key="p.cost_center_reference_id + p.wd2_cd"
                        xs12 sm9 md6 lg4
                        class="pa-2"
                >
                    <v-card class="pa-7">
                        <v-layout>
                            <v-flex xs12>
                                <v-layout>
                                    <v-flex xs5 class="text-center">
                                        <div class="caption grey--text">Cost Center</div>
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <span class="title" v-on="on">{{p.cost_center_reference_id}}</span>
                                            </template>
                                            <span>{{p.cost_center_name}}</span>
                                        </v-tooltip>
                                    </v-flex>
                                    <v-flex xs2></v-flex>
                                    <v-flex xs5 class="text-center">
                                        <div class="caption grey--text">Program/Grant</div>
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <span class="title" v-on="on">{{p.wd2_cd}}</span>
                                            </template>
                                            <span>{{p.wd2_name}}</span>
                                        </v-tooltip>
                                    </v-flex>
                                </v-layout>
                                <v-layout class="py-2">
                                    <v-flex xs5 class="text-center">
                                        <div class="caption grey--text">Mapped</div>
                                        <div class="title">{{p.dist_pct + '%'}}</div>
                                    </v-flex>
                                    <v-flex xs2></v-flex>
                                    <v-flex xs5 class="text-center">
                                        <div class="caption grey--text">Total Commited PS</div>
                                        <div class="title">
                                            {{Math.round(p.total_committed_personal_services).toLocaleString()}}
                                        </div>
                                    </v-flex>
                                </v-layout>
                            </v-flex>
                        </v-layout>
                        <v-divider></v-divider>
                        <v-expand-transition>
                            <div class="mx-5 pr-2" v-show="showMore">
                                <v-layout row wrap>
                                    <v-flex sm12 md6>
                                        <v-layout>
                                            <v-flex class="text-center">
                                                <span class="overline">Original Budget</span>
                                            </v-flex>
                                        </v-layout>
                                        <v-layout flat row wrap>
                                            <v-flex xs5 class="text-center">
                                                <div class="caption grey--text">PS</div>
                                                <div>
                                                    {{Math.round(p.original_budget_personal_services).toLocaleString()}}
                                                </div>
                                            </v-flex>
                                            <v-flex xs2></v-flex>
                                            <v-flex xs5 class="text-center">
                                                <div class="caption grey--text">ERE</div>
                                                <div>
                                                    {{Math.round(p.original_budget_employee_related_expenses).toLocaleString()}}
                                                </div>
                                            </v-flex>
                                        </v-layout>
                                    </v-flex>
                                    <v-flex md1 hidden-sm-and-down>
                                        <v-divider vertical></v-divider>
                                    </v-flex>
                                    <v-flex xs12 md5>
                                        <v-layout>
                                            <v-flex class="text-center">
                                                <span class="overline">Current Budget</span>
                                            </v-flex>
                                        </v-layout>

                                        <v-layout flat row wrap>
                                            <v-flex xs5 class="text-center">
                                                <div class="caption grey--text">PS</div>
                                                <div>
                                                    {{Math.round(p.current_budget_personal_services).toLocaleString()}}
                                                </div>
                                            </v-flex>
                                            <v-flex xs2></v-flex>
                                            <v-flex xs5 class="text-center">
                                                <div class="caption grey--text">ERE</div>
                                                <div>
                                                    {{Math.round(p.current_budget_employee_related_expenses).toLocaleString()}}
                                                </div>
                                            </v-flex>
                                        </v-layout>
                                    </v-flex>
                                </v-layout>
                                <v-divider></v-divider>
                                <v-layout row wrap>
                                    <v-flex xs12 md6>
                                        <v-layout>
                                            <v-flex class="text-center">
                                                <span class="overline">Encumbrances</span>
                                            </v-flex>
                                        </v-layout>

                                        <v-layout flat row wrap>
                                            <v-flex xs5 class="text-center">
                                                <div class="caption grey--text">PS</div>
                                                <div>{{Math.round(p.encumbrance_personal_services).toLocaleString()}}
                                                </div>
                                            </v-flex>
                                            <v-flex xs2></v-flex>
                                            <v-flex xs5 class="text-center">
                                                <div class="caption grey--text">ERE</div>
                                                <div>
                                                    {{Math.round(p.encumbrance_employee_related_expenses).toLocaleString()}}
                                                </div>
                                            </v-flex>
                                        </v-layout>
                                    </v-flex>
                                    <v-flex md1 hidden-sm-and-down>
                                        <v-divider vertical></v-divider>
                                    </v-flex>
                                    <v-flex xs12 md5>
                                        <v-layout>
                                            <v-flex class="text-center">
                                                <span class="overline">Actuals</span>
                                            </v-flex>
                                        </v-layout>

                                        <v-layout flat row wrap>
                                            <v-flex xs5 class="text-center">
                                                <div class="caption grey--text">PS</div>
                                                <div>
                                                    {{Math.round(p.expense_actuals_personal_services).toLocaleString()}}
                                                </div>
                                            </v-flex>
                                            <v-flex xs2></v-flex>
                                            <v-flex xs5 class="text-center">
                                                <div class="caption grey--text">ERE</div>
                                                <div>
                                                    {{Math.round(p.expense_actuals_employee_related_expenses).toLocaleString()}}
                                                </div>
                                            </v-flex>
                                        </v-layout>
                                    </v-flex>
                                </v-layout>
                            </div>
                        </v-expand-transition>
                        <v-divider v-if="showMore"></v-divider>
                        <v-layout align-end justify-end row fill-height class="pt-2 mb-n4">
                            <!--                            <v-flex xs6 md3>-->
                            <!--                                <div class="text-center">-->
                            <!--                                    <v-btn color="error" outlined>delete</v-btn>-->
                            <!--                                </div>-->
                            <!--                            </v-flex>-->
                            <v-flex xs5>
                                <div class="text-center">
                                    <v-btn color="primary">forecast</v-btn>
                                </div>
                            </v-flex>
                        </v-layout>
                    </v-card>
                </v-flex>
            </v-layout>
            <div class="text-center ma-2" v-if="noAccounting">
                <br>
                <v-btn color="primary">Create New Distribution</v-btn>
            </div>
        </v-container>
    </div>
</template>

<script>
    export default {
        name: "Person",
        props: ['posid'],
        data() {
            return {
                showMore: false,
                dialog: false
            }
        },
        methods: {
            deletePerson(id) {
                this.$store.dispatch('deletePerson', id)
                this.$store.dispatch('removeSelected', this.posid)
                this.$router.push('/')
            }
        },
        computed: {
            person() {
                let posid = this.posid.split('-');
                let uid = posid[0];
                let pid = posid[1];
                return this.$store.getters.combinedBPC.filter(item => {
                    return item.position_nbr == pid & item.emplid == uid
                })
                    .sort((a, b) => (a.total_committed_personal_services > b.total_committed_personal_services) ? 1 : -1)
            },
            s() {
                return this.person[0]
            },
            genericName() {
                return ['No Employee', 'Employee Group'].includes(this.s.name)
            },
            userCreated() {
                let personIds = this.$store.state.data.persons.map(item => item.id)
                let uid = this.s.emplid;
                return personIds.includes(uid)
            },
            noAccounting() {
                return this.person.length <= 1 & !this.s.cost_center_reference_id
            }
        }
    }
</script>

<style scoped>

</style>