import Vue from 'vue'
import Vuex from 'vuex'
import {commitAllResults} from "./sqlUtils";

Vue.use(Vuex)

export const store = new Vuex.Store({
    state: {
        set: {
            db: {
                file_loc: './my-db.sqlite',
                nms: {
                    bpc: 'chs_bpc_vw'
                }
            }
        },
        search: '',
        selected: [],
        data: {
            bpc: [],
            trans: []
        }
    },
    mutations: {
        loadBPC(state, payload) {
            state.data.bpc = payload
        },
        updateSelected(state, payload) {
            state.selected = payload;
        }
    },
    actions: {
        loadBPC({state}) {
            let table = state.set.db.nms.bpc;
            let sql = `SELECT * FROM ${table}`;
            commitAllResults(sql, 'loadBPC')
        },
        addSelected({commit, state}, payload) {
            let selected = state.selected
            selected.push(payload)
            commit('updateSelected', selected)
        },
        removeSelected({commit, state}, payload) {
            let selected = state.selected.filter(item => {
                return item.posid != payload
            })
            commit('updateSelected', selected)
        }
    },
    getters: {
        tabs(state) {
            return  state.selected.map(tab => {
                return {
                    name: `${tab.name} (${tab.posid.slice(-6)})`,
                    posid: tab.posid
                }
            })
        }
    }
})
