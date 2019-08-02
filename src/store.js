import Vue from 'vue'
import Vuex from 'vuex'
import {DataFrame} from 'data-forge';

const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: "./my-db.sqlite"
    },
    useNullAsDefault: true
});

Vue.use(Vuex)

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
        data: {
            bpc: [],
            trans: [],
            default_positions: [],
            persons: []
        }
    },
    mutations: {
        loadBPC(state, payload) {
            state.data.bpc = payload
        },
        loadDefaultPositions(state, payload) {
            state.data.default_positions = payload
        },
        loadPersons(state, payload) {
            state.data.persons = payload
        },
        updateSelected(state, payload) {
            state.selected = payload;
        }
    },
    actions: {
        loadBPC({commit}) {
            let table = 'bpc'
            knex.select().table(table)
                .asCallback((err, rows) => {
                    if (err) return console.error(err);
                    commit('loadBPC', rows)
                });
        },
        loadPersons({commit}) {
            let table = 'person'
            knex.schema.hasTable(table).then(exists => {
                if (!exists) {
                    return knex.schema.createTable(table, t => {
                        t.increments('id').primary();
                        t.string('type', 7);
                        t.string('uid', 10);
                        t.string('name', 100);
                        t.string('pid', 10);
                        t.decimal('fte');
                        t.integer('amt');
                        t.string('note');
                        t.string('quarter', 2);
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
                return item.posid != payload
            })
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
            let bpc = state.data.bpc;
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
                                fte: left.fte,
                                forecast_amt: left.amt,
                                note: left.note
                            }
                        }
                    )
                    .toArray();

                let mper = matchKeys(persons, bpc);
                let mbpc = matchKeys(bpc, persons);
                var comb = [...mper, ...mbpc];
            } else {
                var comb = new DataFrame(bpc)
            }

            return new DataFrame(comb)
                .generateSeries({
                    posid: r => r.emplid + '-' + r.position_nbr,
                    name: r => r.name ? r.name : r.position_budget_type
                })
                .toArray()
        }
    }
})
