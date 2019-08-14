<template>
    <v-container class="my-5">
        <v-layout
                justify-center
                align-center
        >
            <div v-once v-if="setup.data">
                <span>Last updated: {{ dataDate.toLocaleTimeString() }}</span>
                <Pivot :props="setup"></Pivot>
            </div>
        </v-layout>
    </v-container>
</template>

<script>
    import Pivot from './Pivot'

    export default {
        name: "PivotView",
        components: {
            Pivot
        },
        data() {
            return {
                setup: {
                    data: this.$store.state.data.bpc,
                    cols: ['account_type'],
                    rows: ['cost_center_name'],
                    vals: ['expense_actuals_personal_services'],
                    aggNm: 'Sum',
                    rendNm: 'Table'
                },
                dataDate: new Date()
            }
        }
    }
</script>

<style scoped>

</style>