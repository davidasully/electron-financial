<template>
    <v-container class="my-5">
        <v-layout
                justify-center
                align-center
        >
            <Pivot v-once v-if="setup.data" :props="setup"></Pivot>
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
                }
            }
        }
    }
</script>

<style scoped>

</style>