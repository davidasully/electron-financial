import Vue from 'vue'
import Vuex from 'vuex'
import {DataFrame, Series} from 'data-forge';

const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: "\\\\itfs1.asu.edu\\health\\shared\\Business Services\\Finance\\Budget\\FY20\\fy20-app-db.sqlite"
    },
    useNullAsDefault: true
});

Vue.use(Vuex);

const matchKeys = (array1, array2) => {
    let object2 = array2[0];
    if (!object2) {
        return []
    }
    let match = Object.keys(object2);
    return array1.map(item => {
        let keys = Object.keys(item);
        match.forEach(nm => {
            if (!keys.includes(nm)) {
                item[nm] = ''
            }
        });
        return item
    })
};

export const store = new Vuex.Store({
    state: {
        search: '',
        selected: [],
        pivotTab: false,
        snackbar: {
            active: false,
            message: '',
            color: '',
            timeout: 0,
            btn: {
                text: '',
                to: ''
            }
        },
        data: {
            bpc: [],
            trans: [],
            default_positions: [],
            persons: [],
            forecasts: [],
            accounts: []
        }
    },
    mutations: {
        openSnackbar(state, payload) {
            let snackSet = payload;
            snackSet['active'] = true;
            let btn = Object.assign({}, snackSet['btn']);
            snackSet['btn'] = Object.assign({}, btn.text ? btn : {text: '', to: ''});
            Object.assign(state.snackbar, snackSet)
        },
        togglePivotTab(state) {
            state.pivotTab = !state.pivotTab
        },
        loadBPC(state, payload) {
            state.data.bpc = payload
        },
        loadDefaultPositions(state, payload) {
            state.data.default_positions = payload
        },
        loadPersons(state, payload) {
            state.data.persons = payload
        },
        loadForecasts(state, payload) {
            state.data.forecasts = payload
        },
        loadMappedAccounts(state, payload) {
            state.data.accounts = payload
        },
        updateSelected(state, payload) {
            state.selected = payload;
        }
    },
    actions: {
        togglePivotTab({commit}) {
            commit('togglePivotTab')
        },
        openSnackbar({commit}, payload) {
            commit('openSnackbar', payload)
        },
        loadBPC({commit}) {
            let table = 'bpc';
            knex.select().table(table)
                .asCallback((err, rows) => {
                    if (err) return console.error(err);
                    commit('loadBPC', rows)
                });
        },
        loadPersons({commit}) {
            let table = 'person';
            knex.schema.hasTable(table).then(exists => {
                if (!exists) {
                    return knex.schema.createTable(table, t => {
                        t.increments('id').primary();
                        t.string('type', 7);
                        t.string('uid', 10);
                        t.string('name', 100);
                        t.string('pid', 10);
                        t.string('deptid', 8);
                        t.decimal('fte');
                        t.timestamp('created_at').defaultTo(knex.fn.now());
                    })
                }
                knex.select().from(table)
                    .asCallback((err, rows) => {
                        if (err) return console.error(err);
                        commit('loadPersons', rows)
                    })
            })
        },
        loadForecasts({commit}) {
            let table = 'forecast';
            knex.schema.hasTable(table).then(exists => {
                if (!exists) {
                    return knex.schema.createTable(table, t => {
                        t.unique(['uid', 'pid', 'quarter']);
                        t.string('uid', 10);
                        t.string('pid', 10);
                        t.string('quarter', 2);
                        t.integer('amt');
                        t.string('note');
                        t.timestamp('created_at').defaultTo(knex.fn.now());
                    })
                }
                knex.select().from(table)
                    .asCallback((err, rows) => {
                        if (err) return console.error(err);
                        commit('loadForecasts', rows)
                    })
            })
        },
        loadMappedAccounts({commit}) {
            let table = 'account';
            knex.schema.hasTable(table).then(exists => {
                if (!exists) {
                    return knex.schema.createTable(table, t => {
                        t.unique(['uid', 'pid', 'cost_center_reference_id']);
                        t.string('uid', 10);
                        t.string('pid', 10);
                        t.string('cost_center_reference_id', 10);
                        t.string('wd2_cd', 10);
                        t.integer('total_original_budget');
                        t.string('fct_dist_pct', 3);
                        t.timestamp('created_at').defaultTo(knex.fn.now());
                    })
                }
                knex.select().from(table)
                    .asCallback((err, rows) => {
                        if (err) return console.error(err);
                        commit('loadMappedAccounts', rows)
                    })
            })
        },
        loadDefaultPositions({commit}) {
            let table = 'default_positions';
            knex.select().table(table)
                .asCallback((err, rows) => {
                    if (err) return console.error(err);
                    commit('loadDefaultPositions', rows)
                })
        },
        addSelected({commit, state}, payload) {
            let selected = state.selected;
            selected.push(payload);
            commit('updateSelected', selected)
        },
        removeSelected({commit, state}, payload) {
            let selected = state.selected.filter(item => {
                return item.posid !== payload
            });
            commit('updateSelected', selected)
        },
        addPerson({commit}, payload) {
            let table = 'person';
            knex(table).insert(payload)
                .asCallback((err) => {
                    if (err) return console.error(err);
                    knex.select().from(table)
                        .asCallback((err, rows) => {
                            if (err) return console.error(err)
                            commit('loadPersons', rows)
                        })
                })
        },
        deletePerson({dispatch}, payload) {
            let table = 'person';
            knex(table).where('id', payload).del()
                .asCallback(err => {
                    if (err) return console.error(err);
                    dispatch('loadPersons')
                })
        },
        deleteForecast({dispatch}, payload) {
            let table = 'forecast';
            knex(table)
                .where('uid', payload.uid)
                .andWhere('pid', payload.pid)
                .andWhere('quarter', payload.quarter)
                .del()
                .asCallback(err => {
                    if (err) return console.error(err);
                    dispatch('loadForecasts')
                })
        },
        addForecast({commit}, payload) {
            let table = 'forecast';
            knex(table).insert(payload)
                .asCallback((err) => {
                    if (err) return console.error(err);
                    knex.select().from(table)
                        .asCallback((err, rows) => {
                            if (err) return console.error(err)
                            commit('loadForecasts', rows)
                        })
                })
        },
        addAccountMapping({commit}, payload) {
            let table = 'account';
            console.log(payload)
            knex(table)
                .where('uid', payload[0].uid)
                .andWhere('pid', payload[0].pid)
                .del()
                .asCallback(err => {
                    if (err) return console.error(err);
                    knex(table).insert(payload)
                    .asCallback((err) => {
                        if (err) return console.error(err);
                        knex.select().from(table)
                            .asCallback((err, rows) => {
                                if (err) return console.error(err)
                                commit('loadMappedAccounts', rows)
                            })
                    })
                })
        }
    },
    getters: {
        forecasts(state) {
            let forecast = state.data.forecasts.map(i => {
                i['skey'] = i.uid + '-' + i.pid;
                i['note'] = i.note ? i.quarter.toUpperCase() + ': ' + i.note + ' ' : '';
                i['q1'] = i.quarter === 'q1' ? i.amt : 0;
                i['q2'] = i.quarter === 'q2' ? i.amt : 0;
                i['q3'] = i.quarter === 'q3' ? i.amt : 0;
                i['q4'] = i.quarter === 'q4' ? i.amt : 0;
                return i
            });
            return new DataFrame(forecast)
                .pivot('skey', {
                    q1: Series.sum,
                    q2: Series.sum,
                    q3: Series.sum,
                    q4: Series.sum,
                    note: Series.sum
                })
                .toArray()
        },
        tabs(state) {
            return state.selected.map(tab => {
                let generic = ['No Employee', 'Employee Group'].includes(tab.name);
                return {
                    name: (generic ? tab.name + ' ' + tab.posid.slice(0, 1) : tab.name) + ' (' + tab.posid.slice(-6) + ')',
                    posid: tab.posid
                }
            })
        },
        combinedBPC(state, getters) {
            let bpc = state.data.bpc.map(i => {
                i['skey'] = i.emplid + '-' + i.position_nbr;
                i['lkey'] = i.skey + '-' + i.cost_center_reference_id + '-' + i.wd2_cd;
                return i
            });
            if (state.data.persons.length > 0) {
                let submitted_persons = state.data.persons;
                let default_positions = state.data.default_positions;
                let default_positions_df = new DataFrame(default_positions);

                let persons = new DataFrame(submitted_persons)
                    .join(
                        default_positions_df,
                        left => left.type,
                        right => right.type,

                        (left, right) => {
                            return {
                                skey: (left.uid || left.id) + (left.pid || left.type),
                                pid: left.id,
                                type: left.type,
                                jobcode_descr: right.type_name,
                                emplid: left.uid || left.id,
                                name: left.name || right.name_default,
                                position_nbr: left.pid || left.type,
                                empl_class: right.empl_class,
                                ben_elig_flg: right.ben_elig_flg,
                                deptid: left.deptid,
                                fte: left.fte
                            }
                        }
                    )
                    .toArray();

                let mper = matchKeys(persons, bpc);
                let mbpc = matchKeys(bpc, persons);
                bpc = [...mper, ...mbpc];
            }

            if (state.data.accounts.length > 0) {
                let accounts = state.data.accounts.map(i => {
                    i['lkey'] = i.uid + '-' + i.pid + '-' + i.cost_center_reference_id + '-' + i.wd2_cd;
                    i['skey'] = i.uid + '-' + i.pid;
                    return i
                });
                let newAccounts = accounts.filter(i => !bpc.map(r => r.lkey).includes(i.lkey));
                if (newAccounts.length > 0) {
                    let columns = ['name', "emplid", "position_nbr", "jobcode_descr", "ten_status", "deptid", "dept_descr",
                        "empl_class", "paygroup", "empl_type", "ben_elig_flg", "fte", "annual_rt", "skey", "lkey"];

                    let bpcDF = new DataFrame(bpc);
                    let accts = new DataFrame(newAccounts);
                    let newRows = bpcDF.distinct(row => row.skey)
                        .subset(columns)
                        .join(
                            accts,
                            left => left.skey,
                            right => right.skey,
                            (left, right) => {
                                return {
                                    name: left.name, emplid: left.emplid, position_nbr: left.position_nbr,
                                    ten_status: left.ten_status, deptid: left.deptid, dept_descr: left.dept_descr,
                                    empl_class: left.empl_class, paygroup: left.paygroup, empl_type: left.empl_type,
                                    ben_elig_flg: left.ben_elig_flg, fte: left.fte, annual_rt: left.annual_rt,
                                    cost_center_reference_id: right.cost_center_reference_id, wd2_cd: right.wd2_cd,
                                    jobcode_descr: left.jobcode_descr, lkey: right.lkey, skey: right.skey
                                }
                            }
                        )
                        .toArray();
                    let mper = matchKeys(newRows, bpc);
                    let mbpc = matchKeys(bpc, newRows);
                    bpc = [...mper, ...mbpc];
                }
                let bpcDF = new DataFrame(bpc);
                let accountDF = new DataFrame(accounts);
                bpc = bpcDF.joinOuterLeft(
                    accountDF,
                    left => left.lkey,
                    right => right.lkey,
                    (left, right) => {
                        let newLeft = Object.assign({}, left);
                        let newRight = Object.assign({}, right)
                        newLeft['fct_dist_pct'] = newRight.fct_dist_pct;
                        newLeft['total_original_budget'] = newRight.total_original_budget;
                        return newLeft
                    }
                )
                    .toArray()
            }

            if (state.data.forecasts.length > 0) {
                let bpcDF = new DataFrame(bpc);
                let forecastDF = new DataFrame(getters.forecasts);

                bpc = bpcDF.joinOuterLeft(
                    forecastDF,
                    left => left.skey,
                    right => right.skey,
                    (left, right) => {
                        let newLeft = Object.assign({}, left);
                        let newRight = (({q1, q2, q3, q4}) => ({q1, q2, q3, q4}))(Object.assign({}, right));
                        return {...newLeft, ...newRight}
                    }
                )
                    .toArray()
            }
            return new DataFrame(bpc)
                .generateSeries({
                    posid: r => r.skey,
                    name: r => r.name || r.position_budget_type,
                    forecast: r => r.q1 + r.q2 + r.q3 + r.q4,
                    dist_forecast: r => ((r.fct_dist_pct || 0) / 100) * (r.forecast + r.total_original_budget) || r.original_budget_personal_services
                })
                .orderBy(row => row.name)
                .toArray()
        }
    }
});
