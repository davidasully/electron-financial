import Vue from 'vue'
import Vuex from 'vuex'
import {DataFrame, Series} from 'data-forge';

const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: "./my-db.sqlite"
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
        set: {
            db: {
                file_loc: './my-db.sqlite',
            },
            quarter: 'q1'
        },
        search: '',
        selected: [],
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
            knex(table).insert(payload)
                .asCallback((err) => {
                    if (err) return console.error(err);
                    knex.select().from(table)
                        .asCallback((err, rows) => {
                            if (err) return console.error(err)
                            commit('loadMappedAccounts', rows)
                        })
                })
        }
    },
    getters: {
        tabs(state) {
            return state.selected.map(tab => {
                let generic = ['No Employee', 'Employee Group'].includes(tab.name);
                return {
                    name: (generic ? tab.name + ' ' + tab.posid.slice(0, 1) : tab.name) + ' (' + tab.posid.slice(-6) + ')',
                    posid: tab.posid
                }
            })
        },
        combinedBPC(state) {
            var bpc = state.data.bpc;

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
                let existingKeys = bpc.map(i => i.emplid + '-' + i.position_nbr + '-' + i.cost_center_reference_id + '-' + i.wd2_cd);
                let accounts = state.data.accounts.map(i => {
                    i['key'] = i.uid + '-' + i.pid + '-' + i.cost_center_reference_id + '-' + i.wd2_cd;
                    return i
                });
                let newAccounts = accounts.filter(i => !existingKeys.includes(i.key));
                if (newAccounts.length > 0) {
                    bpc = bpc.map(i => {
                        i['key'] = i.emplid + '-' + i.position_nbr;
                        return i
                    });
                    newAccounts = newAccounts.map(i => {
                        i['key'] = i.uid + '-' + i.pid;
                        return i
                    });

                    let columns = ['name', "emplid", "position_nbr", "jobcode_descr", "ten_status", "deptid", "dept_descr",
                        "empl_class", "paygroup", "empl_type", "ben_elig_flg", "fte", "annual_rt", "key"];

                    let bpcDF = new DataFrame(bpc);
                    let accts = new DataFrame(newAccounts);
                    let newRows = bpcDF.distinct(row => row.key)
                        .subset(columns)
                        .join(
                            accts,
                            left => left.key,
                            right => right.key,
                            (left, right) => {
                                return {
                                    name: left.name, emplid: left.emplid, position_nbr: left.position_nbr,
                                    ten_status: left.ten_status, deptid: left.deptid, dept_descr: left.dept_descr,
                                    empl_class: left.empl_class, paygroup: left.paygroup, empl_type: left.empl_type,
                                    ben_elig_flg: left.ben_elig_flg, fte: left.fte, annual_rt: left.annual_rt,
                                    cost_center_reference_id: right.cost_center_reference_id, wd2_cd: right.wd2_cd
                                }
                            }
                        )
                        .toArray();
                    console.log(newRows)
                    let mper = matchKeys(newRows, bpc);
                    let mbpc = matchKeys(bpc, newRows);
                    bpc = [...mper, ...mbpc];
                }
                bpc = bpc.map(i => {
                    i['key'] = i.emplid + '-' + i.position_nbr + '-' + i.cost_center_reference_id + '-' + i.wd2_cd;
                    i['fct_dist_pct'] = '';
                    return i
                });
                let bpcDF = new DataFrame(bpc);
                let accountDF = new DataFrame(accounts);
                bpc = bpcDF.joinOuterLeft(
                    accountDF,
                    left => left.key,
                    right => right.key,
                    (left, right) => {
                        let newLeft = Object.assign({}, left);
                        newLeft['fct_dist_pct'] = Object.assign({}, right).fct_dist_pct;
                        return newLeft
                    }
                )
                    .toArray()
            }

            if (state.data.forecasts.length > 0) {
                let forecasts = state.data.forecasts.map(i => {
                    i['key'] = i.uid + '-' + i.pid;
                    i['note'] = i.note ? i.quarter + ': ' + i.note : '';
                    i['q1'] = i.quarter === 'q1' ? i.amt : 0;
                    i['q2'] = i.quarter === 'q2' ? i.amt : 0;
                    i['q3'] = i.quarter === 'q3' ? i.amt : 0;
                    i['q4'] = i.quarter === 'q4' ? i.amt : 0;
                    return i
                });
                bpc = bpc.map(i => {
                    i['key'] = i.emplid + '-' + i.position_nbr;
                    return i
                });

                let bpcDF = new DataFrame(bpc);
                let forecastDF = new DataFrame(forecasts)
                    .pivot('key', {
                        q1: Series.sum,
                        q2: Series.sum,
                        q3: Series.sum,
                        q4: Series.sum,
                        note: Series.sum
                    })

                bpc = bpcDF.joinOuterLeft(
                    forecastDF,
                    left => left.key,
                    right => right.key,
                    (left, right) => {
                        let newLeft = Object.assign({}, left);
                        let newRight = (({q1, q2, q3, q4}) => ({q1, q2, q3, q4}))(Object.assign({}, right));
                        return {...newLeft, ...newRight}
                    }
                )
                    .toArray()
            }

            bpc = bpc.map(i => {
                i['key'] = i.emplid + '-' + i.position_nbr + '-' + i.cost_center_reference_id + '-' + i.wd2_cd;
                return i
            });
            return new DataFrame(bpc)
                .generateSeries({
                    posid: r => r.emplid + '-' + r.position_nbr,
                    name: r => r.name ? r.name : r.position_budget_type,
                    forecast: r => r.q1 + r.q2 + r.q3 + r.q4
                })
                .orderBy(row => row.name)
                .toArray()
        }
    }
});
