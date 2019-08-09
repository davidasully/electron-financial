<template>
    <div class="person" v-if="s">
        <v-layout align-start justify-start column fill-height class="mx-6 mt-2 grey--text ">
            <v-flex class="mb-n1">
                <v-layout>
                    <v-flex>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <h1 v-on="on">{{ pageTitle }}</h1>
                            </template>
                            <span>{{'EMPLID: ' + s.emplid}}</span>
                        </v-tooltip>
                    </v-flex>
                    <v-flex v-if="userCreated">
                        <template>
                            <v-layout justify-center>
                                <v-dialog v-model="confirmDeletePersonDialog" persistent max-width="290">
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
                                            {{`This action will permanently delete ${s.name} (ID: ${s.emplid}) and
                                            associated account distributions.`}}
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="error" text @click="confirmDeletePersonDialog = false">
                                                cancel
                                            </v-btn>
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
                <span>{{ pageSalary }}</span>
            </v-flex>
            <v-expand-transition>
                <div v-show="showMore | noAccounting">
                    <v-flex class="mb-n1">
                        <span>{{s.dept_descr}}</span>
                    </v-flex>
                    <v-flex>
                        <span>{{s.ben_elig_flg === 'Y' ? 'Benefit Eligible' : 'Not Benefit Eligible'}}</span>
                    </v-flex>
                    <v-flex class="mt-2">

                        <!--Begin account mapping form-->
                        <v-btn @click.stop="openAccountDialog" color="primary">{{(noAccounting ? 'Create ' : 'Modify ')
                            + 'Accounting'}}
                        </v-btn>

                        <v-dialog v-model="forecastDialog" persistent max-width="600px">
                            <template v-slot:activator="{ on }">
                                <v-btn v-on="on" color="primary" class="ml-2">Forecast</v-btn>
                            </template>
                            <v-form ref="form">
                                <v-card>
                                    <v-card-title>
                                        <span class="headline ml-4">Forecast
                                        <v-btn color="primary"
                                               class="ml-1"
                                               x-small
                                               @click="showForecastDetail = !showForecastDetail"
                                               rounded
                                               depressed
                                        >
                                        <v-icon v-if="showForecastDetail">expand_less</v-icon>
                                        <v-icon v-if="!showForecastDetail">expand_more</v-icon>
                                    </v-btn></span>
                                    </v-card-title>
                                    <v-card-text>
                                        <v-container grid-list-md>
                                            <v-layout wrap>
                                                <v-flex xs12 class="mb-2">
                                                    <v-layout row wrap class="title text-center">
                                                        <v-flex xs3>
                                                            <div class="caption grey--text">Original Budget</div>
                                                            <span>{{ totalStats.totalOrigBudgeted.toLocaleString() }}</span>
                                                        </v-flex>
                                                        <v-flex xs3>
                                                            <div class="caption grey--text">Current Budget</div>
                                                            <span>{{ totalStats.totalCurrBudgeted.toLocaleString() }}</span>
                                                        </v-flex>
                                                        <v-flex xs3>
                                                            <div class="caption grey--text">Total Committed</div>
                                                            <span>{{ Math.round(totalStats.totalCommited).toLocaleString() }}</span>
                                                        </v-flex>
                                                        <v-flex xs3>
                                                            <div class="caption grey--text">Current Forecasted</div>
                                                            <span>{{ Math.round(forecastData.slice(4,5)[0] + parseInt(totalStats.totalOrigBudgeted)).toLocaleString() }}</span>
                                                        </v-flex>
                                                        <v-expand-transition>
                                                             <v-flex xs12 v-show="showForecastDetail">
                                                                <v-layout row align-center>
                                                                    <v-flex xs3
                                                                            v-for="(qtr, i) in forecastData.slice(0,4)"
                                                                            :key="i"
                                                                    >
                                                                        <v-card height="75" flat :class="`grey lighten-4 ${qtr == 0 ? 'pt-3' : 'pt-1'}`">
                                                                            <div class="caption grey--text">
                                                                            {{`Quarter ${i + 1}`}}
                                                                            <v-btn x-small
                                                                                   icon
                                                                                   text
                                                                                   v-if="qtr !== 0"
                                                                                   @click.prevent="deleteForecast(i + 1)">
                                                                                <v-icon small color="error">close
                                                                                </v-icon>
                                                                            </v-btn>
                                                                        </div>
                                                                        <span>{{(qtr || 0).toLocaleString() }}</span>
                                                                        </v-card>
                                                                    </v-flex>
                                                                </v-layout>
                                                            </v-flex>
                                                        </v-expand-transition>
                                                    </v-layout>
                                                </v-flex>
                                                <v-flex xs7>
                                                    <v-select
                                                            :items="['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4']"
                                                            :rules="[v => !!v || 'Quarter selection required']"
                                                            label="Quarter"
                                                            required
                                                            v-model="forecast.quarter"
                                                    ></v-select>
                                                </v-flex>
                                                <v-flex xs5>
                                                    <v-text-field
                                                            label="Amount*"
                                                            :rules="[v => !!v || 'Forecast amount required']"
                                                            required
                                                            v-model="forecast.amt"
                                                    >
                                                    </v-text-field>
                                                </v-flex>
                                                <v-flex xs12>
                                                    <v-textarea
                                                            label="Notes"
                                                            filled
                                                            v-model="forecast.note"
                                                    ></v-textarea>
                                                </v-flex>
                                            </v-layout>
                                        </v-container>
                                    </v-card-text>
                                    <v-card-actions class="mt-n6">
                                        <v-spacer></v-spacer>
                                        <v-btn color="error" text @click="forecastDialog = !forecastDialog">Close
                                        </v-btn>
                                        <v-btn color="primary" @click.stop="submitForecast()">Submit</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-form>
                        </v-dialog>

                        <v-dialog v-model="accountMappingDialog" persistent max-width="600px">
                            <v-form ref="form">
                                <v-card class="pa-2">
                                    <v-card-title class="mx-4">
                                        <v-layout>
                                            <v-flex xs12 md8>
                                                <span class="headline">{{(noAccounting ? 'Create ' : 'Modify ') + 'Accounting'}}</span>
                                            </v-flex>
                                            <v-spacer></v-spacer>
                                            <v-flex xs12 md4>
                                                <v-btn @click="openShowAddAccount" color="primary" text>
                                                    Add New Account
                                                </v-btn>
                                            </v-flex>
                                        </v-layout>

                                    </v-card-title>
                                    <v-card-text>
                                        <v-container grid-list-md>

                                            <v-dialog
                                                    v-model="showEdit"
                                                    max-width="115px"
                                                    max-height="50"
                                                    hide-overlay
                                            >
                                                <v-card flat max-width="115">
                                                    <v-container>
                                                        <v-layout align-space-around justify-space-around row
                                                                  fill-height class="mx-3">
                                                            <v-flex xs12 class="mb-n3">
                                                                <v-text-field
                                                                        v-model="selectedEditValue"
                                                                        autofocus
                                                                        outlined
                                                                        full-width
                                                                ></v-text-field>
                                                            </v-flex>
                                                            <v-flex xs12>
                                                                <v-btn
                                                                        class="px-1"
                                                                        color="primary"
                                                                        @click.stop="saveSelectedEdit"
                                                                >
                                                                    update
                                                                </v-btn>
                                                            </v-flex>
                                                        </v-layout>
                                                    </v-container>
                                                </v-card>
                                            </v-dialog>


                                            <v-dialog
                                                    v-model="showAddAccount"
                                                    max-width="500px"
                                                    max-height="50"
                                                    hide-overlay
                                                    persistent
                                            >
                                                <v-card flat max-width="500">
                                                    <v-form ref="form2">
                                                        <v-container>
                                                            <v-layout align-space-around justify-space-around row
                                                                      fill-height class="mx-3">
                                                                <v-flex xs6 class="mb-n3">
                                                                    <v-text-field
                                                                            label="Cost Center"
                                                                            v-model="newCostCenter"
                                                                            autofocus
                                                                            outlined
                                                                            :rules="[v => !!v || 'Cost Center required']"
                                                                            required
                                                                    ></v-text-field>
                                                                </v-flex>
                                                                <v-flex xs6 class="mb-n3">
                                                                    <v-text-field
                                                                            label="Program/Grant"
                                                                            v-model="newWd2Cd"
                                                                            outlined
                                                                            :rules="[v => !!v || 'Program/Grant required']"
                                                                            required
                                                                    ></v-text-field>
                                                                </v-flex>
                                                                <v-flex>
                                                                    <v-layout class="mt-3">
                                                                        <v-spacer></v-spacer>
                                                                        <v-btn color="error" text
                                                                               @click="showAddAccount = false">
                                                                            Close
                                                                        </v-btn>
                                                                        <v-btn
                                                                                class="px-1"
                                                                                color="primary"
                                                                                @click.stop="addAccount"
                                                                        >
                                                                            Add Account
                                                                        </v-btn>
                                                                    </v-layout>
                                                                </v-flex>
                                                            </v-layout>
                                                        </v-container>
                                                    </v-form>
                                                </v-card>
                                            </v-dialog>


                                            <v-card flat v-for="(p, i) in accounts" :key="p.lkey" color="grey lighten-4"
                                                    class="mb-2">
                                                <v-layout row wrap class="pa-1">
                                                    <v-flex xs6 md4>
                                                        <div class="caption grey--text">Cost Center</div>
                                                        <v-tooltip bottom>
                                                            <template v-slot:activator="{ on }">
                                                                <span v-on="on">{{p.cost_center_reference_id}}</span>
                                                            </template>
                                                            <span>{{p.cost_center_name}}</span>
                                                        </v-tooltip>
                                                    </v-flex>
                                                    <v-flex xs6 md3>
                                                        <div class="caption grey--text">Program/Grant</div>
                                                        <v-tooltip bottom>
                                                            <template v-slot:activator="{ on }">
                                                                <span v-on="on">{{p.wd2_cd}}</span>
                                                            </template>
                                                            <span>{{p.wd2_name}}</span>
                                                        </v-tooltip>
                                                    </v-flex>
                                                    <v-flex xs6 md3>
                                                        <div class="text-center">
                                                            <div class="caption grey--text">Dist %*</div>
                                                            <span @click="openSelectedEdit(i, p.fct_dist_pct)">{{ p.fct_dist_pct || 0 }}</span>
                                                        </div>
                                                    </v-flex>
                                                    <v-flex xs6 md2>
                                                        <div class="caption grey--text">Forecast Dist</div>
                                                        <span>{{ p.dist_forecast }}</span>
                                                    </v-flex>
                                                </v-layout>
                                            </v-card>
                                        </v-container>
                                    </v-card-text>
                                    <v-card-actions class="mx-4">
                                        <span class="caption">*Click distribution percent text to edit.</span>
                                        <v-spacer></v-spacer>
                                        <v-btn color="error" text @click="accountMappingDialog = !accountMappingDialog">
                                            Close
                                        </v-btn>
                                        <v-btn color="primary" @click.stop="submitAccountMapping">
                                            Submit
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-form>
                        </v-dialog>
                        <!--End account mapping form-->

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
                        :key="p.lkey"
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
                        <v-divider v-if="showMore"></v-divider>
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

                    </v-card>
                </v-flex>
            </v-layout>

        </v-container>
    </div>
</template>

<script>
    const initialState = (showMore) => {
        return {
            showMore: showMore,
            showForecastDetail: false,
            confirmDeletePersonDialog: false,
            accountMappingDialog: false,
            dataTableDialog: false,
            forecastDialog: false,
            showEdit: false,
            showAddAccount: false,
            selectedEdit: '',
            selectedEditValue: '',
            newCostCenter: '',
            newWd2Cd: '',
            forecast: {
                quarter: '',
                amt: 0,
                note: ''
            },
            columns: ['emplid', 'position_nbr', 'cost_center_reference_id', 'wd2_cd'],
            accounts: []
        }
    };

    export default {
        name: "Person",
        props: ['posid'],
        data() {
            return initialState(false)
        },
        methods: {
            deletePerson(id) {
                this.$store.dispatch('deletePerson', id);
                this.$store.dispatch('removeSelected', this.posid);
                this.$router.push('/')
            },
            openAccountDialog() {
                this.accounts = this.person;
                this.accountMappingDialog = true;
            },
            openSelectedEdit(index, value) {
                this.selectedEditValue = value;
                this.selectedEdit = index;
                this.showEdit = true
            },
            openShowAddAccount() {
                this.showAddAccount = true;
                this.$refs.form2.resetValidation()
            },
            saveSelectedEdit() {
                let accounts = this.accounts;
                let editedObject = accounts[this.selectedEdit];
                editedObject.fct_dist_pct = this.selectedEditValue;
                accounts.splice(this.selectedEdit, 1, editedObject);
                this.accounts = accounts;
                this.showEdit = false
            },
            addAccount() {
                let valid = this.$refs.form2.validate();
                let curKeys = this.person.map(i => i.cost_center_reference_id + i.wd2_cd);
                let dupe = curKeys.includes(this.newCostCenter + this.newWd2Cd);
                if (valid && !dupe) {
                    this.accounts.unshift({
                        lkey: this.s.emplid + '-' + this.s.position_nbr + '-' + this.newCostCenter + '-' + this.newWd2Cd,
                        emplid: this.s.emplid,
                        position_nbr: this.s.position_nbr,
                        cost_center_reference_id: this.newCostCenter,
                        wd2_cd: this.newWd2Cd,
                        fct_dist_pct: 0
                    });
                    this.showAddAccount = false;
                    this.$refs.form2.resetValidation();
                } else {
                    if (dupe) {
                        this.$store.dispatch('openSnackbar', {
                            message: 'Duplicate account',
                            color: 'error',
                            timeout: 2000
                        })
                    }
                }
            },
            submitAccountMapping() {
                if (this.totalPercent === 100) {
                    let mapping = this.accounts.map(i => {
                        return {
                            uid: i.emplid,
                            pid: i.position_nbr,
                            cost_center_reference_id: i.cost_center_reference_id,
                            wd2_cd: i.wd2_cd,
                            fct_dist_pct: i.fct_dist_pct
                        }
                    });
                    this.$store.dispatch('addAccountMapping', mapping);
                    this.accountMappingDialog = false
                } else {
                    this.$store.dispatch('openSnackbar', {
                        message: 'Percentages must total 100',
                        color: 'error',
                        timeout: 2000
                    })
                }
            },
            submitForecast() {
                if (this.$refs.form.validate() && this.forecast.amt !== "0") {
                    let forecast = this.forecast;
                    let currForecast = this.forecastData;
                    currForecast.splice(4, 1); // Remove cumm element @ index 4
                    let currForecastTotal = currForecast.reduce((t, i) => t + i) + parseInt(this.totalStats.totalOrigBudgeted);
                    forecast['quarter'] = 'q' + forecast.quarter.slice(-1);
                    forecast['amt'] = (parseInt(forecast.amt) - currForecastTotal);
                    forecast['uid'] = this.s.emplid;
                    forecast['pid'] = this.s.position_nbr;
                    console.log(forecast)
                    this.$store.dispatch('addForecast', forecast);
                    this.$refs.form.resetValidation();
                    this.forecastDialog = false;
                    Object.assign(this.$data, initialState(true))
                }
            },
            deleteForecast(quarter) {
                this.$store.dispatch("deleteForecast", {
                    uid: this.s.emplid,
                    pid: this.s.position_nbr,
                    quarter: 'q' + quarter
                })
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
            forecastData() {
                let forecast = this.$store.getters.forecasts.filter(item => {
                    return item.skey === this.posid
                });
                if (forecast.length > 0) {
                    let f = ['q1', 'q2', 'q3', 'q4'].map(key => forecast[0][key]);
                    return [...f, f.reduce((t, i) => t + i)]
                } else {
                    return [0, 0, 0, 0, 0]
                }
            },
            s() {
                return (this.person || [])[0]
            },
            pageTitle() {
                let tag = this.s.empl_class ? ` (${this.s.empl_class})` : '';
                let name = this.genericName ? `${this.s.name} ${this.s.emplid}` : this.s.name;
                return name + tag
            },
            pageSalary() {
                let start = '';
                if (this.s.forecast_amt) {
                    start = `Forecast $${this.s.forecast_amt.toLocaleString()}`
                } else {
                    start = `$${(this.s.annual_rt || 0).toLocaleString()} /year`
                }
                return start + ` at ${(this.s.fte || 0).toFixed(2)} FTE`
            },
            totalPercent() {
                let acct = this.accounts;
                return acct.length > 0 ? acct.map(item => parseInt(item.fct_dist_pct)).reduce((t, v) => t + v) : 0
            },
            totalStats() {
                return {
                    totalCommited: this.person.map(item => item.total_committed_personal_services).reduce((t, v) => t + v),
                    totalOrigBudgeted: this.person.map(item => item.original_budget_personal_services).reduce((t, v) => t + v),
                    totalCurrBudgeted: this.person.map(item => item.current_budget_personal_services).reduce((t, v) => t + v)
                }
            },
            genericName() {
                return ['No Employee', 'Employee Group'].includes(this.s.name)
            },
            userCreated() {
                let personIds = this.$store.state.data.persons.map(item => item.id);
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