import Vue from 'vue'
import Vuex from 'vuex'
import {DataFrame, Series} from 'data-forge';
import router from './router'

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
            default_positions: [],
            persons: [],
            forecasts: [],
            accounts: []
        },
        loading: {}
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
            state.pivotTab = !state.pivotTab;
            if (state.pivotTab) router.push('/pivot');
            if (!state.pivotTab) router.push('/')
        },
        updateLoading(state, payload) {
            state.loading = Object.assign({}, payload)
        },
        loadBPC(state, payload) {
            state.data.bpc = payload;
            state.loading['bpc'] = false
        },
        loadDefaultPositions(state, payload) {
            state.data.default_positions = payload;
            state.loading['default_positions'] = false
        },
        loadPersons(state, payload) {
            state.data.persons = payload;
            state.loading['persons'] = false
        },
        loadForecasts(state, payload) {
            state.data.forecasts = payload;
            state.loading['forecasts'] = false
        },
        loadMappedAccounts(state, payload) {
            state.data.accounts = payload;
            state.loading['accounts'] = false
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
        updateLoading({commit, state}, payload) {
            let loading = Object.assign({}, state.loading);
            loading[payload.source] = payload.value;
            commit('updateLoading', loading)
        },
        sqlError({commit, dispatch}, err) {
            // eslint-disable-next-line no-console
            console.error(err);
            dispatch('updateLoading', {source: 'bpc', value: false});
            dispatch('updateLoading', {source: 'default_positions', value: false});
            dispatch('updateLoading', {source: 'persons', value: false});
            dispatch('updateLoading', {source: 'forecasts', value: false});
            dispatch('updateLoading', {source: 'accounts', value: false});
            commit('openSnackbar', {
                message: 'There was a database error.',
                color: 'error',
                timeout: 30000,
                btn: {
                    text: 'Reload',
                    to: 'Reload'
                }
            })
        },
        loadBPC({commit, dispatch}) {
            let table = 'bpc';
            dispatch('updateLoading', {source: 'bpc', value: true});
            knex.select().table(table)
                .asCallback((err, rows) => {
                    if (err) return dispatch('sqlError', err);
                    commit('loadBPC', rows)
                });
        },
        loadPersons({commit, dispatch}) {
            let table = 'person';
            dispatch('updateLoading', {source: 'persons', value: true});
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
                        if (err) return dispatch('sqlError', err);
                        commit('loadPersons', rows)
                    })
            })
        },
        loadForecasts({commit, dispatch}) {
            let table = 'forecast';
            dispatch('updateLoading', {source: 'forecasts', value: true});
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
                        if (err) return dispatch('sqlError', err);
                        commit('loadForecasts', rows)
                    })
            })
        },
        loadMappedAccounts({commit, dispatch}) {
            let table = 'account';
            dispatch('updateLoading', {source: 'accounts', value: true});
            knex.schema.hasTable(table).then(exists => {
                if (!exists) {
                    return knex.schema.createTable(table, t => {
                        t.unique(['uid', 'pid', 'cost_center_reference_id', 'wd2_cd']);
                        t.string('uid', 10);
                        t.string('pid', 10);
                        t.string('cost_center_reference_id', 10);
                        t.string('wd2_cd', 10);
                        t.integer('total_original_budget');
                        t.decimal('fct_dist_pct');
                        t.timestamp('created_at').defaultTo(knex.fn.now());
                    })
                }
                knex.select().from(table)
                    .asCallback((err, rows) => {
                        if (err) return dispatch('sqlError', err);
                        commit('loadMappedAccounts', rows)
                    })
            })
        },
        loadDefaultPositions({commit, dispatch}) {
            let table = 'default_positions';
            dispatch('updateLoading', {source: 'default_positions', value: true});
            knex.select().table(table)
                .asCallback((err, rows) => {
                    if (err) return dispatch('sqlError', err);
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
        addPerson({commit, dispatch}, payload) {
            let table = 'person';
            dispatch('updateLoading', {source: 'persons', value: true});
            knex(table).insert(payload)
                .asCallback((err) => {
                    if (err) return dispatch('sqlError', err);
                    dispatch('openSnackbar', {
                        message: 'New line added successfully.',
                        color: 'success',
                        timeout: 5000
                    });
                    knex.select().from(table)
                        .asCallback((err, rows) => {
                            if (err) return dispatch('sqlError', err);
                            commit('loadPersons', rows)
                        })
                })
        },
        deletePerson({dispatch}, payload) {
            let table = 'person';
            dispatch('updateLoading', {source: 'persons', value: true});
            knex(table).where('id', payload).del()
                .asCallback(err => {
                    if (err) return dispatch('sqlError', err);
                    dispatch('openSnackbar', {
                        message: 'Line deleted successfully.',
                        color: 'success',
                        timeout: 5000
                    });
                    dispatch('loadPersons')
                })
        },
        deleteForecast({dispatch}, payload) {
            let table = 'forecast';
            dispatch('updateLoading', {source: 'forecasts', value: true});
            knex(table)
                .where('uid', payload.uid)
                .andWhere('pid', payload.pid)
                .andWhere('quarter', payload.quarter)
                .del()
                .asCallback(err => {
                    if (err) return dispatch('sqlError', err);
                    dispatch('openSnackbar', {
                        message: 'Forecast deleted successfully.',
                        color: 'success',
                        timeout: 5000
                    });
                    dispatch('loadForecasts')
                })
        },
        addForecast({commit, dispatch}, payload) {
            let table = 'forecast';
            dispatch('updateLoading', {source: 'forecasts', value: true});
            knex(table).insert(payload)
                .asCallback((err) => {
                    if (err) return dispatch('sqlError', err);
                    knex.select().from(table)
                        .asCallback((err, rows) => {
                            if (err) return dispatch('sqlError', err);
                            dispatch('openSnackbar', {
                                message: 'Forecast added successfully.',
                                color: 'success',
                                timeout: 5000
                            });
                            commit('loadForecasts', rows)
                        })
                })
        },
        addAccountMapping({commit, dispatch}, payload) {
            let table = 'account';
            dispatch('updateLoading', {source: 'accounts', value: true});
            knex(table)
                .where('uid', payload[0].uid)
                .andWhere('pid', payload[0].pid)
                .del()
                .asCallback(err => {
                    if (err) return dispatch('sqlError', err);
                    knex(table).insert(payload)
                        .asCallback((err) => {
                            if (err) return dispatch('sqlError', err);
                            dispatch('openSnackbar', {
                                message: 'Account mapping added successfully.',
                                color: 'success',
                                timeout: 5000
                            });
                            knex.select().from(table)
                                .asCallback((err, rows) => {
                                    if (err) return dispatch('sqlError', err);
                                    commit('loadMappedAccounts', rows)
                                })
                        })
                })
        }
    },
    getters: {
        ccDescr(state) {
            return new DataFrame(state.data.bpc)
                .subset(['cost_center_reference_id', 'cost_center_name'])
                .distinct(row => row.cost_center_reference_id)
                .toArray()
        },
        wd2Descr(state) {
            return new DataFrame(state.data.bpc)
                .subset(['wd2_cd', 'wd2_name', 'account_type', 'account_type_detail'])
                .distinct(row => row.wd2_cd)
                .toArray()
        },
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
                    let ccDescr = new DataFrame(getters.ccDescr);
                    let wd2Descr = new DataFrame(getters.wd2Descr)
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
                        .joinOuterLeft(
                            ccDescr,
                            left => left.cost_center_reference_id,
                            right => right.cost_center_reference_id,
                            (left, right) => {
                                let newLeft = Object.assign({}, left);
                                newLeft['cost_center_name'] = Object.assign({}, right).cost_center_name;
                                return newLeft
                            }
                        )
                        .joinOuterLeft(
                            wd2Descr,
                            left => left.wd2_cd,
                            right => right.wd2_cd,
                            (left, right) => {
                                let newLeft = Object.assign({}, left);
                                let newRight = Object.assign({}, right);
                                newLeft['wd2_name'] = newRight.wd2_name;
                                newLeft['account_type'] = newRight.account_type;
                                newLeft['account_type_detail'] = newRight.account_type_detail;
                                return newLeft
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
                        let newRight = Object.assign({}, right);
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
            let ereRates = new DataFrame(state.data.default_positions)
                .subset(['type', 'type_name', 'empl_class', 'ben_elig_flg', 'ere_rt'])
                .distinct(row => row.empl_class + '-' + row.ben_elig_flg)
                .generateSeries({
                    type_name: r => r.type_name.replace('Summary - ', '').replace('New-', '')
                });

            return new DataFrame(bpc)
                .joinOuterLeft(
                    ereRates,
                    left => left.empl_class + '-' + left.ben_elig_flg,
                    right => right.empl_class + '-' + right.ben_elig_flg,
                    (left, right) => {
                        let newLeft = Object.assign({}, left);
                        let newRight = (({type, type_name, ere_rt}) => ({
                            type,
                            type_name,
                            ere_rt
                        }))(Object.assign({}, right));
                        return {...newLeft, ...newRight}
                    }
                )
                .joinOuterLeft(
                    ereRates,
                    left => left.position_nbr,
                    right => right.type,
                    (left, right) => {
                        let newLeft = Object.assign({}, left);
                        if (!newLeft['type']) {
                            let newRight = (({type, type_name, ere_rt}) => ({
                                type,
                                type_name,
                                ere_rt
                            }))(Object.assign({}, right));
                            return {...newLeft, ...newRight}
                        }
                        return newLeft
                    }
                )
                .generateSeries({
                    posid: r => r.skey,
                    name: r => r.name || r.position_budget_type,
                    jobcode_descr: r => r.jobcode_descr === 'NA' && !r.type ? r.type_name : r.jobcode_descr,
                    forecast: r => (r.q1 + r.q2 + r.q3 + r.q4) || 0,
                    dist_forecast: r => ((r.fct_dist_pct || 0) / 100) * r.forecast,
                    total_dist_forecast: r => ((r.fct_dist_pct || 0) / 100) * (r.forecast + (r.total_original_budget || 0)),
                    current_forecast: r => r.total_dist_forecast || (r.original_budget_personal_services || 0),
                    dist_forecast_ere: r => r.current_forecast * (r.ere_rt || 0)
                })
                .orderBy(row => row.name)
                .toArray()
        }
    }
});
